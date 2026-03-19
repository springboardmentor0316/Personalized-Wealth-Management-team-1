import enum
from sqlalchemy import Column, Integer, String, Numeric, Enum, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class AssetType(str, enum.Enum):
    stock = "stock"
    etf = "etf"
    mutual_fund = "mutual_fund"
    bond = "bond"
    cash = "cash"

class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    asset_type = Column(Enum(AssetType), nullable=False)
    symbol = Column(String, nullable=False)

    units = Column(Numeric(12, 4))
    avg_buy_price = Column(Numeric(12, 2))

    cost_basis = Column(Numeric(12, 2))
    current_value = Column(Numeric(12, 2))

    last_price = Column(Numeric(12, 2))
    last_price_at = Column(TIMESTAMP)

    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="investments")