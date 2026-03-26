import logging

logger = logging.getLogger(__name__)

ALLOCATIONS = {
    "conservative": {
        "stocks": 20,
        "bonds": 50,
        "cash": 30,
        "advice": "Focus on stability and low-risk investments."
    },
    "moderate": {
        "stocks": 50,
        "bonds": 30,
        "cash": 20,
        "advice": "Balanced approach with moderate risk and growth."
    },
    "aggressive": {
        "stocks": 80,
        "bonds": 10,
        "cash": 10,
        "advice": "High growth strategy with higher volatility."
    }
}


# ✅ FIXED: Calculate current allocation from investments
def get_current_allocation(investments):
    allocation = {
        "stocks": 0,
        "bonds": 0,
        "cash": 0
    }

    # ✅ FIX: convert string to float
    total = sum(float(inv.current_value) for inv in investments)

    if total == 0:
        return allocation

    for inv in investments:
        asset = inv.asset_type.lower()

        # ✅ FIX: map DB asset types to categories
        if asset in ["stock", "stocks", "etf", "mutual_fund"]:
            allocation["stocks"] += float(inv.current_value)
        elif asset in ["bond", "bonds"]:
            allocation["bonds"] += float(inv.current_value)
        else:
            allocation["cash"] += float(inv.current_value)

    for key in allocation:
        allocation[key] = round((allocation[key] / total) * 100, 2)

    return allocation


# ✅ UPDATED: Main function (includes rebalancing)
def get_allocation(risk_profile, investments=None, age=None, years=None):
    if not risk_profile:
        return {
            "ideal": {},
            "current": {},
            "rebalance": {},
            "advice": "No risk profile provided."
        }

    if hasattr(risk_profile, "value"):
        risk_profile = risk_profile.value

    risk_profile = str(risk_profile).lower().strip()

    config = ALLOCATIONS.get(risk_profile)

    if not config:
        logger.warning(f"Unknown risk profile: {risk_profile}")
        return {
            "ideal": {},
            "current": {},
            "rebalance": {},
            "advice": "Unknown risk profile."
        }

    # ✅ Ideal allocation
    ideal = {
        "stocks": config["stocks"],
        "bonds": config["bonds"],
        "cash": config["cash"],
    }

    # Optional personalization
    if age and age > 50:
        ideal["stocks"] -= 10
        ideal["bonds"] += 10

    # ✅ Current allocation
    current = get_current_allocation(investments or [])

    # ✅ Rebalancing logic
    rebalance = {}
    for asset in ideal:
        diff = ideal[asset] - current.get(asset, 0)
        rebalance[asset] = round(diff, 2)

    # Validate total = 100
    total = sum(ideal.values())
    if total != 100:
        logger.error("Allocation does not sum to 100")

    return {
        "ideal": ideal,
        "current": current,
        "rebalance": rebalance,
        "advice": config["advice"]
    }