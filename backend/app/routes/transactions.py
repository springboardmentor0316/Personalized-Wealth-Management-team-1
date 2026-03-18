from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.transaction import Transaction, TransactionType
from app.models.investment import Investment
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse
from app.routes.profile import get_current_user
from app.models.user import User

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/", response_model=TransactionResponse)
def create_transaction(
    data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investment = None
    if data.investment_id is not None:
        investment = db.query(Investment).filter(
            Investment.id == data.investment_id,
            Investment.user_id == current_user.id
        ).first()
        if not investment:
            raise HTTPException(status_code=404, detail="Investment not found")

    if data.transaction_type in [TransactionType.buy, TransactionType.sell] and not investment:
        raise HTTPException(status_code=400, detail="Buy/sell transactions require an investment")

    new_tx = Transaction(
        user_id=current_user.id,
        investment_id=data.investment_id,
        transaction_type=data.transaction_type,
        symbol=data.symbol,
        units=data.units,
        price=data.price,
        total_amount=data.total_amount,
        notes=data.notes,
    )

    if investment and data.transaction_type == TransactionType.buy:
        new_units = float(investment.units or 0) + float(data.units)
        new_cost_basis = float(investment.cost_basis or 0) + float(data.total_amount)
        investment.units = new_units
        investment.cost_basis = new_cost_basis
        investment.avg_buy_price = new_cost_basis / new_units if new_units else 0

    if investment and data.transaction_type == TransactionType.sell:
        if float(data.units) > float(investment.units or 0):
            raise HTTPException(status_code=400, detail="Cannot sell more units than owned")
        remaining_units = float(investment.units or 0) - float(data.units)
        avg_price = float(investment.avg_buy_price or 0)
        remaining_cost = max(0.0, float(investment.cost_basis or 0) - (avg_price * float(data.units)))
        investment.units = remaining_units
        investment.cost_basis = remaining_cost
        investment.avg_buy_price = avg_price if remaining_units > 0 else 0

    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    return new_tx

@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(Transaction.created_at.desc()).all()

@router.get("/{tx_id}", response_model=TransactionResponse)
def get_transaction(
    tx_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@router.put("/{tx_id}", response_model=TransactionResponse)
def update_transaction(
    tx_id: int,
    data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if data.transaction_type is not None:
        tx.transaction_type = data.transaction_type
    if data.symbol is not None:
        tx.symbol = data.symbol
    if data.units is not None:
        tx.units = data.units
    if data.price is not None:
        tx.price = data.price
    if data.total_amount is not None:
        tx.total_amount = data.total_amount
    if data.notes is not None:
        tx.notes = data.notes

    db.commit()
    db.refresh(tx)
    return tx

@router.delete("/{tx_id}")
def delete_transaction(
    tx_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(tx)
    db.commit()
    return {"message": "Transaction deleted"}
