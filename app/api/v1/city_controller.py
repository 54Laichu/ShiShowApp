from fastapi import APIRouter, Depends, HTTPException
from app.models import City
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import asc
from sqlalchemy.future import select
from app.database import get_session

router = APIRouter()

@router.get("/cities")
async def index(db: AsyncSession = Depends(get_session)) -> list:
    query = select(City).order_by(asc(City.id))
    result = await db.execute(query)
    cities = result.scalars().all()
    return cities

