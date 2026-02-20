"""
Analytics router — Dashboard and comparison endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from analysis_engine import compare_platforms, get_dashboard_summary

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    """Get aggregated dashboard data across all platforms."""
    return get_dashboard_summary(db)


@router.get("/compare/{post_id}")
def compare(post_id: int, db: Session = Depends(get_db)):
    """Compare platform performance for a specific post."""
    return compare_platforms(db, post_id)
