from celery import Celery
from celery.schedules import crontab


celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
)

celery_app.conf.timezone = "Asia/Kolkata"


celery_app.conf.beat_schedule = {
    "update-prices-every-night": {
        "task": "app.tasks.price_tasks.update_prices_task",
        "schedule": crontab(minute="*/1"),
    },
}

celery_app.autodiscover_tasks(["app.tasks"])

import app.tasks.price_tasks
import app.models