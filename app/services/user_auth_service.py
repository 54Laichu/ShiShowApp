from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from sqlalchemy.future import select
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from app.settings.config import settings
from app.models import User, UserCity, City, UserCourseCategory, CourseCategory
from app.schemas import UserRead
import jwt
import bcrypt

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

    async def verify_current_user(self, auth_header: str) -> UserRead:
        try:
            scheme, token = auth_header.split()
            if scheme.lower() != 'bearer':
                raise HTTPException(status_code=401, detail="Invalid authentication scheme")

            try:
                payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            except jwt.PyJWTError as e:
                raise HTTPException(status_code=401, detail="Invalid token")

            user_id = payload.get("user_id")

            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid token payload")

            user_query = select(User).where(User.id == user_id)
            result = await self.db.execute(user_query)
            user = result.scalar_one_or_none()

            if user is None:
                raise HTTPException(status_code=401, detail="User not found")

            # Query City List
            cities_query = select(City.name).join(UserCity).where(UserCity.user_id == user.id)
            cities_result = await self.db.execute(cities_query)
            cities = [city[0] for city in cities_result.fetchall()]

            # Query CourseCategory List
            categories_query = select(CourseCategory.name).join(UserCourseCategory).where(UserCourseCategory.user_id == user.id)
            categories_result = await self.db.execute(categories_query)
            course_categories = [category[0] for category in categories_result.fetchall()]

            user_read = UserRead(
                name=user.name,
                email=user.email,
                cities=cities,
                course_catrgories=course_categories
            )
            return user_read

        except Exception as e:
            raise HTTPException(status_code=401, detail="Authentication failed")

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
