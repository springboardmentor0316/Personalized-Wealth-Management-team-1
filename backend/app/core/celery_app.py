from celery import Celery
from celery.schedules import crontab

# 🔥 FORCE REDIS (NO ENV CONFUSION)
REDIS_URL = "redis://127.0.0.1:6379/0"

celery_app = Celery(
    "worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

# 🔥 CRITICAL FIX
celery_app.conf.broker_url = REDIS_URL
celery_app.conf.result_backend = REDIS_URL

# Timezone
celery_app.conf.timezone = "Asia/Kolkata"

# Beat schedule
celery_app.conf.beat_schedule = {
    "update-prices-every-night": {
        "task": "update_prices_task",
        "schedule": crontab(hour=0, minute=0),
    },
}

# Auto-discover
celery_app.autodiscover_tasks(["app.tasks"])

import app.tasks.price_tasks