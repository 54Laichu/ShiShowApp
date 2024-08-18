# 20240814 工作日誌

### 完成事項

-  AWS 上雲：
   -  EC2: git clone https://github.com/54Laichu/ShiShowApp.git ，並於專案資料夾設定 python venv
   -  RDS : 透過 EC2 連線 RDS 進行 alembic upgrade head
   -  Godaddy domain 設定 Elastic IP DNS
   -  Dockerfile：
      -  sudo docker build -t shishow-app .
      -  sudo docker run -d -p 8000:8000 --env-file .env.prod shishow-app
