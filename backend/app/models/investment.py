import enum
from sqlalchemy import Column, Integer, String, Numeric, Enum, ForeignKey, TIMESTAMP, UniqueConstraint, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class AssetType(str, enum.Enum):
    stock = "stock"
    etf = "etf"
    mutual_fund = "mutual_fund"
    bond = "bond"
    cash = "cash"
    crypto = "crypto"


class Investment(Base):
    __tablename__ = "investments"

    __table_args__ = (
        UniqueConstraint("user_id", "symbol", name="unique_user_symbol"),
        CheckConstraint("units > 0", name="check_units_positive"),
        CheckConstraint("avg_buy_price > 0", name="check_price_positive"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    asset_type = Column(
        Enum(AssetType, name="asset_type_enum"),
        nullable=False
    )

    symbol = Column(String(20), index=True, nullable=False)

    units = Column(Numeric(12, 4), nullable=False)
    avg_buy_price = Column(Numeric(12, 2), nullable=False)

    cost_basis = Column(Numeric(12, 2), nullable=False)

    last_price = Column(Numeric(12, 2), nullable=True)
    last_price_at = Column(TIMESTAMP)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="investments")
    transactions = relationship("Transaction", back_populates="investment", cascade="all, delete-orphan")

    @property
    def current_value(self):
        price = self.last_price or self.avg_buy_price
        return float(self.units * price)

    @property
    def profit(self):
        return float(self.current_value - self.cost_basis)