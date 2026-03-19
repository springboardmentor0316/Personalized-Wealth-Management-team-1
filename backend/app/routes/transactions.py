from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.transaction import Transaction
from app.models.investment import Investment, AssetType
from app.schemas.transaction import TransactionCreate, TransactionResponse, TransactionType
from app.routes.profile import get_current_user
from app.models.user import User

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/", response_model=TransactionResponse)
def create_transaction(
    data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    #  Validation
    if data.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")

    if data.price <= 0:
        raise HTTPException(status_code=400, detail="Price must be positive")

    #  Save transaction
    transaction = Transaction(
        user_id=current_user.id,
        symbol=data.symbol,
        type=data.type,
        quantity=data.quantity,
        price=data.price,
        fees=data.fees
    )
    db.add(transaction)

    #  Find existing investment
    investment = db.query(Investment).filter(
        Investment.user_id == current_user.id,
        Investment.symbol == data.symbol
    ).first()

   
    #  BUY LOGIC
   
    if data.type == TransactionType.buy:

        if investment:
            total_units = float(investment.units) + float(data.quantity)

            total_cost = (float(investment.units) * float(investment.avg_buy_price)
                    + float(data.quantity) * float(data.price)
            )

            investment.units = total_units
            investment.avg_buy_price = total_cost / total_units

        else:
            investment = Investment(
                user_id=current_user.id,
                symbol=data.symbol,
                asset_type=AssetType.stock,
                units=data.quantity,
                avg_buy_price=data.price,
                cost_basis=data.quantity * data.price,
                current_value=data.quantity * data.price,
                last_price=data.price
            )
            db.add(investment)

   
    #  SELL LOGIC
   
    elif data.type == TransactionType.sell:

        if not investment:
            raise HTTPException(status_code=400, detail="No investment found")

        if float(investment.units) < data.quantity:
            raise HTTPException(status_code=400, detail="Not enough units")

        investment.units = float(investment.units) - float(data.quantity)

        # ✅ Remove investment if fully sold
        if float(investment.units) <= 0:
            db.delete(investment)
            db.commit()
            db.refresh(transaction)
            return transaction

    # =========================
    # ✅ RECALCULATE VALUES
    # =========================
    if investment:
        investment.cost_basis = float(investment.units) * float(investment.avg_buy_price)
        investment.last_price = data.price
        investment.current_value = float(investment.units) * float(investment.last_price)
        investment.last_price_at = datetime.utcnow()  # 🔥 added

    db.commit()
    db.refresh(transaction)

    return transaction


@router.get("/")
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.id.desc()).all()


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

    return {"message": "Transaction deleted"}