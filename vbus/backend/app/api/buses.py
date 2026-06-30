from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.bus import Bus
from app.schemas import BusOut

router = APIRouter()

@router.get("/", response_model=List[BusOut])
def list_buses(db: Session = Depends(get_db)):
    return db.query(Bus).filter(Bus.is_active == True).all()
