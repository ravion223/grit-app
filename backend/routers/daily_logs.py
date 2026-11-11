from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, col, select

import models
from database import get_session
from schemas import DailyLogUpsert

router = APIRouter(prefix="/daily-logs", tags=["DailyLogs"])


@router.get("/", response_model=List[models.DailyLog])
def get_daily_logs(
    month: Optional[str] = Query(
        default=None,
        pattern=r"^\d{4}-\d{2}$",
        description="Filter by month in YYYY-MM format (UTC)",
    ),
    cookie_jar_only: Optional[bool] = Query(
        default=False, description="Filter by is_cookie_jar property"
    ),
    db: Session = Depends(get_session),
):
    """
    Fetches the history of all daily logs with optional month/cookie jar filters
    """
    statement = select(models.DailyLog)

    if month is not None:
        try:
            year_str, month_str = month.split("-")
            year, mon = int(year_str), int(month_str)
            if not (1 <= mon <= 12):
                raise ValueError
            start_date = date(year, mon, 1)
            if mon == 12:
                end_date = date(year + 1, 1, 1)
            else:
                end_date = date(year, mon + 1, 1)
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid month format. Expected YYYY-MM"
            )
        statement = statement.where(
            col(models.DailyLog.log_date) >= start_date,
            col(models.DailyLog.log_date) < end_date,
        )

    if cookie_jar_only:
        statement = statement.where(col(models.DailyLog.is_cookie_jar))

    statement = statement.order_by(col(models.DailyLog.log_date).desc())

    return db.exec(statement).all()


@router.get("/{log_date}", response_model=Optional[models.DailyLog])
def get_daily_log(log_date: date, db: Session = Depends(get_session)):
    """
    Fetch the daily log on the specific date
    """
    statement = select(models.DailyLog).where(models.DailyLog.log_date == log_date)
    daily_log = db.exec(statement).first()

    if not daily_log:
        raise HTTPException(status_code=404, detail="Log not found")

    return daily_log


@router.put("/{log_date}", response_model=models.DailyLog)
def update_daily_log(
    log_date: date, log_in: DailyLogUpsert, db: Session = Depends(get_session)
):
    """
    Upserts (creates or updates) the daily log for a specific date (YYYY-MM-DD).
    """
    statement = select(models.DailyLog).where(models.DailyLog.log_date == log_date)
    daily_log = db.exec(statement).first()

    update_data = log_in.model_dump(exclude_unset=True)

    if not daily_log:
        daily_log = models.DailyLog(
            log_date=log_date,
            **update_data,
            created_at=models.utc_now(),
            updated_at=models.utc_now(),
        )
    else:
        for key, value in update_data.items():
            setattr(daily_log, key, value)
        daily_log.updated_at = models.utc_now()

    db.add(daily_log)
    db.commit()
    db.refresh(daily_log)

    return daily_log


@router.delete("/{log_date}", status_code=204)
def delete_daily_log(log_date: date, db: Session = Depends(get_session)):
    """
    Deletes specific daily log
    """

    statement = select(models.DailyLog).where(models.DailyLog.log_date == log_date)
    daily_log = db.exec(statement).first()
    if not daily_log:
        raise HTTPException(status_code=404, detail="Log not found")

    db.delete(daily_log)
    db.commit()
