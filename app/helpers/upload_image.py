import os
import shutil
import boto3
from app.settings.config import settings
from fastapi import UploadFile
from app.settings.config import settings

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

s3_client = boto3.client(
        's3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION
)

S3_BUCKET_NAME = settings.S3_BUCKET_NAME
S3_DOMAIN=settings.S3_DOMAIN

async def upload_image(img: UploadFile, account: str):
    try:
            file_type = os.path.splitext(img.filename)[1].lower()
            new_filename = account + file_type
            if settings.ENV == 'prod':
                    # 如果正式環境，上傳到 S3
                    s3_file_key = f"/coach/profile_photo/{new_filename}"
                    s3_client.upload_fileobj(img.file, S3_BUCKET_NAME, s3_file_key)
                    s3_url = f"https://{S3_DOMAIN}/coach/profile_photo/{s3_file_key}"
            else:
                    # 如果測試環境，上傳本機
                    file_location = os.path.join(UPLOAD_DIR, new_filename)
                    with open(file_location, "wb+") as file_object:
                            shutil.copyfileobj(img.file, file_object)
                    s3_url = f"{UPLOAD_DIR}/{new_filename}"
            return s3_url
    except Exception as e:
            raise e
