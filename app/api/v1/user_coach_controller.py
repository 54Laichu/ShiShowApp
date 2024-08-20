from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import JSONResponse
from app.models import UserCoach, User
from sqlalchemy.orm import joinedload
from app.schemas import UserCoachCreate
from app.services.user_auth_service import UserAuthService
from app.services.coach_auth_service import CoachAuthService
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
	coach_data: UserCoachCreate,
	auth_header: Annotated[str, Header(alias="Authorization")],
	db: AsyncSession = Depends(get_session)) -> JSONResponse:
	try:
		user = await UserAuthService(db).verify_current_user(auth_header)

		query = (select(UserCoach).filter(UserCoach.user_id == user.id and UserCoach.coach_id == coach_data.coach_id))
		result = await db.execute(query)
		user_coach = result.scalar_one_or_none()

		if user_coach and user_coach.status == "pending":
			return JSONResponse(status_code=200, content={"message": "之前已提出申請，等待教練確認中"})
		if user_coach and user_coach.status == "accepted":
			return JSONResponse(status_code=200, content={"message": "目前已是該教練學生"})
		if user_coach and user_coach.status == "rejected":
			return JSONResponse(status_code=200, content={"message": "該教練目前無法安排授課"})

		db_user_coach =  UserCoach(user_id=user.id, coach_id=coach_data.coach_id)
		db.add(db_user_coach)
		await db.commit()
		return JSONResponse(status_code=200, content={"message": "申請成功，請等待教練確認"})

	except Exception as e:
		logger.error(f"Unexpected error during coach verification: {e}")
		raise HTTPException(status_code=500,  detail="綁定失敗，請與管理員聯繫")

# 教練查看學生邀請
@router.get("/user_coach")
async def get_user_coach(auth_header: Annotated[str, Header(alias="Authorization")], db: AsyncSession = Depends(get_session)) -> JSONResponse:
	try:
		coach = await CoachAuthService(db).verify_current_coach(auth_header)

		query = (
			select(UserCoach, User.name.label("user_name"))
			.join(User, UserCoach.user_id == User.id)
			.filter(UserCoach.coach_id == coach.id)
		)

		result = await db.execute(query)
		user_coaches = result.all()

		if user_coaches:
			return [
				{
					"user_id": user_coach.UserCoach.user_id,
					"user_name": user_coach.user_name
				} for user_coach in user_coaches
			]
		else:
			return []

	except Exception as e:
		logger.error(f"Unexpected error during coach verification: {e}")
		raise HTTPException(status_code=500,  detail="綁定失敗，請與管理員聯繫")
