from fastapi import APIRouter, Depends, HTTPException
from app.schemas import UserCreate
from app.services.user_service import UserService
from sqlmodel import Session
from app.database import get_session

router = APIRouter()

@router.post("/user")
async def create_user(user: UserCreate, db: Session = Depends(get_session)):
    existing_user = await UserService(db).get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return await UserService(db).create_user(user)
