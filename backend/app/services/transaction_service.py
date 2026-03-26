from sqlalchemy.orm import Session
from decimal import Decimal
from fastapi import HTTPException

from app.models.investment import Investment
from app.models.transaction import Transaction, TransactionType


def process_transaction(db: Session, txn: Transaction):
    investment = db.query(Investment).filter(
        Investment.user_id == txn.user_id,
        Investment.symbol == txn.symbol
    ).first()

    # If no investment exists → create one for BUY
    if not investment:
        if txn.type != TransactionType.buy:
            raise HTTPException(status_code=400, detail="No investment to sell")

        investment = Investment(
            user_id=txn.user_id,
            symbol=txn.symbol,
            asset_type="stock",  # or dynamic
            units=Decimal("0"),
            avg_buy_price=Decimal("0"),
            cost_basis=Decimal("0"),
            last_price=txn.price
        )
        db.add(investment)

    # BUY logic
    if txn.type == TransactionType.buy:
        total_cost = txn.quantity * txn.price

        new_units = investment.units + txn.quantity
        new_cost_basis = investment.cost_basis + total_cost

        investment.units = new_units
        investment.cost_basis = new_cost_basis
        investment.avg_buy_price = new_cost_basis / new_units

    # SELL logic
    elif txn.type == TransactionType.sell:
        if txn.quantity > investment.units:
            raise HTTPException(status_code=400, detail="Not enough units to sell")

        sell_ratio = txn.quantity / investment.units

        investment.units -= txn.quantity
        investment.cost_basis -= investment.cost_basis * sell_ratio

        if investment.units > 0:
            investment.avg_buy_price = investment.cost_basis / investment.units
        else:
            investment.avg_buy_price = Decimal("0")
            investment.cost_basis = Decimal("0")

    db.commit()
    db.refresh(investment)

    return investment