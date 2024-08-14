from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import User, CourseCategory, City
from app.schemas import UserCreate, CheckCity, CheckCourseCategory
from app.helpers.password_hash import get_password_hash
from app.services.user_auth_service import UserAuthService

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

    async def get_user_by_phone_email(self, email: str, phone: str) -> User | None:
        result = await self.db.execute(select(User).filter((User.email == email) | (User.phone == phone)))
        return result.scalar_one_or_none()
