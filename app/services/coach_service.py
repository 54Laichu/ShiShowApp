from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import Optional
from app.models import CourseCategory, City, Coach
from app.schemas import CoachCreate, CheckCity, CheckCourseCategory, CoachRead, CoachPassport
from app.helpers.password_hash import get_password_hash
from app.services.coach_auth_service import CoachAuthService
from fastapi import HTTPException
import jwt
from app.settings.config import settings

class CoachService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_coach_by_phone_email(self, email: Optional[str], phone: Optional[str]) -> Coach | None:
        result = await self.db.execute(select(Coach).filter((Coach.email == email) | (Coach.phone == phone)))
        return result.scalar_one_or_none()

    async def create_coach(self, coach: CoachCreate):
        db_coach = Coach(
            name=coach.name,
            account=coach.account,
            email=coach.email,
            phone=coach.phone,
            hashed_password=get_password_hash(coach.password),
            is_active=coach.is_active
        )

        if coach.cities:
            for city in coach.cities:
                if city in [item.value for item in CheckCity]:
                    db_city = await self.db.execute(select(City).filter(City.name == city))
                    db_city = db_city.scalar_one_or_none()
                    if db_city:
                        db_coach.cities.append(db_city)
                    else:
                        raise ValueError(f"系統錯誤，請向客服人員聯繫")
                else:
                    raise ValueError(f"查無：{city}")

        if coach.course_categories:
            for category in coach.course_categories:
                if category in [item.value for item in CheckCourseCategory]:
                    db_category = await self.db.execute(select(CourseCategory).filter(CourseCategory.name == category))
                    db_category = db_category.scalar_one_or_none()
                    if db_category:
                        db_coach.course_categories.append(db_category)
                    else:
                        raise ValueError(f"系統錯誤，請向客服人員聯繫")
                else:
                    raise ValueError(f"查無：{category}")


        self.db.add(db_coach)
        await self.db.commit()
        await self.db.refresh(db_coach)
        print(db_coach.id)
        token = CoachAuthService.create_coach_access_token(db_coach.id)
        return token

    async def verify_current_coach(self, auth_header: str) -> CoachRead:
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
                name=coach.name,
                account=coach.account,
            )
            return coach_passport

        except Exception as e:
            raise HTTPException(status_code=401, detail="身份驗證失敗")
