from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse
from app.api.v1 import user_controller

app = FastAPI()

# https://fastapi.tiangolo.com/reference/staticfiles/
app.mount("/static", StaticFiles(directory="./app/static"), name="static")

# https://fastapi.tiangolo.com/reference/templating/
templates = Jinja2Templates(directory=["./app/templates", "./app/views"])

@app.get("/favicon.ico")
async def favicon():
  return RedirectResponse(url="/static/favicon.ico")

@app.get("/", include_in_schema=False)
async def index(request: Request):
  return templates.TemplateResponse("index.html", {"request": request})


app.include_router(user_controller.router, prefix="/api/v1", tags=["User"])
