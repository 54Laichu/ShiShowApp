from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from app.settings.config import settings
import jwt


class UserAuthService:

    @staticmethod
    def create_access_token(user_id: int) -> str:
        encode_content = {
            "id": str(user_id),
            "exp": datetime.utcnow() + timedelta(days=settings.JWT_EXPIRE_DAYS)
        }
        access_token =  jwt.encode(encode_content, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return JSONResponse(status_code=200, content={"access_token": access_token, "token_type": "bearer"})
