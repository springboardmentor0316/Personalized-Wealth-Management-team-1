from pydantic import BaseModel, Field, validator
from enum import Enum
from typing import Optional
from decimal import Decimal
from datetime import datetime


class AssetType(str, Enum):
    stock = "stock"
    etf = "etf"
    mutual_fund = "mutual_fund"
    bond = "bond"
    cash = "cash"
    crypto = "crypto"


# CREATE
class InvestmentCreate(BaseModel):
    asset_type: AssetType
    symbol: str = Field(min_length=1, max_length=20)
    units: Decimal = Field(gt=0)
    avg_buy_price: Decimal = Field(gt=0)

    @validator("symbol")
    def normalize_symbol(cls, v):
        return v.upper()


# UPDATE
class InvestmentUpdate(BaseModel):
    units: Optional[Decimal] = Field(default=None, gt=0)
    avg_buy_price: Optional[Decimal] = Field(default=None, gt=0)


# RESPONSE
class InvestmentResponse(BaseModel):
    id: int
    asset_type: AssetType
    symbol: str
    units: Decimal
    avg_buy_price: Decimal
    cost_basis: Decimal
    last_price: Optional[Decimal]
    last_price_at: Optional[datetime]

    current_value: Optional[Decimal] = None
    profit: Optional[Decimal] = None

    class Config:
        from_attributes = True