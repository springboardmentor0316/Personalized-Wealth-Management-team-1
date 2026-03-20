from sqlalchemy.orm import Session
from datetime import datetime
from app.models.user import User
from app.models.investment import Investment
from app.models.goal import Goal
from app.services.market import fetch_price

def update_all_prices(db: Session):
    investments = db.query(Investment).all()

    for inv in investments:
        price = fetch_price(inv.symbol)

        if price is None:
            print(f"Skipping {inv.symbol}")
            continue

        inv.last_price = float(price)
        inv.current_value = float(price) * float(inv.units)
        inv.last_price_at = datetime.utcnow()

    db.commit()