from pydantic import BaseModel
from typing import List, Optional

class Device(BaseModel):
    device_id: str
    user_agent: str

class User(BaseModel):
    user_id: str
    devices: List[Device] = []

class LoginRequest(BaseModel):
    device_id: str
    user_agent: str

class ForceLogoutRequest(BaseModel):
    device_id: str
