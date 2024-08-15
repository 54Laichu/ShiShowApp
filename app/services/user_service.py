from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import Optional
from app.models import User, CourseCategory, City, Coach
from app.schemas import UserCreate, CheckCity, CheckCourseCategory, UserRead, UserUpdate
from app.helpers.password_hash import get_password_hash
from app.services.user_auth_service import UserAuthService
from sqlalchemy.orm import selectinload

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_user(self, user: UserCreate) -> User:
        db_user = User(
            name=user.name,
            email=user.email,
            phone=user.phone,
            hashed_password=get_password_hash(user.password),
            is_active=user.is_active
        )

        if user.cities:
            for city in user.cities:
                if city in [item.value for item in CheckCity]:
                    db_city = await self.db.execute(select(City).filter(City.name == city))
                    db_city = db_city.scalar_one_or_none()
                    if db_city:
                        db_user.cities.append(db_city)
                    else:
                        raise ValueError(f"系統錯誤，請向客服人員聯繫")
                else:
                    raise ValueError(f"查無：{city}")

        if user.course_categories:
            for category in user.course_categories:
                if category in [item.value for item in CheckCourseCategory]:
                    db_category = await self.db.execute(select(CourseCategory).filter(CourseCategory.name == category))
                    db_category = db_category.scalar_one_or_none()
                    if db_category:
                        db_user.course_categories.append(db_category)
                    else:
                        raise ValueError(f"系統錯誤，請向客服人員聯繫")
                else:
                    raise ValueError(f"查無：{category}")

        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        print(db_user.id)
        token = UserAuthService.create_access_token(db_user.id)
        return token

    async def get_user_by_phone_email(self, email: Optional[str], phone: Optional[str]) -> User | None:
        result = await self.db.execute(select(User).filter((User.email == email) | (User.phone == phone)))
        return result.scalar_one_or_none()

    async def update_user(self, user_id: int, user_data: UserUpdate) -> UserRead:
            print(f"Updating user {user_id} with data: {user_data}")
            try:
                # Load user with related entities
                query = (
                    select(User)
                    .options(
                        selectinload(User.cities),
                        selectinload(User.course_categories),
                        selectinload(User.coaches)
                    )
                    .where(User.id == user_id)
                )
                result = await self.db.execute(query)
                user = result.scalar_one_or_none()

                if not user:
                    raise ValueError("User not found")

                # Update user data
                if user_data.name is not None:
                    user.name = user_data.name
                if user_data.password is not None and user_data.password != '':
                    user.hashed_password = get_password_hash(user_data.password)

                if user_data.cities is not None:
                    user.cities = []
                    for city_name in user_data.cities:
                        city_query = select(City).where(City.name == city_name)
                        city = (await self.db.execute(city_query)).scalar_one_or_none()
                        if city:
                            user.cities.append(city)
                        else:
                            raise ValueError(f"Invalid city: {city_name}")

                if user_data.course_categories is not None:
                    user.course_categories = []
                    for category_name in user_data.course_categories:
                        category_query = select(CourseCategory).where(CourseCategory.name == category_name)
                        category = (await self.db.execute(category_query)).scalar_one_or_none()
                        if category:
                            user.course_categories.append(category)
                        else:
                            raise ValueError(f"Invalid course category: {category_name}")

                if user_data.coaches is not None:
                    user.coaches = []
                    for coach_name in user_data.coaches:
                        coach_query = select(Coach).where(Coach.name == coach_name)
                        coach = (await self.db.execute(coach_query)).scalar_one_or_none()
                        if coach:
                            user.coaches.append(coach)
                        else:
                            raise ValueError(f"Invalid coach: {coach_name}")

                await self.db.commit()

                return UserRead(
                    id=user.id,
                    name=user.name,
                    email=user.email,
                    cities=[city.name for city in user.cities],
                    course_categories=[category.name for category in user.course_categories],
                    coaches=[coach.name for coach in user.coaches]
                )
            except Exception as e:
                await self.db.rollback()
                print(f"Error in update_user: {str(e)}")
                raise
