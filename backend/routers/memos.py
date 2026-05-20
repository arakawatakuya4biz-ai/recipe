from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/memos", tags=["memos"])


@router.get("", response_model=List[schemas.RecipeMemoOut])
def list_memos(db: Session = Depends(get_db)):
    return db.query(models.RecipeMemo).order_by(models.RecipeMemo.created_at.desc()).all()


@router.post("", response_model=schemas.RecipeMemoOut)
def create_memo(item: schemas.RecipeMemoCreate, db: Session = Depends(get_db)):
    db_item = models.RecipeMemo(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.patch("/{item_id}", response_model=schemas.RecipeMemoOut)
def update_memo(item_id: int, item: schemas.RecipeMemoUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.RecipeMemo).filter(models.RecipeMemo.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(db_item, field, value)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/{item_id}")
def delete_memo(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.RecipeMemo).filter(models.RecipeMemo.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"ok": True}
