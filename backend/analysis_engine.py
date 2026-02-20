"""
Analysis Engine — Cross-platform performance analysis.
Calculates save rate, velocity (initial momentum), and platform comparisons.
"""
from sqlalchemy.orm import Session
from models import Post, PlatformStats


def calculate_save_rate(saves: int, views: int) -> float:
    """Calculate save rate (saves / views) as a percentage."""
    if views == 0:
        return 0.0
    return round((saves / views) * 100, 2)


def calculate_velocity(views_1h: int, total_views: int) -> float:
    """
    Calculate initial velocity score.
    Represents what percentage of total views were gained in the first hour.
    Higher = more viral initial momentum.
    """
    if total_views == 0:
        return 0.0
    return round((views_1h / total_views) * 100, 2)


def compare_platforms(db: Session, post_id: int) -> dict:
    """
    Compare all platform stats for a given post.
    Returns a dict with per-platform metrics and highlights the best performer.
    """
    stats = db.query(PlatformStats).filter(PlatformStats.post_id == post_id).all()

    if not stats:
        return {"error": "No stats found for this post", "platforms": {}}

    platforms = {}
    for s in stats:
        platforms[s.platform] = {
            "views": s.views,
            "likes": s.likes,
            "saves": s.saves,
            "views_1h": s.views_1h,
            "save_rate": calculate_save_rate(s.saves, s.views),
            "velocity": calculate_velocity(s.views_1h, s.views),
            "engagement_rate": round(
                ((s.likes + s.saves) / s.views * 100) if s.views > 0 else 0, 2
            ),
        }

    # Determine best platform by engagement rate
    best = get_best_platform_from_data(platforms)

    return {
        "post_id": post_id,
        "platforms": platforms,
        "best_platform": best,
    }


def get_best_platform_from_data(platforms: dict) -> dict:
    """Determine the best performing platform from comparison data."""
    if not platforms:
        return {"platform": None, "reason": "No data"}

    best_engagement = max(platforms.items(), key=lambda x: x[1]["engagement_rate"])
    best_velocity = max(platforms.items(), key=lambda x: x[1]["velocity"])
    best_save_rate = max(platforms.items(), key=lambda x: x[1]["save_rate"])

    return {
        "highest_engagement": {
            "platform": best_engagement[0],
            "value": best_engagement[1]["engagement_rate"],
        },
        "highest_velocity": {
            "platform": best_velocity[0],
            "value": best_velocity[1]["velocity"],
        },
        "highest_save_rate": {
            "platform": best_save_rate[0],
            "value": best_save_rate[1]["save_rate"],
        },
    }


def get_dashboard_summary(db: Session) -> dict:
    """
    Aggregate dashboard data: total views/likes/saves per platform across all posts.
    """
    stats = db.query(PlatformStats).all()

    summary = {
        "youtube": {"views": 0, "likes": 0, "saves": 0},
        "tiktok": {"views": 0, "likes": 0, "saves": 0},
        "instagram": {"views": 0, "likes": 0, "saves": 0},
    }

    for s in stats:
        if s.platform in summary:
            summary[s.platform]["views"] += s.views
            summary[s.platform]["likes"] += s.likes
            summary[s.platform]["saves"] += s.saves

    # Add highlights (which platform is best for each metric)
    highlights = {}
    for metric in ["views", "likes", "saves"]:
        best = max(summary.items(), key=lambda x: x[1][metric])
        highlights[metric] = best[0]

    return {
        "platforms": summary,
        "highlights": highlights,
        "total_posts": db.query(Post).count(),
    }
