from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, Form, File
from fastapi.responses import JSONResponse
from app.schemas import CoachCreate, CoachLogin, CoachPassport, CoachRead, CoachProfilePhotoPassport, CoachUpdate, CoachProfilePhotoPassport
from app.services.coach_service import CoachService, CoachAuthService
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

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

# Update coach data
@router.put("/coach", response_model=CoachProfilePhotoPassport)
async def updat_coach_data(
    auth_header: Annotated[str, Header(alias="Authorization")],
    profile_photo: Optional[UploadFile] = File(None),
    name: Optional[str] = Form(None),
    account: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_session)
    ):
    try:
        auth_coach = await CoachAuthService(db).verify_current_coach(auth_header)
        if auth_coach:
            coach_id = auth_coach.id

            update_data = {}
            if profile_photo:
                update_data["profile_photo"] = profile_photo
            if name:
                update_data["name"] = name
            if account:
                update_data["account"] = account
            if profile_photo:
                update_data["profile_photo"] = profile_photo
            if password:
                update_data["password"] = password

            updated_coach = await CoachService(db).update_coach(coach_id, update_data)
            return updated_coach
        else:
            return JSONResponse(status_code=400, content={"error": True, "message": "查無使用者"})
    except Exception as e:
        print(f"Error updating user: {str(e)}")
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})
