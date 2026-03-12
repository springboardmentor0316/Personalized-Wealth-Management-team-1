from pydantic import BaseModel
from datetime import datetime

class InvestmentCreate(BaseModel):
    asset_type: str
    symbol: str
    units: float
    avg_buy_price: float
    cost_basis: float
    current_value: float = 0
    last_price: float = 0

class InvestmentUpdate(BaseModel):
    units: float = None
    current_value: float = None
    last_price: float = None

class InvestmentResponse(BaseModel):
    id: int
    user_id: int
    asset_type: str
    symbol: str
    units: float
    avg_buy_price: float
    cost_basis: float
    current_value: float
    last_price: float
    last_price_at: datetime = None
    created_at: datetime

    class Config:
        from_attributes = True
