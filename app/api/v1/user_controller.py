from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import JSONResponse
from app.schemas import UserCreate, UserRead, UserLogin
from app.services.user_service import UserService
from app.services.user_auth_service import UserAuthService
from sqlmodel import Session
from app.database import get_session
from typing import Any, List, Annotated

router = APIRouter()

@router.post("/user")
async def create_user(user: UserCreate, db: Session = Depends(get_session)) -> Any:
    existing_phone_email = await UserService(db).get_user_by_phone_email(user.email, user.phone)
    if existing_phone_email:
        print("信箱或電話已註冊")
        raise HTTPException(status_code=400, detail="信箱或電話已註冊")
    return await UserService(db).create_user(user)

@router.post("/user/login")
async def login(form_info: UserLogin, db: Session = Depends(get_session)):
    access_token = await UserAuthService(db).login(form_info.email, form_info.password)
    if not access_token:
        raise HTTPException(status_code=400, detail="帳號密碼錯誤")
    return access_token

@router.get("/user/auth", response_model=UserRead)
async def get_user_auth(auth_header: Annotated[str, Header(alias="Authorization")], db: Session = Depends(get_session)):
    try:
        user = await UserAuthService(db).verify_current_user(auth_header)
        return user
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
