from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List
from app.schemas import UserBase, CoachBase
# 需要留意 table models 之間引入先後順序的問題

class UserCity(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    city_id: int = Field(foreign_key="city.id", primary_key=True)

class CoachCity(SQLModel, table=True):
    coach_id: int = Field(foreign_key="coach.id", primary_key=True)
    city_id: int = Field(foreign_key="city.id", primary_key=True)

class UserCoach(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    coach_id: int = Field(foreign_key="coach.id", primary_key=True)
    status: str = Field(default="pending")  # pending, accepted, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class City(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    users: List["User"] = Relationship(back_populates="cities", link_model=UserCity)
    coaches: List["Coach"] = Relationship(back_populates="cities", link_model=CoachCity)
    gyms: List["Gym"] = Relationship(back_populates="city")

class UserCourseCategory(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    category_id: int = Field(foreign_key="coursecategory.id", primary_key=True)

class CoachCourseCategory(SQLModel, table=True):
    coach_id: int = Field(foreign_key="coach.id", primary_key=True)
    category_id: int = Field(foreign_key="coursecategory.id", primary_key=True)

class CourseCategory(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: Optional[str] = None
    users: List["User"] = Relationship(back_populates="course_categories", link_model=UserCourseCategory)
    coaches: List["Coach"] = Relationship(back_populates="course_categories", link_model=CoachCourseCategory)

class CoachPhoto(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    coach_id: int = Field(foreign_key="coach.id")
    photo_url: str
    is_profile: bool = Field(default=False)
    coach: "Coach" = Relationship(back_populates="photos")

class Certificate(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    coach_id: int = Field(foreign_key="coach.id")
    name: str
    issue_date: datetime
    expiry_date: Optional[datetime] = None
    certificate_url: str
    coach: "Coach" = Relationship(back_populates="certificates")

class CoachGym(SQLModel, table=True):
    coach_id: int = Field(foreign_key="coach.id", primary_key=True)
    gym_id: int = Field(foreign_key="gym.id", primary_key=True)

class Gym(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    address: str = Field(unique=True)
    city_id: int = Field(foreign_key="city.id")
    city: City = Relationship(back_populates="gyms")
    coaches: List["Coach"] = Relationship(back_populates="gyms", link_model=CoachGym)

class User(UserBase, table=True):
    id: int = Field(default=None, primary_key=True)
    hashed_password: str
    coaches: List["Coach"] = Relationship(back_populates="users", link_model=UserCoach)
    cities: List["City"] = Relationship(back_populates="users", link_model=UserCity)
    course_categories: List["CourseCategory"] = Relationship(back_populates="users", link_model=UserCourseCategory)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Coach(CoachBase, table=True):
    id: int = Field(default=None, primary_key=True)
    hashed_password: str
    profile_photo: Optional[str] = Field(default=None)
    bio: Optional[str] = Field(default=None)
    users: List[User] = Relationship(back_populates="coaches", link_model=UserCoach)
    cities: List["City"] = Relationship(back_populates="coaches", link_model=CoachCity)
    course_categories: List["CourseCategory"] = Relationship(back_populates="coaches", link_model=CoachCourseCategory)
    certificates: List["Certificate"] = Relationship(back_populates="coach")
    photos: List["CoachPhoto"] = Relationship(back_populates="coach")
    gyms: List["Gym"] = Relationship(back_populates="coaches", link_model=CoachGym)
    certificates: List["Certificate"] = Relationship(back_populates="coach", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    photos: List["CoachPhoto"] = Relationship(back_populates="coach", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
