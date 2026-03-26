from decimal import Decimal
import yfinance as yf
import logging
import math

logger = logging.getLogger(__name__)


def fetch_price(symbol: str, retries: int = 2) -> Decimal | None:
    if not symbol or not isinstance(symbol, str):
        logger.warning("Invalid symbol provided")
        return None

    # 🔥 Normalize symbol
    symbol = symbol.upper().strip()

    # 🔥 Handle Indian stocks (VERY IMPORTANT)
    possible_symbols = [symbol]

    if "." not in symbol:
        possible_symbols.append(symbol + ".NS")  # NSE
        possible_symbols.append(symbol + ".BO")  # BSE

    # 🔁 Try multiple symbol formats
    for sym in possible_symbols:
        for attempt in range(retries):
            try:
                stock = yf.Ticker(sym)

                # ✅ FAST PATH
                try:
                    price = stock.fast_info.get("last_price")
                    if price and not math.isnan(price):
                        logger.info(f"Price found (fast): {sym} → {price}")
                        return Decimal(str(price))
                except Exception:
                    pass

                # ✅ FALLBACK: HISTORY
                data = stock.history(period="1d")

                if not data.empty:
                    price = data["Close"].iloc[-1]

                    if price and not math.isnan(price):
                        logger.info(f"Price found (history): {sym} → {price}")
                        return Decimal(str(price))

                logger.warning(f"No data found for {sym}")

            except Exception:
                logger.exception(f"Attempt {attempt+1} failed for {sym}")

    logger.error(f"Price fetch failed for symbol: {symbol}")
    return None