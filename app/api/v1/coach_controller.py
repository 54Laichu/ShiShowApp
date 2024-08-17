from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import JSONResponse
from app.schemas import CoachCreate, CoachLogin, CoachPassport, CoachRead
from app.services.coach_service import CoachService, CoachAuthService
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from typing import Any, Annotated

router = APIRouter()

@router.post("/coach")
async def create_coach(coach: CoachCreate, db: AsyncSession = Depends(get_session)) -> JSONResponse:
    existing_phone_email = await CoachService(db).get_coach_by_phone_email(coach.email, coach.phone)
    if existing_phone_email:
        print("信箱或電話已註冊")
        raise HTTPException(status_code=400, detail="信箱或電話已註冊")
    return await CoachService(db).create_coach(coach)

@router.post("/coach/login")
async def login(form_info: CoachLogin, db: AsyncSession = Depends(get_session)):
    access_token = await CoachAuthService(db).login(form_info.email, form_info.password)
    if not access_token:
        raise HTTPException(status_code=400, detail="帳號密碼錯誤")
    return access_token

@router.get("/coach/auth", response_model=CoachPassport)
async def get_coach_auth(auth_header: Annotated[str, Header(alias="Authorization")], db: AsyncSession = Depends(get_session)):
    try:
        coach = await CoachAuthService(db).verify_current_coach(auth_header)
        return coach
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})

@router.get("/coach_center", response_model=CoachRead)
async def get_coach_center_data(auth_header: Annotated[str, Header(alias="Authorization")], db: AsyncSession = Depends(get_session)):
    try:
        coach = await CoachAuthService(db).load_current_coach_data(auth_header)
        return coach
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})
