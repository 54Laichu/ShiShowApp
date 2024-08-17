from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse
from app.api.v1 import user_controller, course_category_controller, city_controller, coach_controller

app = FastAPI()

# https://fastapi.tiangolo.com/reference/staticfiles/
app.mount("/static", StaticFiles(directory="./app/static"), name="static")

# https://fastapi.tiangolo.com/reference/templating/
templates = Jinja2Templates(directory=["./app/templates", "./app/views"])

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
  return RedirectResponse(url="/static/favicon.ico")

# users frontend
@app.get("/", include_in_schema=False)
async def index(request: Request):
  return templates.TemplateResponse("index.html", {"request": request})
@app.get("/register", include_in_schema=False)
async def create(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})
@app.get("/user_center", include_in_schema=False)
async def show(request: Request):
    return templates.TemplateResponse("user_center.html", {"request": request})

# coaches frontend
@app.get("/coach", include_in_schema=False)
async def index(request: Request):
  return templates.TemplateResponse("coach/index.html", {"request": request})
@app.get("/coach/register", include_in_schema=False)
async def create_coach(request: Request):
  return templates.TemplateResponse("coach/register.html", {"request": request})
@app.get("/coach/coach_center", include_in_schema=False)
async def show(request: Request):
    return templates.TemplateResponse("coach/coach_center.html", {"request": request})


app.include_router(coach_controller.router, prefix="/api/v1", tags=["Coach"])
app.include_router(user_controller.router, prefix="/api/v1", tags=["User"])
app.include_router(course_category_controller.router, prefix="/api/v1", tags=["CourseCategory"])
app.include_router(city_controller.router, prefix="/api/v1", tags=["City"])

