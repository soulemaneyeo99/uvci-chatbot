from pydantic import BaseModel

class UVCICredentialsUpdate(BaseModel):
    username: str
    password: str

class UVCIStatusResponse(BaseModel):
    is_connected: bool
    username: str | None
    last_check: str | None = None
    message: str | None = None
