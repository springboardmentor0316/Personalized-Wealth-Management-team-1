from pydantic import BaseModel, EmailStr, Field
from enum import Enum
from typing import Optional
from datetime import date


class RiskProfileEnum(str, Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6)
    risk_profile: RiskProfileEnum


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    risk_profile: RiskProfileEnum
    kyc_status: str
    phone: Optional[str]
    address: Optional[str]
    date_of_birth: Optional[date]
    profile_picture: Optional[str]

    class Config:
        from_attributes = True


class UpdateProfile(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2)
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None
    risk_profile: Optional[RiskProfileEnum] = None