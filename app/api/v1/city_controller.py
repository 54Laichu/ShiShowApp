from fastapi import APIRouter, Depends
from app.models import City
from app.schemas import CityRead
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import asc
from sqlmodel import select
from app.database import get_session
from typing import List

router = APIRouter()

@router.get("/cities")
async def index(db: AsyncSession = Depends(get_session)) -> List[CityRead]:
    query = select(City.name, City.id).order_by(asc(City.id))
    result = await db.execute(query)
    cities = result.all()
    return [CityRead(id=city.id, name=city.name) for city in cities]

