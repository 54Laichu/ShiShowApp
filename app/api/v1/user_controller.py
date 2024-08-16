from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import JSONResponse
from app.schemas import UserCreate, UserRead, UserLogin, UserUpdate, UserPassport, UserCitiesUpdate, UserCourseCategoriessUpdate
from app.services.user_service import UserService
from app.services.user_auth_service import UserAuthService
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from typing import Any, List, Annotated

router = APIRouter()

@router.post("/user")
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_session)) -> Any:
    existing_phone_email = await UserService(db).get_user_by_phone_email(user.email, user.phone)
    if existing_phone_email:
        print("信箱或電話已註冊")
        raise HTTPException(status_code=400, detail="信箱或電話已註冊")
    return await UserService(db).create_user(user)

@router.put("/user", response_model=UserPassport)
async def update_user(update_data: UserUpdate, auth_header: Annotated[str, Header(alias="Authorization")], db: AsyncSession = Depends(get_session)):
    try:
        auth_user = await UserAuthService(db).verify_current_user(auth_header)
        if auth_user:
            user_id = auth_user.id
            updated_user = await UserService(db).update_user(user_id, update_data)
            return updated_user
        else:
            return JSONResponse(status_code=400, content={"error": True, "message": "查無使用者"})
    except Exception as e:
        print(f"Error updating user: {str(e)}")
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})

@router.put("/user_city", response_model=UserCitiesUpdate)
async def update_user(update_data: UserCitiesUpdate, auth_header: Annotated[str, Header(alias="Authorization")], db: AsyncSession = Depends(get_session)):
    try:
        auth_user = await UserAuthService(db).verify_current_user(auth_header)
        if auth_user:
            user_id = auth_user.id
            updated_user = await UserService(db).update_user_cities(user_id, update_data)
            return updated_user
        else:
            return JSONResponse(status_code=400, content={"error": True, "message": "查無使用者"})
    except Exception as e:
        print(f"Error updating user: {str(e)}")
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})

@router.put("/user_course_category", response_model=UserCourseCategoriessUpdate)
async def update_user(update_data: UserCourseCategoriessUpdate, auth_header: Annotated[str, Header(alias="Authorization")], db: AsyncSession = Depends(get_session)):
    try:
        auth_user = await UserAuthService(db).verify_current_user(auth_header)
        if auth_user:
            user_id = auth_user.id
            updated_user = await UserService(db).update_user_course_categories(user_id, update_data)
            return updated_user
        else:
            return JSONResponse(status_code=400, content={"error": True, "message": "查無使用者"})
    except Exception as e:
        print(f"Error updating user: {str(e)}")
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})

@router.put("/user_all", response_model=UserRead )
async def update_user(update_data: UserUpdate, auth_header: Annotated[str, Header(alias="Authorization")], db: AsyncSession = Depends(get_session)):
    try:
        auth_user = await UserAuthService(db).verify_current_user(auth_header)
        if auth_user:
            user_id = auth_user.id
            updated_user = await UserService(db).update_user_all(user_id, update_data)
            return updated_user
        else:
            return JSONResponse(status_code=400, content={"error": True, "message": "查無使用者"})
    except Exception as e:
        print(f"Error updating user: {str(e)}")
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})

@router.post("/user/login")
async def login(form_info: UserLogin, db: AsyncSession = Depends(get_session)):
    access_token = await UserAuthService(db).login(form_info.email, form_info.password)
    if not access_token:
        raise HTTPException(status_code=400, detail="帳號密碼錯誤")
    return access_token

@router.get("/user/auth", response_model=UserPassport)
async def get_user_auth(auth_header: Annotated[str, Header(alias="Authorization")], db: AsyncSession = Depends(get_session)):
    try:
        user = await UserAuthService(db).verify_current_user(auth_header)
        return user
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})

@router.get("/user_center", response_model=UserRead)
async def get_user_center_data(auth_header: Annotated[str, Header(alias="Authorization")], db: AsyncSession = Depends(get_session)):
    try:
        user = await UserAuthService(db).load_current_user_data(auth_header)
        return user
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": True, "message": str(e)})
