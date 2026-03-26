from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal
import logging

# ✅ NEW IMPORTS FOR CSV
from fastapi.responses import StreamingResponse
import csv
from io import StringIO

from app.database import get_db
from app.models.investment import Investment
from app.schemas.investment import InvestmentCreate, InvestmentUpdate, InvestmentResponse
from app.routes.profile import get_current_user
from app.models.user import User
from app.tasks.price_tasks import update_prices_task
from app.services.market import fetch_price

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/investments", tags=["Investments"])


# CREATE INVESTMENT
@router.post("/", response_model=InvestmentResponse)
def create_investment(
    investment: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Investment).filter(
        Investment.user_id == current_user.id,
        Investment.symbol == investment.symbol
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Investment already exists")

    price = fetch_price(investment.symbol)

    if not price:
        logger.warning(f"Fallback price used for {investment.symbol}")
        price = investment.avg_buy_price

    cost_basis = Decimal(investment.units) * Decimal(investment.avg_buy_price)

    new_investment = Investment(
        user_id=current_user.id,
        asset_type=investment.asset_type,
        symbol=investment.symbol,
        units=investment.units,
        avg_buy_price=investment.avg_buy_price,
        cost_basis=cost_basis,
        last_price=Decimal(price),
        last_price_at=datetime.utcnow()
    )

    db.add(new_investment)
    db.commit()
    db.refresh(new_investment)

    current_value = Decimal(new_investment.units) * Decimal(new_investment.last_price)
    profit = current_value - Decimal(new_investment.cost_basis)

    return {
        "id": new_investment.id,
        "symbol": new_investment.symbol,
        "asset_type": new_investment.asset_type,
        "units": float(new_investment.units),
        "avg_buy_price": float(new_investment.avg_buy_price),
        "cost_basis": float(new_investment.cost_basis),
        "last_price": float(new_investment.last_price),
        "last_price_at": new_investment.last_price_at,
        "current_value": float(current_value),
        "profit": float(profit)
    }


# GET ALL INVESTMENTS
@router.get("/", response_model=list[InvestmentResponse])
def get_investments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    result = []

    for inv in investments:
        last_price = Decimal(inv.last_price or 0)

        if last_price <= 0:
            last_price = Decimal(inv.avg_buy_price)
            inv.last_price = last_price
            inv.last_price_at = datetime.utcnow()
            db.commit()

        units = Decimal(inv.units)
        cost_basis = Decimal(inv.cost_basis)

        current_value = units * last_price
        profit = current_value - cost_basis

        result.append({
            "id": inv.id,
            "symbol": inv.symbol,
            "asset_type": inv.asset_type,
            "units": float(inv.units),
            "avg_buy_price": float(inv.avg_buy_price),
            "cost_basis": float(inv.cost_basis),
            "last_price": float(last_price),
            "last_price_at": inv.last_price_at,
            "current_value": float(current_value),
            "profit": float(profit)
        })

    return result


# PORTFOLIO SUMMARY
@router.get("/summary")
def portfolio_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    total_value = Decimal("0")
    total_cost = Decimal("0")

    for inv in investments:
        price = fetch_price(inv.symbol)

        if not price or price <= 0:
            price = Decimal(inv.last_price or inv.avg_buy_price)

        total_value += Decimal(inv.units) * price
        total_cost += Decimal(inv.cost_basis)

    profit = total_value - total_cost

    return {
        "total_value": float(total_value),
        "total_cost": float(total_cost),
        "profit": float(profit)
    }


# REFRESH PRICES
@router.post("/refresh-prices")
def refresh_prices(current_user: User = Depends(get_current_user)):
    update_prices_task.delay()
    return {"message": "Price update started"}


# DELETE INVESTMENT
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

    return {"message": "Investment deleted successfully"}


# ==============================
# ✅ NEW: CSV EXPORT (FINAL STEP)
# ==============================
@router.get("/export")
def export_investments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    output = StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Symbol",
        "Asset Type",
        "Units",
        "Avg Buy Price",
        "Current Value",
        "Profit"
    ])

    # Data
    for inv in investments:
        writer.writerow([
            inv.symbol,
            inv.asset_type,
            inv.units,
            inv.avg_buy_price,
            inv.cost_basis,
            inv.last_price
        ])

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=portfolio.csv"
        }
    )