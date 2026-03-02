"""
Analytics router — Dashboard and comparison endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from analysis_engine import compare_platforms, get_dashboard_summary
from models import StatsHistory

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    """Get aggregated dashboard data across all platforms."""
    return get_dashboard_summary(db)


@router.get("/compare/{post_id}")
def compare(post_id: int, db: Session = Depends(get_db)):
    """Compare platform performance for a specific post."""
    return compare_platforms(db, post_id)


@router.get("/trend/{post_id}")
def trend(post_id: int, db: Session = Depends(get_db)):
    """Get daily trend data for a specific post (last 14 days)."""
    records = (
        db.query(StatsHistory)
        .filter(StatsHistory.post_id == post_id)
        .order_by(StatsHistory.date)
        .all()
    )
    # Group by date for frontend consumption
    by_date: dict = {}
    for r in records:
        d = r.to_dict()
        date_key = d["date"]
        if date_key not in by_date:
            by_date[date_key] = {"date": date_key}
        by_date[date_key][f'{d["platform"]}_views'] = d["views"]
        by_date[date_key][f'{d["platform"]}_likes'] = d["likes"]
        by_date[date_key][f'{d["platform"]}_saves'] = d["saves"]
    return {"trend": list(by_date.values())}
