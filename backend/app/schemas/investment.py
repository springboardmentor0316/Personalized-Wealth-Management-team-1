from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.models.investment import AssetType

class InvestmentCreate(BaseModel):
    asset_type: AssetType
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
    asset_type: AssetType
    symbol: str
    units: float
    avg_buy_price: float
    cost_basis: float
    current_value: float
    last_price: float
    last_price_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
