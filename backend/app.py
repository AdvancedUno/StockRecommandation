from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
from datetime import datetime
import yfinance as yf
from flask_cors import CORS
from scipy.optimize import minimize

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    symbols = data.get('symbols', [])
    target_return = data.get('target_return', None)  # User-defined target return
    start_date = data.get('start_date', '2022-01-01')
    end_date = data.get('end_date', datetime.today().strftime('%Y-%m-%d'))

    if not symbols:
        return jsonify({"error": "No stock symbols provided"}), 400

    stock_data = {}
    for symbol in symbols:
        try:
            stock_df = yf.download(symbol, start=start_date, end=end_date)['Adj Close'].squeeze()
            if stock_df.empty:
                print(f"Warning: No data or invalid format for {symbol}")
                continue
            stock_data[symbol] = stock_df
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
            continue

    if not stock_data:
        return jsonify({"error": "No valid stock data found"}), 400

    df = pd.DataFrame(stock_data)

    if df.empty:
        return jsonify({"error": "No usable data to analyze after cleaning"}), 400

    # Calculate returns
    returns = df.pct_change().dropna()

    if returns.empty:
        return jsonify({"error": "No returns data available. Ensure stocks have sufficient data."}), 400

    mean_returns = returns.mean().to_numpy()
    cov_matrix = returns.cov().to_numpy()
    num_assets = len(mean_returns)

    # Objective function: Portfolio variance
    def portfolio_variance(weights):
        return np.dot(weights.T, np.dot(cov_matrix, weights))

    # Constraints
    constraints = [{'type': 'eq', 'fun': lambda w: np.sum(w) - 1}]  # Sum of weights = 1
    if target_return:
        constraints.append({'type': 'eq', 'fun': lambda w: np.dot(w, mean_returns) - target_return})

    # Bounds: weights between 0 and 1
    bounds = [(0, 1) for _ in range(num_assets)]

    # Initial guess: Equal weights
    initial_weights = np.ones(num_assets) / num_assets

    # Optimize
    result = minimize(
        portfolio_variance,
        initial_weights,
        method='SLSQP',
        bounds=bounds,
        constraints=constraints
    )

    if not result.success:
        return jsonify({"error": "Optimization failed", "message": result.message}), 400

    optimal_weights = result.x
    expected_return = np.dot(optimal_weights, mean_returns)
    volatility = np.sqrt(result.fun)  # Portfolio variance is minimized, sqrt to get stddev
    sharpe_ratio = expected_return / volatility

    allocation = {symbol: round(weight, 2) for symbol, weight in zip(symbols, optimal_weights)}

    return jsonify({
        "expected_return": round(expected_return, 4),
        "volatility": round(volatility, 4),
        "sharpe_ratio": round(sharpe_ratio, 4),
        "allocation": allocation
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
