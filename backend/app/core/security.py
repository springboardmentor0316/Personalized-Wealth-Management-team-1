from passlib.context import CryptContext
import logging

logger = logging.getLogger(__name__)

# Configure bcrypt
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)


# HASH PASSWORD
def hash_password(password: str) -> str:
    if not password:
        raise ValueError("Password cannot be empty")
    return pwd_context.hash(password)


# VERIFY PASSWORD
def verify_password(password: str, hashed: str) -> bool:
    if not password or not hashed:
        return False

    try:
        verified, _ = pwd_context.verify_and_update(password, hashed)
        return verified
    except Exception as e:
        logger.error(f"Password verification failed: {str(e)}")
        return False