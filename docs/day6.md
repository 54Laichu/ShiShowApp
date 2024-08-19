# 20240814 工作日誌

### 完成事項

-  AWS 上雲：
   -  EC2: git clone https://github.com/54Laichu/ShiShowApp.git ，並於專案資料夾設定 python venv
   -  RDS : 透過 EC2 連線 RDS 進行 alembic upgrade head
   -  Godaddy domain 設定 Elastic IP DNS
   -  Dockerfile：
      -  sudo docker build -t shishow-app .
      -  sudo docker run -d -p 8000:8000 --env-file .env.prod shishow-app
   - IAM：建立新的 IAM S3 管理帳號與 AWS_ACCESS_KEY_ID、 AWS_SECRET_ACCESS_KEY
   - S3 修改 pudlic access 權限與 Policy 。
   - 
      ```json
      {
      "Version": "2012-10-17",
      "Statement": [
         {
               "Sid": "Statement1",
               "Effect": "Allow",
               "Principal": "*",
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::shishow/*"
         }
      ]
      }
      ```
