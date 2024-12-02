from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
from datetime import datetime
import yfinance as yf

app = Flask(__name__)

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    symbols = data.get('symbols', [])
    start_date = data.get('start_date', '2022-01-01')
    end_date = data.get('end_date', datetime.today().strftime('%Y-%m-%d'))

    if not symbols:
        return jsonify({"error": "No stock symbols provided"}), 400

    stock_data = {}
    for symbol in symbols:
        try:
            stock_data[symbol] = yf.download(symbol, start=start_date, end=end_date)['Adj Close']
        except Exception as e:
            return jsonify({"error": f"Error fetching data for {symbol}: {str(e)}"}), 500

    df = pd.DataFrame(stock_data)
    returns = df.pct_change().dropna()

    mean_returns = returns.mean()
    cov_matrix = returns.cov()

    num_assets = len(symbols)
    num_portfolios = 10000
    results = np.zeros((3, num_portfolios))
    weights_record = []

    for i in range(num_portfolios):
        weights = np.random.random(num_assets)
        weights /= np.sum(weights)
        weights_record.append(weights)

        portfolio_return = np.dot(weights, mean_returns)
        portfolio_stddev = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))

        results[0, i] = portfolio_return
        results[1, i] = portfolio_stddev
        results[2, i] = portfolio_return / portfolio_stddev

    max_sharpe_idx = np.argmax(results[2])
    max_sharpe_allocation = weights_record[max_sharpe_idx]

    allocation = {symbol: round(weight, 2) for symbol, weight in zip(symbols, max_sharpe_allocation)}

    return jsonify({
        "expected_return": round(results[0, max_sharpe_idx], 4),
        "volatility": round(results[1, max_sharpe_idx], 4),
        "sharpe_ratio": round(results[2, max_sharpe_idx], 4),
        "allocation": allocation
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
