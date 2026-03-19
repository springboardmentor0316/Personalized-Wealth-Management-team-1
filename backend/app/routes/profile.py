from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt,JWTError, ExpiredSignatureError
from fastapi.security import OAuth2PasswordBearer
from app.database import get_db
from app.models.user import User
from app.core.jwt import SECRET_KEY, ALGORITHM
from app.schemas.user import UpdateProfile
from app.schemas.user import UserResponse
from fastapi import UploadFile, File
import shutil
import uuid


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
    data: UpdateProfile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if data.name:
        current_user.name = data.name

    if data.phone:
        current_user.phone = data.phone

    if data.address:
        current_user.address = data.address

    if data.date_of_birth:
        current_user.date_of_birth = data.date_of_birth

    if data.risk_profile:
        current_user.risk_profile = data.risk_profile

    db.commit()
    db.refresh(current_user)

    return {"message": "Profile updated"}



@router.post("/upload-photo")
def upload_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_path = f"uploads/{uuid.uuid4()}_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    current_user.profile_picture = file_path
    db.commit()

    return {"message": "Photo uploaded"}