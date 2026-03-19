from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional
from decimal import Decimal
from datetime import datetime


class TransactionType(str, Enum):
    buy = "buy"
    sell = "sell"
    dividend = "dividend"
    contribution = "contribution"
    withdrawal = "withdrawal"


class TransactionCreate(BaseModel):
    symbol: str
    type: TransactionType
    quantity: Decimal = Field(gt=0)
    price: Decimal = Field(gt=0)
    fees: Optional[Decimal] = Field(default=0, ge=0)


class TransactionResponse(BaseModel):
    id: int
    symbol: str
    type: TransactionType
    quantity: Decimal
    price: Decimal
    fees: Decimal
    executed_at: datetime

    class Config:
        from_attributes = True