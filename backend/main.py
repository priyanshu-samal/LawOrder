from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from auth import get_current_user
from database import (
    get_user,
    add_device_to_user,
    remove_device_from_user,
    MAX_DEVICES,
    User as DBUser
)
from models import LoginRequest, Device, ForceLogoutRequest

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # In production, replace with your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/login")
def login(login_request: LoginRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    user = get_user(user_id)

    if user and len(user.devices) >= MAX_DEVICES:
        # Check if the current device is already registered
        if not any(d.device_id == login_request.device_id for d in user.devices):
            return HTTPException(status_code=409, detail="Device limit reached", \
                                 headers={"X-Error-Type": "DeviceLimitReached"})

    device = Device(device_id=login_request.device_id, user_agent=login_request.user_agent)
    add_device_to_user(user_id, device)
    return {"status": "success"}

@app.post("/api/logout")
def logout(request: Request, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    device_id = request.headers.get("X-Device-ID")
    if device_id:
        remove_device_from_user(user_id, device_id)
    return {"status": "success"}

@app.get("/api/me")
def get_me(current_user: dict = Depends(get_current_user)):
    # You can customize this to return the user info you need
    # The user info is available in the `current_user` dict
    return {
        "full_name": current_user.get("name"),
        "phone_number": current_user.get("phone_number", "Not available") # Assuming phone_number is a custom claim
    }

@app.get("/api/devices", response_model=List[Device])
def get_devices(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    user = get_user(user_id)
    return user.devices if user else []

@app.post("/api/force-logout")
def force_logout(request: ForceLogoutRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    remove_device_from_user(user_id, request.device_id)
    return {"status": "success"}

@app.get("/api/status")
def get_status(request: Request, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    device_id = request.headers.get("X-Device-ID")
    user = get_user(user_id)

    if not user or not any(d.device_id == device_id for d in user.devices):
        return {"active": False}
    
    return {"active": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)