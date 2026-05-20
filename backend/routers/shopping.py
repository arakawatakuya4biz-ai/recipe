from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/shopping", tags=["shopping"])


@router.get("", response_model=List[schemas.ShoppingItemOut])
def list_shopping(db: Session = Depends(get_db)):
    return db.query(models.ShoppingItem).order_by(
        models.ShoppingItem.store,
        models.ShoppingItem.created_at
    ).all()


@router.post("", response_model=schemas.ShoppingItemOut)
def create_shopping(item: schemas.ShoppingItemCreate, db: Session = Depends(get_db)):
    db_item = models.ShoppingItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.patch("/{item_id}", response_model=schemas.ShoppingItemOut)
def update_shopping(item_id: int, item: schemas.ShoppingItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.ShoppingItem).filter(models.ShoppingItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(db_item, field, value)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/{item_id}")
def delete_shopping(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.ShoppingItem).filter(models.ShoppingItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"ok": True}


@router.delete("")
def clear_checked(db: Session = Depends(get_db)):
    db.query(models.ShoppingItem).filter(models.ShoppingItem.checked == True).delete()
    db.commit()
    return {"ok": True}
