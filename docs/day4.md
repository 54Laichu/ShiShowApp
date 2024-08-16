# 20240812 工作日誌

### 完成事項

#### 後端 UserAuthService 使用者驗證
- create_access_token
  - UserService `create_user()` 時，會調用 UserAuthService 中的 `create_access_token()`，回傳 jwt
- verify_current_user
  - 前端會透過 GET `api/v1/user/auth` 提供 Header 中的 token，如果驗證成功就會提供 UserRead 的 SQLModel

#### 前端
- index.html 頁面加入登入效果
- userAuth.js 驗證 token
- user_center.html
