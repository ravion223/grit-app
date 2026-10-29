from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, col, select

import models
from database import get_session
from models import utc_now
from schemas import CategoryCreate, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.post("/", response_model=models.Category, status_code=201)
def create_category(category_in: CategoryCreate, db: Session = Depends(get_session)):
    """
    Creates a new category for time tracking
    """
    statement = select(models.Category).where(models.Category.name == category_in.name)
    existing = db.exec(statement).first()

    if existing:
        raise HTTPException(status_code=400, detail="This category already exists")

    new_category = models.Category(**category_in.model_dump())

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category


@router.put("/{category_id}", response_model=models.Category)
def update_category(
    category_id: int, category_in: CategoryUpdate, db: Session = Depends(get_session)
):
    """
    Allows a user to edit category details
    """
    category = db.get(models.Category, category_id)
    if not category:
        raise HTTPException(
            status_code=404, detail=f"Category '#'{category_id} not found"
        )

    update_data = category_in.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(category, key, value)

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


@router.delete("/{category_id}", response_model=models.Category)
def delete_category(category_id: int, db: Session = Depends(get_session)):
    """
    Softs deletes a category so it hides from UI but keeps historical data intact.
    """

    category = db.get(models.Category, category_id)
    if not category:
        raise HTTPException(
            status_code=404, detail=f"Category with id {category_id} is not found"
        )
    if category.is_archived:
        raise HTTPException(
            status_code=400,
            detail=f"Category with id {category_id} is already deleted",
        )

    category.is_archived = True
    db.add(category)

    statement = select(models.TimeSession).where(
        col(models.TimeSession.end_time).is_(None),
        col(models.TimeSession.category_id) == category_id,
    )

    running_session = db.exec(statement).first()
    if running_session:
        running_session.end_time = utc_now()
        delta = running_session.end_time - running_session.start_time
        running_session.duration_seconds = int(delta.total_seconds())

        db.add(running_session)

    db.commit()
    return category


@router.get("/", response_model=List[models.Category])
def get_all_categories(db: Session = Depends(get_session)):
    """
    Returns all active (non-archived) categories.
    """
    statement = select(models.Category).where(
        col(models.Category.is_archived).is_(False)
    )
    categories = db.exec(statement).all()

    return categories


@router.get("/{category_id}", response_model=models.Category)
def get_specific_category(category_id: int, db: Session = Depends(get_session)):
    """
    Returns a specific category by ID.
    """
    category = db.get(models.Category, category_id)
    if not category or category.is_archived:
        raise HTTPException(status_code=404, detail="Category not found")
    return category
