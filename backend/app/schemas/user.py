from pydantic import BaseModel, EmailStr, Field
from enum import Enum


class RiskProfileEnum(str, Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"

# user registration
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    risk_profile:RiskProfileEnum
    

# user login
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)

class UpdateRiskProfile(BaseModel):
    risk_profile:RiskProfileEnum


class UserResponse(BaseModel):
    name: str
    email: str
    risk_profile: str
    kyc_status: str

    class Config:
        from_attributes = True  