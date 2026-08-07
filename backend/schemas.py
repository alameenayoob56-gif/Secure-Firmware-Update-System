from pydantic import BaseModel


class DeviceCreate(BaseModel):
    device_name: str
    serial_number: str
    model: str
    firmware_version: str


class DeviceUpdate(BaseModel):
    device_name: str
    model: str
    firmware_version: str
    status: str


class DeploymentCreate(BaseModel):
    device_id: int
    firmware_id: int
