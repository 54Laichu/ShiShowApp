# 20240812 工作日誌

### 完成事項

#### DB
- INSERT INTO city (name)
VALUES ("臺北市"), ("新北市"), ("基隆市"), ("桃園市"), ("新竹縣"), ("新竹市"), ("苗栗縣"), ("臺中市"), ("南投縣"), ("彰化縣"), ("雲林縣"), ("嘉義縣"), ("嘉義市"), ("臺南市"), ("高雄市"), ("屏東縣"), ("宜蘭縣"), ("花蓮縣"), ("臺東縣"), ("澎湖縣"), ("金門縣"), ("連江縣");

- INSERT INTO coursecategory (name)
VALUES ("重量訓練"), ("飛輪"), ("肌肉伸展"), ("拳擊有氧"), ("綜合格鬥"), ("間歇訓練"), ("環狀訓練"), ("瑜伽"), ("防身術"), ("其他");

#### DB 改非同步連線
- app/database.py
- alembic init --template async ./migrations  https://ithelp.ithome.com.tw/articles/10330152?sc=rss.iron
- 將 UserService methods改成 async
- pip install greenlet 管理 SQLAlchemy 中的 AsyncSession https://habr.com/en/articles/767532/

#### Alembic migration
- alembic revision --autogenerate -m "add unique True to cloumns"
- alembic revision --autogenerate -m "add created_at updated_at to User and Coach"

### APIs
- user_controller.py
  - POST `api/v1/user` 建立新使用者
    - `get_user_by_phone_email 在輸入 DB 前先檢查是否有重複資料
    - 在 UserService 新增 create_user() 方法
    - 在 UserAuthService 新增 create_access_token() 方法，如果使用者創建成功，就建立並回傳 jwt token
  - GET `api/v1/cities` fetch 城市 list
  - GET `api/v1/course_categories` fetch 課程類型 list

### 前端
- inner_base.html (內分頁套用的 template)
- inner_header.html (內分頁套用的 template)
- register.html
- registerForm.js
- fetchData.js (撈 city, usercoursecategory 資料)
