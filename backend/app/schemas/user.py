from pydantic import BaseModel, EmailStr, Field, validator
from enum import Enum
from typing import Optional
import re
from datetime import date


# ENUMS
class RiskProfileEnum(str, Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"


class KYCStatusEnum(str, Enum):
    unverified = "unverified"
    verified = "verified"


# CREATE USER
class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    email: EmailStr
    password: str
    risk_profile: RiskProfileEnum

    @validator("name")
    def validate_name(cls, v):
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        return v

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")

        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain an uppercase letter")

        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain a number")

        return v


# LOGIN
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# RESPONSE
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    risk_profile: RiskProfileEnum
    kyc_status: KYCStatusEnum
    phone: Optional[str]
    address: Optional[str]
    date_of_birth: date | None = None
    profile_picture: Optional[str]

    class Config:
        from_attributes = True


# UPDATE PROFILE
class UpdateProfile(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2)
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: date | None = None
    risk_profile: Optional[RiskProfileEnum] = None

    @validator("name")
    def validate_name(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) < 2:
                raise ValueError("Name must be at least 2 characters")
        return v