'use client';

import React, { useState, useEffect } from 'react';

const StockSelector = () => {
  const stockOptions = [
    'AAPL', 'MSFT', 'GOOG', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'BABA', 'CRM',
    'ORCL', 'INTC', 'AMD', 'PYPL', 'UBER', 'LYFT', 'SHOP', 'SQ', 'ZM', 'DOCU',
    'TWTR', 'ADBE', 'DIS', 'MCD', 'WMT', 'COST', 'PEP', 'KO', 'JNJ', 'PFE',
    'MRNA', 'XOM', 'CVX', 'BP', 'T', 'VZ', 'SPCE', 'BA', 'NIO', 'RIVN',
    'F', 'GM', 'TSM', 'IBM', 'CSCO', 'QCOM', 'AMAT', 'TXN', 'LRCX', 'AVGO'
  ];

  // Default settings
  const defaultSelected = ['AAPL', 'MSFT', 'GOOG', 'AMZN','TSLA', 'NVDA'];
  const defaultWeights = [0.3, 0.2, 0.1, 0.2, 0.1,0.1];

  // Fallback recommendation
  const fallbackRecommendation = {
    expected_return: 0.08,
    volatility: 0.12,
    sharpe_ratio: 0.67,
    allocation: {
      AAPL: 0.1,
      MSFT: 0.5,
      GOOG: 0.2,
      AMZN: 0.0,
      TSLA: 0.1,
      NVDA: 0.1
    }
  };

  const [selectedStocks, setSelectedStocks] = useState(defaultSelected);
  const [weights, setWeights] = useState(defaultWeights);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    // Initialize weights for the default selected stocks
    setWeights(defaultWeights);
  }, []);

  // Handle stock selection
  const handleSelectStock = (stock) => {
    if (selectedStocks.includes(stock)) {
      setSelectedStocks(selectedStocks.filter((item) => item !== stock));
    } else if (selectedStocks.length < 10) {
      setSelectedStocks([...selectedStocks, stock]);
    }
  };

  // Handle weight input
  const handleWeightChange = (index, value) => {
    const newWeights = [...weights];
    newWeights[index] = parseFloat(value) || 0;
    setWeights(newWeights);
  };

  // Submit portfolio request
  const fetchRecommendation = async () => {
    if (selectedStocks.length === 0) {
      alert("Please select at least one stock.");
      return;
    }

    // Validate weights if provided
    if (weights.length > 0) {
      const weightSum = weights.reduce((sum, w) => sum + w, 0);
      if (weights.length !== selectedStocks.length) {
        alert("Number of weights must match the number of selected stocks.");
        return;
      }
      if (Math.abs(weightSum - 1) > 0.01) {
        alert("Weights must sum to 1.");
        return;
      }
    }

    // this is for when the backend is running
    // For demo I will just return predefinded values
//     try {
//       const res = await fetch("http://localhost:5000/recommend", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           symbols: selectedStocks,
//           weights: weights.length > 0 ? weights : null,
//           start_date: "2022-01-01",
//           end_date: "2024-01-01"
//         }),
//       });

//       if (!res.ok) {
//         throw new Error("Backend not reachable");
//       }

//       const data = await res.json();
//       setResponse(data);
//     } catch (error) {
//       //console.error("Error fetching recommendation:", error);
//       //alert("Backend is currently unavailable. Using fallback recommendations.");
//       setResponse(fallbackRecommendation);
//     }
        setResponse(fallbackRecommendation);
   };


  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Stock Portfolio Selector</h1>
      <p style={{ textAlign: 'center', color: '#555' }}>Select up to 10 stocks and optionally assign weights.</p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
        {stockOptions.map((stock) => (
          <button
            key={stock}
            onClick={() => handleSelectStock(stock)}
            style={{
              padding: '10px',
              backgroundColor: selectedStocks.includes(stock) ? '#4CAF50' : '#ccc',
              color: selectedStocks.includes(stock) ? 'white' : 'black',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '80px',
            }}
          >
            {stock}
          </button>
        ))}
      </div>
      
      <p style={{ textAlign: 'center' }}>Selected Stocks: {selectedStocks.join(", ")}</p>

      {selectedStocks.length > 0 && (
        <div>
          <h3 style={{ textAlign: 'center', marginTop: '20px' }}>Optional: Provide Weights</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {selectedStocks.map((stock, index) => (
              <div key={stock} style={{ margin: '10px 0', width: '300px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{stock}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={weights[index] || ""}
                  onChange={(e) => handleWeightChange(index, e.target.value)}
                  style={{
                    padding: '5px',
                    width: '60px',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                    color: 'black', 
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={fetchRecommendation}
        style={{
          display: 'block',
          margin: '30px auto',
          padding: '10px 20px',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Get Recommendation
      </button>
      
      {response && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <h2 style={{ color: '#333' }}>Portfolio Recommendation</h2>
          {response.error ? (
            <p style={{ color: 'red' }}>{response.error}</p>
          ) : (
            <>
              <p><strong>Expected Return:</strong> {response.expected_return}</p>
              <p><strong>Volatility:</strong> {response.volatility}</p>
              <p><strong>Sharpe Ratio:</strong> {response.sharpe_ratio}</p>
              <h3 style={{ marginTop: '20px' }}>Allocation:</h3>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {Object.entries(response.allocation).map(([symbol, weight]) => (
                  <li key={symbol} style={{ margin: '5px 0', fontSize: '16px' }}>
                    {symbol}: {(weight * 100).toFixed(2)}%
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StockSelector;
