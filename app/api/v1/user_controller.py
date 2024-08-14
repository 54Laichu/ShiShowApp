from fastapi import APIRouter, Depends, HTTPException
from app.schemas import UserCreate, UserRead
from app.services.user_service import UserService
from sqlmodel import Session
from app.database import get_session
from typing import Any

router = APIRouter()

@router.post("/user", response_model=UserRead)
async def create_user(user: UserCreate, db: Session = Depends(get_session)) -> Any:
    existing_phone_email = await UserService(db).get_user_by_phone_email(user.email, user.phone)
    if existing_phone_email:
        print("信箱或電話已註冊")
        raise HTTPException(status_code=400, detail="信箱或電話已註冊")
    return await UserService(db).create_user(user)

@router.get("/user")
async def get_user():
    pass
