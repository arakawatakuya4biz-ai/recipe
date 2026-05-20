from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas

router = APIRouter(prefix="/meals", tags=["meals"])


@router.get("", response_model=List[schemas.MealPlanOut])
def list_meals(year: Optional[int] = None, month: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.MealPlan)
    if year and month:
        from sqlalchemy import extract
        query = query.filter(
            extract("year", models.MealPlan.date) == year,
            extract("month", models.MealPlan.date) == month
        )
    return query.order_by(models.MealPlan.date, models.MealPlan.meal_type).all()


@router.post("", response_model=schemas.MealPlanOut)
def create_meal(item: schemas.MealPlanCreate, db: Session = Depends(get_db)):
    db_item = models.MealPlan(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.patch("/{item_id}", response_model=schemas.MealPlanOut)
def update_meal(item_id: int, item: schemas.MealPlanUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.MealPlan).filter(models.MealPlan.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(db_item, field, value)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/{item_id}")
def delete_meal(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.MealPlan).filter(models.MealPlan.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"ok": True}
