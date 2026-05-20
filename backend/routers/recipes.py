from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get("", response_model=List[schemas.RecipeOut])
def list_recipes(
    category: Optional[str] = None,
    reaction: Optional[str] = None,
    ingredient: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Recipe)
    if category:
        query = query.filter(models.Recipe.category == category)
    if reaction:
        query = query.filter(models.Recipe.reaction == reaction)
    if ingredient:
        query = query.filter(models.Recipe.ingredients.ilike(f"%{ingredient}%"))
    return query.order_by(models.Recipe.created_at.desc()).all()


@router.post("", response_model=schemas.RecipeOut)
def create_recipe(item: schemas.RecipeCreate, db: Session = Depends(get_db)):
    db_item = models.Recipe(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.patch("/{item_id}", response_model=schemas.RecipeOut)
def update_recipe(item_id: int, item: schemas.RecipeUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.Recipe).filter(models.Recipe.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in item.model_dump(exclude_unset=True).items():
        setattr(db_item, field, value)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/{item_id}")
def delete_recipe(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.Recipe).filter(models.Recipe.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"ok": True}
