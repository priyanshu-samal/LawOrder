from typing import Dict, List
from models import User, Device

# In-memory database
# In a production environment, you would use a persistent database like PostgreSQL or MongoDB.
db: Dict[str, User] = {}

# Configure the maximum number of allowed devices
MAX_DEVICES = 3

def get_user(user_id: str) -> User:
    return db.get(user_id)

def create_user(user_id: str) -> User:
    user = User(user_id=user_id)
    db[user_id] = user
    return user

def add_device_to_user(user_id: str, device: Device):
    user = get_user(user_id)
    if not user:
        user = create_user(user_id)
    
    # Remove any existing device with the same ID
    user.devices = [d for d in user.devices if d.device_id != device.device_id]

    user.devices.append(device)
    db[user_id] = user

def remove_device_from_user(user_id: str, device_id: str):
    user = get_user(user_id)
    if user:
        user.devices = [d for d in user.devices if d.device_id != device_id]
        db[user_id] = user
