# 20240810 工作日誌

## 完成事項：
- 建立專案虛擬環景 venv，並使用 pip install -r requirements.txt 安裝必要套件
- 使用 npm 安裝 tailwindcss
  - npm install -D tailwindcss
  - npx tailwindcss init
  - 修改 tailwind.config.js: 修改 content，在當中加入要導出的路徑
    - ```javascript
      /** @type {import('tailwindcss').Config} */
      module.exports = {
        content: [
            "./app/templates/**/*.html",
            "./app/views/**/*.html",
            "./app/static/**/*.js",
        ],
        theme: {
        extend: {},
        },
        plugins: [],
      }
      ```
  - 在 package.json 新增腳本
    -  ```javascript
        "scripts": {
        "build-css": "tailwindcss -i ./app/static/css/main.css -o ./app/static/css/output.css --minify",
        },
        ```
  - 若是在 html 中有引入新的 tailwindcss class，可使用 npx tailwindcss -i ./static/styles.css -o ./static/output.css 更新 output.css
- 建立 main.py，並設定 index.html 為首頁
- 建立靜態文件：使用 jinja2 建立 base.html, index.html
- 建立 Dockerfile、.dockerignore
- 初始化 git
