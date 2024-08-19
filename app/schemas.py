from sqlmodel import SQLModel, Field
from enum import Enum
from datetime import datetime
from typing import Optional, List
from pydantic import EmailStr

class UserBase(SQLModel):
    name: str
    email: EmailStr = Field(unique=True, index=True)
    phone: str = Field(unique=True)
    is_active: bool = Field(default=True)

class UserCreate(UserBase):
    password: str
    cities: List[str]
    course_categories: List[str]

class UserUpdate(SQLModel):
    name: Optional[str] = None
    password: Optional[str] = None

class CoachUpdate(SQLModel):
    profile_photo: Optional[str] = None
    account: Optional[str] = None
    name: Optional[str] = None
    password: Optional[str] = None

class UserCitiesUpdate(SQLModel):
    cities: List[str]

    class Config:
        orm_mode = True

class UserCourseCategoriessUpdate(SQLModel):
    course_categories: List[str]

    class Config:
        orm_mode = True

class UserPassport(SQLModel):
    id: int
    name: str
    email: str

    class Config:
        orm_mode = True

class CoachPassport(SQLModel):
    id: int
    name: str
    account: str

    class Config:
        orm_mode = True

class CoachProfilePhotoPassport(CoachPassport):
    profile_photo: Optional[str] = None

class UserRead(SQLModel):
    id: int
    name: str
    email: str
    cities: Optional[List[str]] = None
    course_categories: Optional[List[str]] = None
    coaches: Optional[List[str]] = None

    class Config:
        orm_mode = True

class CoachRead(SQLModel):
    id: int
    name: str
    profile_photo: Optional[str] = None
    account: str
    email: str
    certificates: Optional[List[str]] = None
    cities: Optional[List[str]] = None
    course_categories: Optional[List[str]] = None
    gyms: Optional[List[dict]] = None

    class Config:
        orm_mode = True

class UserLogin(SQLModel):
    email: EmailStr
    password: str

class CoachLogin(SQLModel):
    email: EmailStr
    password: str

class CoachBase(SQLModel):
    name: str
    account: str = Field(unique=True, index=True)
    email: EmailStr = Field(unique=True, index=True)
    phone: str = Field(unique=True)
    is_active: bool = Field(default=True)

class CoachCreate(CoachBase):
    password: str
    cities: List[str]
    course_categories: List[str]

class CheckCity(Enum):
    TPE = "臺北市"
    NTP = "新北市"
    KEL = "基隆市"
    TUN = "桃園市"
    HSC = "新竹縣"
    HS = "新竹市"
    MLC = "苗栗縣"
    TC = "臺中市"
    NTC = "南投縣"
    CH = "彰化縣"
    YL = "雲林縣"
    CY = "嘉義縣"
    CYI = "嘉義市"
    TN = "臺南市"
    KS = "高雄市"
    PT = "屏東縣"
    IL = "宜蘭縣"
    HL = "花蓮縣"
    TD = "臺東縣"
    PH = "澎湖縣"
    KM = "金門縣"
    LJG = "連江縣"

class CheckCourseCategory(Enum):
    WEIGHT_TRAINING = "重量訓練"
    SPINNING = "飛輪"
    MUSCLE_STRETCHING = "肌肉伸展"
    BOXING_AEROBICS = "拳擊有氧"
    MIXED_MARTIAL_ARTS = "綜合格鬥"
    INTERVAL_TRAINING = "間歇訓練"
    CIRCUIT_TRAINING = "環狀訓練"
    YOGA = "瑜伽"
    SELF_DEFENSE = "防身術"
    OTHER = "其他"
