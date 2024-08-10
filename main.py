from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()

# https://fastapi.tiangolo.com/reference/staticfiles/
app.mount("/static", StaticFiles(directory="./app/static"), name="static")

# https://fastapi.tiangolo.com/reference/templating/
templates = Jinja2Templates(directory=["./app/templates", "./app/views"])

@app.get("/", include_in_schema=False)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
