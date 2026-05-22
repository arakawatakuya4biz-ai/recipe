from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Text, Enum as SAEnum
from sqlalchemy.sql import func
from database import Base
import enum


class VegetableStatus(str, enum.Enum):
    good = "good"
    ok = "ok"
    low = "low"


class FreezerCategory(str, enum.Enum):
    meat = "meat"
    fish = "fish"
    frozen = "frozen"
    other = "other"


class MealType(str, enum.Enum):
    lunch = "lunch"
    dinner = "dinner"


class StoreEnum(str, enum.Enum):
    life = "life"
    ropia = "ropia"
    marusan = "marusan"
    aeon = "aeon"
    unknown = "unknown"


class RecipeCategory(str, enum.Enum):
    main = "main"
    side = "side"
    soup = "soup"
    dessert = "dessert"
    other = "other"


class ReactionEnum(str, enum.Enum):
    good = "good"
    ok = "ok"
    bad = "bad"


class InventoryVegetable(Base):
    __tablename__ = "inventory_vegetables"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    is_staple = Column(Boolean, default=False)
    status = Column(SAEnum(VegetableStatus), default=VegetableStatus.good)
    notes = Column(Text, default="")
    planned_dish = Column(Text, default="")
    planned_use = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InventoryFridge(Base):
    __tablename__ = "inventory_fridge"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    expiry_date = Column(Date, nullable=True)
    notes = Column(Text, default="")
    planned_dish = Column(Text, default="")
    planned_use = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InventoryFreezer(Base):
    __tablename__ = "inventory_freezer"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(SAEnum(FreezerCategory), default=FreezerCategory.other)
    quantity = Column(String, default="")
    notes = Column(Text, default="")
    planned_dish = Column(Text, default="")
    planned_use = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InventoryRoomTemp(Base):
    __tablename__ = "inventory_room_temp"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    quantity = Column(String, default="")
    expiry_date = Column(Date, nullable=True)
    notes = Column(Text, default="")
    planned_dish = Column(Text, default="")
    planned_use = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    meal_type = Column(SAEnum(MealType), nullable=False)
    dish_name = Column(String, nullable=False)
    ingredients = Column(Text, default="")
    notes = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ShoppingItem(Base):
    __tablename__ = "shopping_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    store = Column(SAEnum(StoreEnum), default=StoreEnum.unknown)
    checked = Column(Boolean, default=False)
    notes = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RecipeMemo(Base):
    __tablename__ = "recipe_memos"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    url = Column(Text, default="")
    video_url = Column(Text, default="")
    notes = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    url = Column(Text, default="")
    category = Column(SAEnum(RecipeCategory), default=RecipeCategory.other)
    ingredients = Column(Text, default="")
    reaction = Column(SAEnum(ReactionEnum), default=ReactionEnum.ok)
    notes = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
