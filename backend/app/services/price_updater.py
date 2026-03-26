from datetime import datetime
from sqlalchemy.orm import Session
import logging

from app.models.investment import Investment
from app.services.market import fetch_price

logger = logging.getLogger(__name__)


def update_all_prices(db: Session):
    investments = db.query(Investment).all()

    updated_count = 0

    for inv in investments:
        try:
            price = fetch_price(inv.symbol)

            if not price:
                logger.warning(f"Skipping {inv.symbol} - no price data")
                continue

            # Skip if no change
            if inv.last_price == price:
                continue

            inv.last_price = price
            inv.last_price_at = datetime.utcnow()

            updated_count += 1

        except Exception as e:
            logger.error(f"Error updating {inv.symbol}: {str(e)}")
            continue

    db.commit()
    logger.info(f"Updated {updated_count} investments successfully")