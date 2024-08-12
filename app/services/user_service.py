from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User, CourseCategory, City
from app.schemas import UserCreate, CheckCity, CheckCourseCategory
from app.helpers.password_hash import get_password_hash

class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_user(self, user: UserCreate) -> User:
        db_user = User(
            username=user.username,
            email=user.email,
            phone=user.phone,
            hashed_password=get_password_hash(user.password),
            is_active=user.is_active
        )

        if user.cities:
            for city in user.cities:
                if city.name in CheckCity.__members__:
                    # 如果有在 enum 中，再查詢資料庫
                    db_city = await self.db.query(City).filter_by(name=city.name).first()
                    if db_city:
                        db_user.cities.append(db_city)
                else:
                    raise ValueError(f"查無{city.name}")

        if user.course_categories:
            for category in user.course_categories:
                if category.name in CheckCourseCategory.__members__:
                    # 如果有在 enum 中，再查詢資料庫
                    db_city = await self.db.query(CourseCategory).filter_by(name=category.name).first()
                    if db_city:
                        db_user.cities.append(db_city)
                else:
                    raise ValueError(f"查無{category.name}")

        await self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
