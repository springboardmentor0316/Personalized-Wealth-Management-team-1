from sqlalchemy import Column, Integer, String, Numeric, Enum, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base
import enum

class AssetType(enum.Enum):
    stock = "stock"
    etf = "etf"
    mutual_fund = "mutual_fund"
    bond = "bond"
    cash = "cash"

class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    asset_type = Column(Enum(AssetType))
    symbol = Column(String)
    units = Column(Numeric)
    avg_buy_price = Column(Numeric)
    cost_basis = Column(Numeric)
    current_value = Column(Numeric, default=0)
    last_price = Column(Numeric)
    last_price_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
