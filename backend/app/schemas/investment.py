from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional
from decimal import Decimal


class AssetType(str, Enum):
    stock = "stock"
    etf = "etf"
    mutual_fund = "mutual_fund"
    bond = "bond"
    cash = "cash"


class InvestmentCreate(BaseModel):
    asset_type: AssetType
    symbol: str
    units: Decimal = Field(gt=0)
    avg_buy_price: Decimal = Field(gt=0)
    last_price: Decimal = Field(gt=0)


class InvestmentUpdate(BaseModel):
    units: Optional[Decimal] = Field(default=None, gt=0)
    avg_buy_price: Optional[Decimal] = Field(default=None, gt=0)
    last_price: Optional[Decimal] = Field(default=None, gt=0)


class InvestmentResponse(BaseModel):
    id: int
    asset_type: AssetType
    symbol: str
    units: Decimal
    avg_buy_price: Decimal
    cost_basis: Decimal
    current_value: Decimal
    last_price: Decimal

    class Config:
        from_attributes = True