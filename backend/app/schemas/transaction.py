from pydantic import BaseModel, Field, validator
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


# CREATE
class TransactionCreate(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)
    type: TransactionType
    quantity: Decimal = Field(gt=0)
    price: Optional[Decimal] = None
    fees: Optional[Decimal] = Field(default=0, ge=0)

    @validator("symbol")
    def normalize_symbol(cls, v):
        return v.upper()

    @validator("price", always=True)
    def validate_price(cls, v, values):
        txn_type = values.get("type")

        if txn_type in ["buy", "sell"] and (v is None or v <= 0):
            raise ValueError("Price required for buy/sell")

        return v


# RESPONSE
class TransactionResponse(BaseModel):
    id: int
    symbol: str
    type: TransactionType
    quantity: Decimal
    price: Optional[Decimal]
    fees: Decimal
    executed_at: datetime
    investment_id: Optional[int] = None

    # computed field (optional)
    total_amount: Optional[Decimal] = None

    class Config:
        from_attributes = True