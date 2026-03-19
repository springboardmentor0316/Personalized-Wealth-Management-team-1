from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.investment import Investment
from app.schemas.investment import (
    InvestmentCreate,
    InvestmentUpdate,
    InvestmentResponse
)
from app.routes.profile import get_current_user
from app.models.user import User

router = APIRouter(prefix="/investments", tags=["Investments"])


# =========================
# CREATE INVESTMENT
# =========================
@router.post("/", response_model=InvestmentResponse)
def create_investment(
    investment: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if investment.units <= 0:
        raise HTTPException(status_code=400, detail="Units must be positive")

    if investment.avg_buy_price <= 0:
        raise HTTPException(status_code=400, detail="Price must be positive")

    cost_basis = investment.units * investment.avg_buy_price
    current_value = investment.units * investment.last_price

    new_investment = Investment(
        user_id=current_user.id,
        asset_type=investment.asset_type,
        symbol=investment.symbol,
        units=investment.units,
        avg_buy_price=investment.avg_buy_price,
        cost_basis=cost_basis,
        current_value=current_value,
        last_price=investment.last_price,
        last_price_at=datetime.utcnow()
    )

    db.add(new_investment)
    db.commit()
    db.refresh(new_investment)

    return new_investment


# =========================
# GET ALL INVESTMENTS
# =========================
@router.get("/", response_model=list[InvestmentResponse])
def get_investments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    return investments


# =========================
# PORTFOLIO SUMMARY
# =========================
@router.get("/summary")
def portfolio_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    total_value = sum(float(inv.current_value) for inv in investments)
    total_cost = sum(float(inv.cost_basis) for inv in investments)

    return {
        "total_value": float(total_value),
        "total_cost": float(total_cost),
        "profit": float(total_value - total_cost)
    }


# =========================
# GET SINGLE INVESTMENT
# =========================
@router.get("/{investment_id}", response_model=InvestmentResponse)
def get_investment(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investment = db.query(Investment).filter(
        Investment.id == investment_id,
        Investment.user_id == current_user.id
    ).first()

    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")

    return investment


# =========================
# UPDATE INVESTMENT
# =========================
@router.put("/{investment_id}", response_model=InvestmentResponse)
def update_investment(
    investment_id: int,
    investment_data: InvestmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investment = db.query(Investment).filter(
        Investment.id == investment_id,
        Investment.user_id == current_user.id
    ).first()

    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")

    if investment_data.units is not None:
        if investment_data.units <= 0:
            raise HTTPException(status_code=400, detail="Invalid units")
        investment.units = investment_data.units

    if investment_data.avg_buy_price is not None:
        if investment_data.avg_buy_price <= 0:
            raise HTTPException(status_code=400, detail="Invalid price")
        investment.avg_buy_price = investment_data.avg_buy_price

    if investment_data.last_price is not None:
        investment.last_price = investment_data.last_price

    # ✅ Recalculate values
    investment.cost_basis = float(investment.units) * float(investment.avg_buy_price)
    investment.current_value = float(investment.units) * float(investment.last_price)
    investment.last_price_at = datetime.utcnow()

    db.commit()
    db.refresh(investment)

    return investment


# =========================
# DELETE INVESTMENT
# =========================
@router.delete("/{investment_id}")
def delete_investment(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investment = db.query(Investment).filter(
        Investment.id == investment_id,
        Investment.user_id == current_user.id
    ).first()

    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found")

    db.delete(investment)
    db.commit()

    return {"message": "Investment deleted"}