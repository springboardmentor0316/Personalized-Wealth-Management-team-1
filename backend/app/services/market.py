import requests

API_KEY = "YOUR_API_KEY"  # get from Alpha Vantage

def fetch_price(symbol: str):
    try:
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={API_KEY}"
        response = requests.get(url)
        data = response.json()

        price = data.get("Global Quote", {}).get("05. price")

        if price:
            return float(price)

    except Exception as e:
        print("Market API Error:", e)

    return None