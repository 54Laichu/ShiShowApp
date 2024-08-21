from fastapi import APIRouter, Depends
from app.models import CourseCategory
from app.schemas import CourseCategoryRead
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import asc
from sqlmodel import select
from app.database import get_session
from typing import List

router = APIRouter()

@router.get("/course_categories")
async def index(db: AsyncSession = Depends(get_session)) -> List[CourseCategoryRead]:
    query = select(CourseCategory.name, CourseCategory.id).order_by(asc(CourseCategory.id))
    result = await db.execute(query)
    course_categories = result.all()
    return [CourseCategoryRead(id=category.id, name=category.name) for category in course_categories]

