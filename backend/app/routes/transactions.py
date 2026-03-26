from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal
import logging

from app.database import get_db
from app.models.transaction import Transaction
from app.models.investment import Investment, AssetType
from app.schemas.transaction import TransactionCreate, TransactionResponse, TransactionType
from app.routes.profile import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/", response_model=TransactionResponse)
def create_transaction(
    data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if data.quantity <= 0 or data.price <= 0:
        raise HTTPException(status_code=400, detail="Invalid quantity or price")

    investment = db.query(Investment).filter(
        Investment.user_id == current_user.id,
        Investment.symbol == data.symbol
    ).first()

    # ─── BUY ─────────────────────────────
    if data.type == TransactionType.buy:

        total_cost = data.quantity * data.price

        if investment:
            new_units = investment.units + data.quantity
            new_cost_basis = investment.cost_basis + total_cost

            investment.units = new_units
            investment.cost_basis = new_cost_basis
            investment.avg_buy_price = new_cost_basis / new_units

        else:
            investment = Investment(
                user_id=current_user.id,
                symbol=data.symbol,
                asset_type=AssetType.stock,
                units=data.quantity,
                avg_buy_price=data.price,
                cost_basis=total_cost,
                last_price=data.price,
                last_price_at=datetime.utcnow()
            )
            db.add(investment)

    # ─── SELL ────────────────────────────
    elif data.type == TransactionType.sell:

        if not investment:
            raise HTTPException(status_code=400, detail="No investment found")

        if data.quantity > investment.units:
            raise HTTPException(status_code=400, detail="Not enough units")

        sell_ratio = data.quantity / investment.units

        investment.cost_basis -= investment.cost_basis * sell_ratio
        investment.units -= data.quantity

        if investment.units == 0:
            db.delete(investment)
            investment = None

        else:
            investment.avg_buy_price = investment.cost_basis / investment.units

    # ─── UPDATE PRICE ────────────────────
    if investment:
        investment.last_price = data.price
        investment.last_price_at = datetime.utcnow()

    # ─── SAVE TRANSACTION ────────────────
    transaction = Transaction(
        user_id=current_user.id,
        symbol=data.symbol,
        type=data.type,
        quantity=data.quantity,
        price=data.price,
        fees=data.fees,
        investment_id=investment.id if investment else None
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    logger.info(f"Transaction created: {data.symbol} {data.type}")

    return transaction



@router.get("/", response_model=list[TransactionResponse])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.id.desc()).all()

    return transactions


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(transaction)
    db.commit()

    return {"message": "Transaction deleted successfully"}