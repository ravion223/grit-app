from sqlmodel import Session, col, select

import models
from models import utc_now


def stop_running_session(db: Session):
    """
    Helper function to find and stop active session
    """
    statement = select(models.TimeSession).where(
        col(models.TimeSession.end_time).is_(None)
    )
    running_session = db.exec(statement).first()

    if running_session:
        running_session.end_time = utc_now()
        # Calculate duration
        delta = running_session.end_time - running_session.start_time
        running_session.duration_seconds = int(delta.total_seconds())

        db.add(running_session)

    return running_session
