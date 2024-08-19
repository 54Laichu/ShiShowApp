import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
# https://docs.pydantic.dev/latest/concepts/pydantic_settings/

ENV = os.getenv("ENV", "dev")

load_dotenv(f".env.{ENV}")

class Setting(BaseSettings):
  ENV: str
  DB_URL: str
  JWT_SECRET_KEY: str
  JWT_ALGORITHM: str
  JWT_EXPIRE_DAYS: int
  AWS_ACCESS_KEY_ID: str
  AWS_SECRET_ACCESS_KEY: str
  AWS_REGION: str
  S3_BUCKET_NAME: str
  S3_DOMAIN: str

settings = Setting()
# https://docs.pydantic.dev/latest/concepts/pydantic_settings/
