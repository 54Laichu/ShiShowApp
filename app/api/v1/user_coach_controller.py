from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import JSONResponse
from app.models import UserCoach, User
from sqlalchemy.orm import joinedload
from app.schemas import UserCoachCreate, UserCoachUpdate
from app.services.user_auth_service import UserAuthService
from app.services.coach_auth_service import CoachAuthService
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.database import get_session
from typing import Annotated
import logging

logger = logging.getLogger()

router = APIRouter()


# 綁定教練功能 # pending, accepted, rejected
@router.post("/user_coach")
async def create_or_set_pending_user_coach(
	coach_data: UserCoachCreate,
	auth_header: Annotated[str, Header(alias="Authorization")],
	db: AsyncSession = Depends(get_session)) -> JSONResponse:
	try:
		user = await UserAuthService(db).verify_current_user(auth_header)

		query = select(UserCoach).where(
					(UserCoach.user_id == user.id) &
					(UserCoach.coach_id == coach_data.coach_id)
				)
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
			select(UserCoach, User.name.label("user_name"), User.phone.label("user_phone"))
			.join(User, UserCoach.user_id == User.id)
			.where(
					(UserCoach.coach_id == coach.id) &
					(UserCoach.status == "pending")
				)
		)

		result = await db.execute(query)
		user_coaches = result.all()

		if user_coaches:
			return [
				{
					"user_id": user_coach.UserCoach.user_id,
					"user_name": user_coach.user_name,
					"user_phone": user_coach.user_phone
				} for user_coach in user_coaches
			]
		else:
			return []

	except Exception as e:
		logger.error(f"Unexpected error during coach verification: {e}")
		raise HTTPException(status_code=500,  detail="綁定失敗，請與管理員聯繫")


# 更新邀約狀態 # pending, accepted, rejected
@router.put("/user_coach")
async def update_user_coach(
	user_coach_data: UserCoachUpdate,
	auth_header: Annotated[str, Header(alias="Authorization")],
	db: AsyncSession = Depends(get_session)) -> JSONResponse:
	try:
		coach = await CoachAuthService(db).verify_current_coach(auth_header)

		query = (select(UserCoach).where(UserCoach.user_id == user_coach_data.user_id and UserCoach.coach_id == coach.id))
		result = await db.execute(query)
		user_coach = result.scalar_one_or_none()

		if user_coach and user_coach_data.status == "accepted":
			user_coach.status = "accepted"
			await db.commit()
			return JSONResponse(status_code=200, content={"message": "已同意成為教練！"})
		if user_coach and user_coach_data.status == "rejected":
			user_coach.status = "rejected"
			await db.commit()
			return JSONResponse(status_code=200, content={"message": "已拒絕！"})

	except Exception as e:
		logger.error(f"Unexpected error during coach verification: {e}")
		raise HTTPException(status_code=500,  detail="失敗，請與管理員聯繫")
