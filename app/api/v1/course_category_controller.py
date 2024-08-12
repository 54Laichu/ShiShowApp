from fastapi import APIRouter, Depends, HTTPException
from app.schemas import CheckCourseCategory
from app.models import CourseCategory
from sqlmodel import Session, select
from app.database import get_session


router = APIRouter()

@router.get("/course_categories")
async def index(db: Session = Depends(get_session)) -> list:
    statement = select(CourseCategory)  # 使用 select 來查詢所有 CourseCategory
    result = db.execute(statement)  # 執行查詢
    course_categories = result.scalars().all()  # 獲取結果並轉換為列表
    return course_categories

