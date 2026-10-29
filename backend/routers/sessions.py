from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, col, select

import models
from database import get_session
from models import utc_now
from schemas import SessionCreate, SessionUpdate
from services import stop_running_session

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("/start", response_model=models.TimeSession)
def start_session(session_in: SessionCreate, db: Session = Depends(get_session)):
    """
    Starts a new time session for a given category.
    Automatically stops any currently running session.
    """

    category = db.get(models.Category, session_in.category_id)
    if not category or category.is_archived:
        raise HTTPException(status_code=404, detail="Category not found")

    stop_running_session(db)

    new_session = models.TimeSession(
        category_id=session_in.category_id, start_time=utc_now()
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session


@router.put("/stop", response_model=models.TimeSession)
def stop_session(db: Session = Depends(get_session)):
    """
    Stops the currently active session (if any)
    """

    stopped_session = stop_running_session(db)

    if not stopped_session:
        raise HTTPException(status_code=400, detail="No active session found to stop")

    db.commit()
    db.refresh(stopped_session)

    return stopped_session


@router.put("/{session_id}", response_model=models.TimeSession)
def update_session(
    session_id: int, session_in: SessionUpdate, db: Session = Depends(get_session)
):
    """
    Allows a user to retroactively edit a session's duration or add a note.
    """

    session = db.get(models.TimeSession, session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.end_time is None:
        raise HTTPException(
            status_code=400, detail="Cannot edit a running session. Stop it first"
        )

    update_data = session_in.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(session, key, value)

    db.add(session)
    db.commit()
    db.refresh(session)

    return session


@router.delete("/{session_id}", status_code=204)
def delete_session(session_id: int, db: Session = Depends(get_session)):
    session = db.get(models.TimeSession, session_id)
    if not session:
        raise HTTPException(
            status_code=404, detail=f"Session '#'{session_id} not found"
        )

    db.delete(session)
    db.commit()


@router.get("/", response_model=List[models.TimeSession])
def get_all_sessions(
    category_id: Optional[int] = Query(
        default=None, description="Filter by category ID"
    ),
    limit: int = Query(
        default=50, ge=1, le=100, description="Max number of sessions to return"
    ),
    offset: int = Query(default=0, ge=0, description="Number of sessions to skip"),
    db: Session = Depends(get_session),
):
    """
    Returns the history of all sessions with optional category filter and pagination.
    """
    statement = select(models.TimeSession)

    if category_id is not None:
        statement = statement.where(models.TimeSession.category_id == category_id)

    statement = (
        statement.order_by(col(models.TimeSession.start_time).desc())
        .offset(offset)
        .limit(limit)
    )

    return db.exec(statement).all()


@router.get("/active", response_model=Optional[models.TimeSession])
def get_active_session(db: Session = Depends(get_session)):
    statement = select(models.TimeSession).where(
        col(models.TimeSession.end_time).is_(None)
    )

    active_session = db.exec(statement).first()
    return active_session


@router.get("/{session_id}", response_model=models.TimeSession)
def get_specific_session(session_id: int, db: Session = Depends(get_session)):
    """
    Returns a specific time session by ID.
    """
    session = db.get(models.TimeSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
