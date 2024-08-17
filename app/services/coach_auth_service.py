from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from sqlmodel import select
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from app.settings.config import settings
from app.models import Coach, CoachCity, City, CoachCourseCategory, CourseCategory, UserCoach
from app.schemas import CoachPassport, CoachRead
import jwt
import bcrypt
import logging

logger = logging.getLogger()

class CoachAuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def create_coach_access_token(coach_id: int) -> str:
        encode_content = {
            "coach_id": str(coach_id),
            "exp": datetime.utcnow() + timedelta(days=settings.JWT_EXPIRE_DAYS)
        }
        access_token =  jwt.encode(encode_content, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return JSONResponse(status_code=200, content={"access_token": access_token, "token_type": "bearer"})

    async def login(self, email: str, password: str) -> JSONResponse:
        coach = await self.db.execute(select(Coach).filter(Coach.email == email))
        coach = coach.scalar_one_or_none()
        if coach and bcrypt.checkpw(password.encode('utf-8'), coach.hashed_password.encode('utf-8')):
            encode_content = {
                "coach_id": str(coach.id),
                "exp": datetime.utcnow() + timedelta(days=settings.JWT_EXPIRE_DAYS)
            }
            access_token = jwt.encode(encode_content, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
            return JSONResponse(status_code=200, content={"access_token": access_token, "token_type": "bearer"})
        else:
            return JSONResponse(status_code=400, content={"error": "帳號或密碼錯誤"})

    async def verify_current_coach(self, auth_header: str) -> CoachPassport:
        try:
            scheme, token = auth_header.split(" ")
            if scheme.lower() != 'bearer':
                raise HTTPException(status_code=401, detail="驗證方式有誤")

            try:
                payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            except jwt.PyJWTError as e:
                raise HTTPException(status_code=401, detail=f"{str(e)}")

            coach_id = payload.get("coach_id")

            if coach_id is None:
                raise HTTPException(status_code=401, detail="無效的 token payload")

            coach_query = select(Coach).where(Coach.id == coach_id)
            result = await self.db.execute(coach_query)
            coach = result.scalar_one_or_none()

            if coach is None:
                raise HTTPException(status_code=401, detail="查無使用者")

            coach_passport = CoachPassport(
                id=coach.id,
                account=coach.account,
                name=coach.name,
                email=coach.email,
            )
            return coach_passport

        except Exception as e:
            logger.error(f"Unexpected error during coach verification: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error")

