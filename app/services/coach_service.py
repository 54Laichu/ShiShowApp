from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import Optional
from app.models import User, CourseCategory, City, Coach
from app.schemas import UserCreate, CheckCity, CheckCourseCategory, UserRead, UserUpdate
from app.helpers.password_hash import get_password_hash
from app.services.user_auth_service import UserAuthService
from sqlalchemy.orm import selectinload

class CoachService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_coach_by_phone_email(self, email: Optional[str], phone: Optional[str]) -> User | None:
        result = await self.db.execute(select(User).filter((User.email == email) | (User.phone == phone)))
        return result.scalar_one_or_none()
