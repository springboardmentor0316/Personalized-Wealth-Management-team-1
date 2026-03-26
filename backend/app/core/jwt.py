from datetime import datetime, timedelta
from jose import jwt, JWTError
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY not set")

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 15))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))


# CREATE ACCESS TOKEN
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire,
        "type": "access",
        "iss": "wealth-app"
    })

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# CREATE REFRESH TOKEN
def create_refresh_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode.update({
        "exp": expire,
        "type": "refresh",
        "iss": "wealth-app"
    })

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# DECODE TOKEN
def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        if payload.get("type") not in ["access", "refresh"]:
            logger.warning("Invalid token type")
            return None

        return payload

    except JWTError as e:
        logger.error(f"Token decode error: {str(e)}")
        return None