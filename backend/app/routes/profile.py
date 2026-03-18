from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt,JWTError, ExpiredSignatureError
from fastapi.security import OAuth2PasswordBearer
from app.database import get_db
from app.models.user import User
from app.core.jwt import SECRET_KEY, ALGORITHM
from app.schemas.user import UpdateRiskProfile
from app.schemas.user import UserResponse


router = APIRouter(prefix="/profile", tags=["Profile"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token payload"
            )

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

@router.get("/", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):

    return current_user

@router.put("/")
def update_profile(
    data: UpdateRiskProfile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    current_user.risk_profile = data.risk_profile

    db.commit()
    db.refresh(current_user)

    return {"message": "Profile updated successfully"}