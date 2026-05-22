from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from models import VegetableStatus, FreezerCategory, MealType, StoreEnum, RecipeCategory, ReactionEnum


# InventoryVegetable
class InventoryVegetableBase(BaseModel):
    name: str
    is_staple: bool = False
    status: VegetableStatus = VegetableStatus.good
    notes: str = ""
    planned_dish: str = ""
    planned_use: bool = False


class InventoryVegetableCreate(InventoryVegetableBase):
    pass


class InventoryVegetableUpdate(BaseModel):
    name: Optional[str] = None
    is_staple: Optional[bool] = None
    status: Optional[VegetableStatus] = None
    notes: Optional[str] = None
    planned_dish: Optional[str] = None
    planned_use: Optional[bool] = None


class InventoryVegetableOut(InventoryVegetableBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# InventoryFridge
class InventoryFridgeBase(BaseModel):
    name: str
    expiry_date: Optional[date] = None
    notes: str = ""
    planned_dish: str = ""
    planned_use: bool = False


class InventoryFridgeCreate(InventoryFridgeBase):
    pass


class InventoryFridgeUpdate(BaseModel):
    name: Optional[str] = None
    expiry_date: Optional[date] = None
    notes: Optional[str] = None
    planned_dish: Optional[str] = None
    planned_use: Optional[bool] = None


class InventoryFridgeOut(InventoryFridgeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# InventoryFreezer
class InventoryFreezerBase(BaseModel):
    name: str
    category: FreezerCategory = FreezerCategory.other
    quantity: str = ""
    notes: str = ""
    planned_dish: str = ""
    planned_use: bool = False


class InventoryFreezerCreate(InventoryFreezerBase):
    pass


class InventoryFreezerUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[FreezerCategory] = None
    quantity: Optional[str] = None
    notes: Optional[str] = None
    planned_dish: Optional[str] = None
    planned_use: Optional[bool] = None


class InventoryFreezerOut(InventoryFreezerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# InventoryRoomTemp
class InventoryRoomTempBase(BaseModel):
    name: str
    quantity: str = ""
    expiry_date: Optional[date] = None
    notes: str = ""
    planned_dish: str = ""
    planned_use: bool = False


class InventoryRoomTempCreate(InventoryRoomTempBase):
    pass


class InventoryRoomTempUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[str] = None
    expiry_date: Optional[date] = None
    notes: Optional[str] = None
    planned_dish: Optional[str] = None
    planned_use: Optional[bool] = None


class InventoryRoomTempOut(InventoryRoomTempBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# MealPlan
class MealPlanBase(BaseModel):
    date: date
    meal_type: MealType
    dish_name: str
    ingredients: str = ""
    notes: str = ""


class MealPlanCreate(MealPlanBase):
    pass


class MealPlanUpdate(BaseModel):
    date: Optional[date] = None
    meal_type: Optional[MealType] = None
    dish_name: Optional[str] = None
    ingredients: Optional[str] = None
    notes: Optional[str] = None


class MealPlanOut(MealPlanBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ShoppingItem
class ShoppingItemBase(BaseModel):
    name: str
    store: StoreEnum = StoreEnum.unknown
    checked: bool = False
    notes: str = ""


class ShoppingItemCreate(ShoppingItemBase):
    pass


class ShoppingItemUpdate(BaseModel):
    name: Optional[str] = None
    store: Optional[StoreEnum] = None
    checked: Optional[bool] = None
    notes: Optional[str] = None


class ShoppingItemOut(ShoppingItemBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# RecipeMemo
class RecipeMemoBase(BaseModel):
    name: str
    url: str = ""
    video_url: str = ""
    notes: str = ""


class RecipeMemoCreate(RecipeMemoBase):
    pass


class RecipeMemoUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    video_url: Optional[str] = None
    notes: Optional[str] = None


class RecipeMemoOut(RecipeMemoBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Recipe
class RecipeBase(BaseModel):
    name: str
    url: str = ""
    category: RecipeCategory = RecipeCategory.other
    ingredients: str = ""
    reaction: ReactionEnum = ReactionEnum.ok
    notes: str = ""


class RecipeCreate(RecipeBase):
    pass


class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    category: Optional[RecipeCategory] = None
    ingredients: Optional[str] = None
    reaction: Optional[ReactionEnum] = None
    notes: Optional[str] = None


class RecipeOut(RecipeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
