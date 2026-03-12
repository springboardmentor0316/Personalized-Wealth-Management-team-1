from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.investment import Investment
from app.schemas.investment import InvestmentCreate, InvestmentUpdate, InvestmentResponse
from app.routes.profile import get_current_user
from app.models.user import User

router = APIRouter(prefix="/investments", tags=["Investments"])

# CREATE - Add new investment
@router.post("/", response_model=InvestmentResponse)
def create_investment(
    investment: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_investment = Investment(
        user_id=current_user.id,
        asset_type=investment.asset_type,
        symbol=investment.symbol,
        units=investment.units,
        avg_buy_price=investment.avg_buy_price,
        cost_basis=investment.cost_basis,
        current_value=investment.current_value,
        last_price=investment.last_price
    )
    db.add(new_investment)
    db.commit()
    db.refresh(new_investment)
    return new_investment

# READ - Get all investments for current user
@router.get("/", response_model=list[InvestmentResponse])
def get_investments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()
    return investments

# READ - Get single investment
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

# UPDATE - Update investment
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
        investment.units = investment_data.units
    if investment_data.current_value is not None:
        investment.current_value = investment_data.current_value
    if investment_data.last_price is not None:
        investment.last_price = investment_data.last_price
    
    db.commit()
    db.refresh(investment)
    return investment

# DELETE - Delete investment
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
