from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Optional, Dict, Any, List
from datetime import datetime


# CREATE
class SimulationCreate(BaseModel):
    monthly_investment: Decimal = Field(gt=0, le=10000000)
    years: int = Field(gt=0, le=50)
    return_rate: Decimal = Field(gt=0, le=100)
    goal_id: Optional[int] = None
    scenario_name: Optional[str] = Field(default=None, max_length=100)


# RESULT RESPONSE
class SimulationResponse(BaseModel):
    future_value: Decimal
    invested: Decimal
    returns: Decimal
    timeline: Optional[List[Dict[str, Any]]] = None

    class Config:
        from_attributes = True


# HISTORY RESPONSE
class SimulationHistoryResponse(BaseModel):
    id: int
    scenario_name: str
    goal_id: Optional[int] = None
    assumptions: Dict[str, Any]
    results: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True