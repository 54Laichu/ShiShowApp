from fastapi import APIRouter, Depends, HTTPException
from app.schemas import CheckCourseCategory
from app.models import CourseCategory
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_session


router = APIRouter()

@router.get("/course_categories")
async def index(db: AsyncSession = Depends(get_session)) -> list:
    result = await db.execute(select(CourseCategory))
    course_categories = result.scalars().all()  # scalars() 是 sqlalchemy Result object 的方法，可以將回傳資料轉換成 list
    return course_categories

