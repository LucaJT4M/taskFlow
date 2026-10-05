from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from be.core.db import get_db
from be.models.user_model import User
from be.schemas.garden_schema import GardenResponse
from be.security.current_user import get_current_user
from be.services.garden_service import GardenService

router = APIRouter(prefix="/garden", tags=["Garden"])
garden_service = GardenService()


@router.get("", response_model=GardenResponse)
def get_garden(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Der Garten des eingeloggten Benutzers."""
    return garden_service.get_garden(db, user)
