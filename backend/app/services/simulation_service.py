from decimal import Decimal, ROUND_HALF_UP
import logging

logger = logging.getLogger(__name__)


def run_simulation(
    monthly_investment: Decimal,
    years: int,
    return_rate: Decimal,
    inflation_rate: Decimal = Decimal("0")
):
    if monthly_investment <= 0 or years <= 0 or return_rate < 0:
        return {
            "future_value": Decimal("0.00"),
            "invested": Decimal("0.00"),
            "returns": Decimal("0.00"),
            "timeline": []
        }

    months = years * 12
    total = Decimal("0.00")
    timeline = []

    monthly_rate = return_rate / Decimal("100") / Decimal("12")
    monthly_inflation = inflation_rate / Decimal("100") / Decimal("12")

    for month in range(1, months + 1):
        total = (total + monthly_investment) * (Decimal("1") + monthly_rate)

        # Adjust for inflation (optional)
        if inflation_rate > 0:
            total = total / (Decimal("1") + monthly_inflation)

        # Save yearly snapshot
        if month % 12 == 0:
            timeline.append({
                "year": month // 12,
                "value": total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            })

    invested = monthly_investment * months
    returns = total - invested

    # rounding
    total = total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    invested = invested.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    returns = returns.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    return {
        "future_value": total,
        "invested": invested,
        "returns": returns,
        "timeline": timeline
    }