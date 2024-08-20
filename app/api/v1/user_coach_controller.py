from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import JSONResponse
from app.models import UserCoach
from app.schemas import UserCoachCreate
from app.services.user_auth_service import UserAuthService
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.database import get_session
from typing import Annotated
import logging

logger = logging.getLogger()

router = APIRouter()


# 綁定教練功能
@router.post("/user_coach")
async def create_or_set_pending_user_coach(
	coach: UserCoachCreate,
	auth_header: Annotated[str, Header(alias="Authorization")],
	db: AsyncSession = Depends(get_session)) -> JSONResponse:
	try:
		user = await UserAuthService(db).verify_current_user(auth_header)
		coach_id = coach.coach_id

		query = (select(UserCoach).filter(UserCoach.user_id == user.id and UserCoach.coach_id == coach_id))
		result = await db.execute(query)
		user_coach = result.scalar_one_or_none()

		if user_coach and user_coach.status == "pending":
			return JSONResponse(status_code=200, content={"message": "之前已提出申請，等待教練確認中"})
		if user_coach and user_coach.status == "accepted":
			return JSONResponse(status_code=200, content={"message": "目前已是該教練學生"})
		if user_coach and user_coach.status == "rejected":
			return JSONResponse(status_code=200, content={"message": "該教練目前無法安排授課"})

		db_user_coach =  UserCoach(user_id=user.id, coach_id=coach_id)
		db.add(db_user_coach)
		await db.commit()
		return JSONResponse(status_code=200, content={"message": "申請成功，請等待教練確認"})

	except Exception as e:
		logger.error(f"Unexpected error during coach verification: {e}")
		raise HTTPException(status_code=500,  detail="綁定失敗，請與管理員聯繫")
