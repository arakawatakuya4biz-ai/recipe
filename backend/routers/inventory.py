from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/inventory", tags=["inventory"])


# --- Vegetables ---
@router.get("/vegetables", response_model=List[schemas.InventoryVegetableOut])
def list_vegetables(db: Session = Depends(get_db)):
    return db.query(models.InventoryVegetable).order_by(
        models.InventoryVegetable.is_staple.desc(),
        models.InventoryVegetable.created_at
    ).all()


@router.post("/vegetables", response_model=schemas.InventoryVegetableOut)
def create_vegetable(item: schemas.InventoryVegetableCreate, db: Session = Depends(get_db)):
    db_item = models.InventoryVegetable(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.patch("/vegetables/{item_id}", response_model=schemas.InventoryVegetableOut)
def update_vegetable(item_id: int, item: schemas.InventoryVegetableUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.InventoryVegetable).filter(models.InventoryVegetable.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(db_item, field, value)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/vegetables/{item_id}")
def delete_vegetable(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.InventoryVegetable).filter(models.InventoryVegetable.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"ok": True}


# --- Fridge ---
@router.get("/fridge", response_model=List[schemas.InventoryFridgeOut])
def list_fridge(db: Session = Depends(get_db)):
    return db.query(models.InventoryFridge).order_by(
        models.InventoryFridge.expiry_date.asc().nullslast(),
        models.InventoryFridge.created_at
    ).all()


@router.post("/fridge", response_model=schemas.InventoryFridgeOut)
def create_fridge(item: schemas.InventoryFridgeCreate, db: Session = Depends(get_db)):
    db_item = models.InventoryFridge(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.patch("/fridge/{item_id}", response_model=schemas.InventoryFridgeOut)
def update_fridge(item_id: int, item: schemas.InventoryFridgeUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.InventoryFridge).filter(models.InventoryFridge.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(db_item, field, value)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/fridge/{item_id}")
def delete_fridge(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.InventoryFridge).filter(models.InventoryFridge.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"ok": True}


# --- Freezer ---
@router.get("/freezer", response_model=List[schemas.InventoryFreezerOut])
def list_freezer(db: Session = Depends(get_db)):
    return db.query(models.InventoryFreezer).order_by(
        models.InventoryFreezer.category,
        models.InventoryFreezer.created_at
    ).all()


@router.post("/freezer", response_model=schemas.InventoryFreezerOut)
def create_freezer(item: schemas.InventoryFreezerCreate, db: Session = Depends(get_db)):
    db_item = models.InventoryFreezer(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.patch("/freezer/{item_id}", response_model=schemas.InventoryFreezerOut)
def update_freezer(item_id: int, item: schemas.InventoryFreezerUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.InventoryFreezer).filter(models.InventoryFreezer.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(db_item, field, value)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/freezer/{item_id}")
def delete_freezer(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.InventoryFreezer).filter(models.InventoryFreezer.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"ok": True}


# --- RoomTemp ---
@router.get("/room_temp", response_model=List[schemas.InventoryRoomTempOut])
def list_room_temp(db: Session = Depends(get_db)):
    return db.query(models.InventoryRoomTemp).order_by(
        models.InventoryRoomTemp.expiry_date.asc().nullslast(),
        models.InventoryRoomTemp.created_at
    ).all()


@router.post("/room_temp", response_model=schemas.InventoryRoomTempOut)
def create_room_temp(item: schemas.InventoryRoomTempCreate, db: Session = Depends(get_db)):
    db_item = models.InventoryRoomTemp(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.patch("/room_temp/{item_id}", response_model=schemas.InventoryRoomTempOut)
def update_room_temp(item_id: int, item: schemas.InventoryRoomTempUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.InventoryRoomTemp).filter(models.InventoryRoomTemp.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(db_item, field, value)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/room_temp/{item_id}")
def delete_room_temp(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.InventoryRoomTemp).filter(models.InventoryRoomTemp.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"ok": True}
