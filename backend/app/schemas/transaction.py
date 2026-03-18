from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.transaction import TransactionType

class TransactionCreate(BaseModel):
    transaction_type: TransactionType
    symbol: str
    units: float
    price: float
    total_amount: float
    investment_id: Optional[int] = None
    notes: Optional[str] = None

class TransactionUpdate(BaseModel):
    transaction_type: Optional[TransactionType] = None
    symbol: Optional[str] = None
    units: Optional[float] = None
    price: Optional[float] = None
    total_amount: Optional[float] = None
    notes: Optional[str] = None

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    investment_id: Optional[int] = None
    transaction_type: TransactionType
    symbol: str
    units: float
    price: float
    total_amount: float
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
