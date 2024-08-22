from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, or_
from typing import Optional
from app.models import CourseCategory, City, Coach, Gym
from app.schemas import CoachCreate, CheckCity, CheckCourseCategory, CoachRead, CoachPassport, CoachCitiesUpdate, CoachProfilePhotoPassport, CoachCourseCategoriesUpdate, CoachGymsUpdate, CoachGymsRead
from app.helpers.password_hash import get_password_hash
from app.services.coach_auth_service import CoachAuthService
from fastapi import HTTPException
import jwt
from app.settings.config import settings
from app.helpers.upload_image import upload_image
import logging
from sqlalchemy.orm import selectinload

logger = logging.getLogger()

class CoachService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_coach_by_phone_email(self, email: Optional[str], phone: Optional[str]) -> Coach | None:
        result = await self.db.execute(select(Coach).where(or_(Coach.email == email, Coach.phone == phone)))
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
                    db_city = await self.db.execute(select(City).where(City.name == city))
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
                    db_category = await self.db.execute(select(CourseCategory).where(CourseCategory.name == category))
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

    async def update_coach(self, coach_id: int, update_data: dict) -> CoachProfilePhotoPassport:
        try:
            query = (select(Coach).where(Coach.id == coach_id))
            result = await self.db.execute(query)
            coach = result.scalar_one_or_none()

            if not coach:
                raise HTTPException(status_code=404, detail="查無此帳號")

            if update_data.get("name"):
                        coach.name = update_data["name"]

            if update_data.get("account"):
                        coach.account = update_data["account"]

            if update_data.get("profile_photo"):
                profile_photo_url = await upload_image(update_data["profile_photo"], coach.account)
                coach.profile_photo = profile_photo_url

            if update_data.get("password"):
                coach.hashed_password = get_password_hash(update_data["password"])

            await self.db.commit()
            await self.db.refresh(coach)

            return CoachProfilePhotoPassport(
                id=coach.id,
                profile_photo=coach.profile_photo,
                name=coach.name,
                account=coach.account,
                email=coach.email
            )
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Unexpected error during coach verification: {e}")
            raise HTTPException(status_code=401, detail=f"str{e}")

    async def update_coach_cities(self, coach_id: int, coach_data: CoachCitiesUpdate) -> CoachCitiesUpdate:
        try:
            query = (
                select(Coach)
                .options(
                    selectinload(Coach.cities),
                )
                .where(Coach.id == coach_id)
            )
            result = await self.db.execute(query)
            coach = result.scalar_one_or_none()

            if not coach:
                raise ValueError("Coach not found")

            if coach_data.cities is not None:
                city_query = select(City).where(City.name.in_(coach_data.cities))
                cities_result = await self.db.execute(city_query)
                cities = cities_result.scalars().all()

            # 檢查是否混入名單外城市資料
            valid_city_names = {city.name for city in cities}
            invalid_cities = set(coach_data.cities) - valid_city_names
            if invalid_cities:
                raise ValueError(f"Invalid cities: {', '.join(invalid_cities)}")

            coach.cities = cities

            await self.db.commit()

            return CoachCitiesUpdate(
                cities=[city.name for city in coach.cities]
            )
        except Exception as e:
            await self.db.rollback()
            print(f"Error in update_coach: {str(e)}")
            raise

    async def update_coach_course_categories(self, coach_id: int, coach_data: CoachGymsRead) -> CoachCourseCategoriesUpdate:
        try:
            query = (
                select(Coach)
                .options(
                    selectinload(Coach.course_categories),
                )
                .where(Coach.id == coach_id)
            )
            result = await self.db.execute(query)
            coach = result.scalar_one_or_none()

            if not coach:
                raise ValueError("Coach not found")

            if coach_data.course_categories is not None:
                course_category_query = select(CourseCategory).where(CourseCategory.name.in_(coach_data.course_categories))
                course_categories_result = await self.db.execute(course_category_query)
                course_categories = course_categories_result.scalars().all()

            coach.course_categories = course_categories

            await self.db.commit()

            return CoachCourseCategoriesUpdate(
                course_categories=[course_category.name for course_category in coach.course_categories]
            )
        except Exception as e:
            await self.db.rollback()
            print(f"Error in update_coach: {str(e)}")
            raise


    async def update_coach_gyms(self, coach_id: int, coach_data: CoachGymsUpdate) -> CoachGymsUpdate:
        try:
            query = (
                select(Coach)
                .options(
                    selectinload(Coach.gyms),
                )
                .where(Coach.id == coach_id)
            )
            result = await self.db.execute(query)
            coach = result.scalar_one_or_none()

            if not coach:
                raise ValueError("Coach not found")

            if coach_data.gyms is not None:
                gym_query = select(Gym).where(Gym.id.in_(coach_data.gyms))
                gyms_result = await self.db.execute(gym_query)
                gyms = gyms_result.scalars().all()

            coach.gyms = gyms

            await self.db.commit()

            return CoachGymsUpdate(
                gyms=[{"id": gym.id, "name": gym.name, "address": gym.address} for gym in coach.gyms]
            )
        except Exception as e:
            await self.db.rollback()
            print(f"Error in update_coach: {str(e)}")
            raise

