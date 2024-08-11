# 20240811 工作日誌

## 完成事項
- SQLModel、alembic 環境安裝、設定
  - settings/config.py 用來區分 dev, prod 環境，並引入對應之環境變數
  - Alembic 設定
    - alembic init migrations
    - `cript.py.mako` 檔案中 import sqlmodel
    - 至 `alembic.ini` 設定 sqlalchemy.url 參數
  - 資料庫 model 設定 (`app/models.py`)
  - `app/models.py` 使用 SQLModel 創建需要之 table models
  - 回到 `migrations/env.py` 進行設定:
    -  ```python
        from app.models import User, Coach, UserCoach, City, UserCity, CoachCity, CourseCategory, UserCourseCategory, CoachCourseCategory, CoachPhoto, Certificate, Gym, CoachGym
       ```
- 執行 Alembic migration
  - alembic revision --autogenerate -m "initial migration"
  - 執行順利，在 vesrions 資料夾中產生 `xxxxx_initail_migration.py`，以及在 DB 當中產生一個 `alembic_version` table
  - 確認內容無誤，在 termainal 執行 `alembic upgrade head`
