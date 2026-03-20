def run_simulation(monthly_investment: float, years: int, return_rate: float):
    months = years * 12
    total = 0

    monthly_rate = return_rate / 100 / 12

    for _ in range(months):
        total = (total + monthly_investment) * (1 + monthly_rate)

    return round(total, 2)