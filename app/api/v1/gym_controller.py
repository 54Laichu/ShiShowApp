from fastapi import APIRouter, Depends
from app.models import Gym, City
from app.schemas import GymRead
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import asc
from sqlmodel import select
from app.database import get_session
from typing import List
from sqlalchemy.orm import selectinload

router = APIRouter()

@router.get("/gyms")
async def index(city_id: int, db: AsyncSession = Depends(get_session)) -> List[GymRead]:
    query = select(Gym).options(
        selectinload(Gym.city)
    ).where(Gym.city_id == city_id).order_by(asc(Gym.id))

    result = await db.execute(query)
    gyms = result.scalars().all()

    return [GymRead(id=gym.id, name=gym.name, address=gym.address) for gym in gyms]

