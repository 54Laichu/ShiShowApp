import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
# https://docs.pydantic.dev/latest/concepts/pydantic_settings/

ENV = os.getenv("ENV", "dev")

load_dotenv(f".env.{ENV}")

class Setting(BaseSettings):
  DB_URL: str
  JWT_SECRET_KEY: str
  JWT_ALGORITHM: str
  JWT_EXPIRE_DAYS: int

settings = Setting()
