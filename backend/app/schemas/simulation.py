from pydantic import BaseModel

class SimulationCreate(BaseModel):
    monthly_investment: float
    years: int
    return_rate: float
    goal_id: int | None = None


class SimulationResponse(BaseModel):
    future_value: float