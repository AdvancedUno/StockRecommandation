

import requests

url = "http://localhost:5000/recommend"
payload = {
    "symbols": ["AAPL", "MSFT", "GOOG"],
    "start_date": "2022-01-01",
    "end_date": "2024-01-01"
}

response = requests.post(url, json=payload)
print(response.json())