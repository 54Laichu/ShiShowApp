from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from sqlmodel import select
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from app.settings.config import settings
from app.models import User, UserCity, City, UserCourseCategory, CourseCategory, UserCoach, Coach
from app.schemas import UserRead, UserPassport
import jwt
import bcrypt
from sqlalchemy.orm import selectinload


class UserAuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def create_access_token(user_id: int) -> str:
        encode_content = {
            "user_id": str(user_id),
            "exp": datetime.utcnow() + timedelta(days=settings.JWT_EXPIRE_DAYS)
        }
        access_token =  jwt.encode(encode_content, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return JSONResponse(status_code=200, content={"access_token": access_token, "token_type": "bearer"})

    async def load_current_user_data(self, auth_header: str) -> UserRead:
        try:
            scheme, token = auth_header.split(" ")
            if scheme.lower() != 'bearer':
                raise HTTPException(status_code=401, detail="Invalid authentication scheme")

            try:
                payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            except jwt.PyJWTError as e:
                raise HTTPException(status_code=401, detail=f"str{e}")

            user_id = payload.get("user_id")

            if user_id is None:
                raise HTTPException(status_code=401, detail="無效 token")

            user_query = (
                select(User)
                .options(
                    selectinload(User.cities),
                    selectinload(User.course_categories),
                    selectinload(User.coaches)
                )
                .where(User.id == user_id)
            )
            result = await self.db.execute(user_query)
            user = result.scalar_one_or_none()

            if user is None:
                raise HTTPException(status_code=401, detail="查無資料")

            user_read = UserRead(
                id=user.id,
                name=user.name,
                email=user.email,
                cities=[city.name for city in user.cities],
                course_categories=[category.name for category in user.course_categories],
                coaches=[coach.name for coach in user.coaches]
            )
            return user_read

        except Exception as e:
            raise HTTPException(status_code=401, detail="Authentication failed")

    async def verify_current_user(self, auth_header: str) -> UserRead:
        try:
            scheme, token = auth_header.split(" ")
            if scheme.lower() != 'bearer':
                raise HTTPException(status_code=401, detail="驗證方式有誤")

            try:
                payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            except jwt.PyJWTError as e:
                raise HTTPException(status_code=401, detail=f"{str(e)}")

            user_id = payload.get("user_id")

            if user_id is None:
                raise HTTPException(status_code=401, detail="無效的 token payload")

            user_query = select(User).where(User.id == user_id)
            result = await self.db.execute(user_query)
            user = result.scalar_one_or_none()

            if user is None:
                raise HTTPException(status_code=401, detail="查無使用者")

            user_passport = UserPassport(
                id=user.id,
                name=user.name,
                email=user.email,
            )
            return user_passport

        except Exception as e:
            raise HTTPException(status_code=401, detail="身份驗證失敗")

    async def login(self, email: str, password: str) -> JSONResponse:
        user = await self.db.execute(select(User).filter(User.email == email))
        user = user.scalar_one_or_none()
        if user and bcrypt.checkpw(password.encode('utf-8'), user.hashed_password.encode('utf-8')):
            encode_content = {
                "user_id": str(user.id),
                "exp": datetime.utcnow() + timedelta(days=settings.JWT_EXPIRE_DAYS)
            }
            access_token = jwt.encode(encode_content, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
            return JSONResponse(status_code=200, content={"access_token": access_token, "token_type": "bearer"})
        else:
            return JSONResponse(status_code=400, content={"error": "帳號或密碼錯誤"})
