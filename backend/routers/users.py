"""
Users router — Authentication, registration, and user management.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import get_db
from models import User
from services.auth_utils import hash_password, verify_password, create_access_token, require_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


# --- Pydantic Schemas ---

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserResponse(BaseModel):
    id: int
    email: str
    display_name: str
    is_active: bool


# --- Endpoints ---

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このメールアドレスは既に登録されています",
        )

    # Create new user
    hashed_password = hash_password(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        display_name=user_in.display_name,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate token
    access_token = create_access_token(data={"sub": str(new_user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user.to_dict(),
    }


@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    """Login and get a JWT token."""
    user = db.query(User).filter(User.email == user_in.email).first()
    
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが正しくありません",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="無効なアカウントです",
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.to_dict(),
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(require_user)):
    """Get the currently logged in user's profile."""
    return current_user
