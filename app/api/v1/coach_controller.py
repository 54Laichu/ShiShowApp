from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import JSONResponse
from app.schemas import CoachCreate
from app.services.coach_service import CoachService
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from typing import Any, Annotated


router = APIRouter()

@router.post("/coach")
async def create_user(user: CoachCreate, db: AsyncSession = Depends(get_session)) -> Any:
    existing_phone_email = await CoachService(db).get_user_by_phone_email(user.email, user.phone)
    if existing_phone_email:
        print("信箱或電話已註冊")
        raise HTTPException(status_code=400, detail="信箱或電話已註冊")
    return pass
