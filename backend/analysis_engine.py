"""
Analysis Engine — Cross-platform performance analysis.
Calculates save rate, velocity (initial momentum), drop-off danger, and platform comparisons.
"""
from typing import Optional
from sqlalchemy.orm import Session
from models import Post, PlatformStats


# Platform-specific drop-off rate thresholds (data-driven)
DROP_OFF_THRESHOLDS = {
    "youtube": {"safe": 30, "caution": 40},   # Swiped Away 30-40% = reach limited
    "tiktok": {"safe": 30, "caution": 50},    # Completion rate 50%+ needed for <15s
    "instagram": {"safe": 25, "caution": 40},  # Strictest: 2-sec hook judgment
}


def get_drop_off_danger(rate: float, platform: str) -> dict:
    """
    Evaluate drop-off rate danger level based on platform-specific thresholds.
    Returns level (safe/caution/danger), label, and color.
    """
    thresholds = DROP_OFF_THRESHOLDS.get(platform, {"safe": 30, "caution": 50})

    if rate <= thresholds["safe"]:
        return {
            "level": "safe",
            "label": "安全",
            "emoji": "🟢",
            "message": "アルゴリズムに好まれやすい状態です",
        }
    elif rate <= thresholds["caution"]:
        return {
            "level": "caution",
            "label": "注意",
            "emoji": "🟡",
            "message": "ボーダーライン — 冒頭のフック改善を検討してください",
        }
    else:
        return {
            "level": "danger",
            "label": "危険",
            "emoji": "🔴",
            "message": "アルゴリズムに嫌われるリスクが高いです。冒頭3秒を大幅に見直してください",
        }


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
            "drop_off_rate": s.drop_off_rate,
            "drop_off_danger": get_drop_off_danger(s.drop_off_rate, s.platform),
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


def get_dashboard_summary(db: Session, user_id: Optional[int] = None) -> dict:
    """
    Aggregate dashboard data: total views/likes/saves per platform across posts.
    If user_id is provided, aggregates only for posts belonging to that user.
    """
    query = db.query(PlatformStats)
    if user_id:
        query = query.join(Post).filter(Post.user_id == user_id)
    stats = query.all()

    summary = {
        "youtube": {"views": 0, "likes": 0, "saves": 0, "drop_off_total": 0.0, "count": 0},
        "tiktok": {"views": 0, "likes": 0, "saves": 0, "drop_off_total": 0.0, "count": 0},
        "instagram": {"views": 0, "likes": 0, "saves": 0, "drop_off_total": 0.0, "count": 0},
    }

    for s in stats:
        if s.platform in summary:
            summary[s.platform]["views"] += s.views
            summary[s.platform]["likes"] += s.likes
            summary[s.platform]["saves"] += s.saves
            summary[s.platform]["drop_off_total"] += s.drop_off_rate or 0.0
            summary[s.platform]["count"] += 1

    # Calculate average drop-off rate per platform and add danger level
    platform_result = {}
    for platform, data in summary.items():
        avg_drop_off = round(data["drop_off_total"] / data["count"], 1) if data["count"] > 0 else 0.0
        platform_result[platform] = {
            "views": data["views"],
            "likes": data["likes"],
            "saves": data["saves"],
            "avg_drop_off_rate": avg_drop_off,
            "drop_off_danger": get_drop_off_danger(avg_drop_off, platform),
        }

    # Add highlights (which platform is best for each metric)
    highlights = {}
    for metric in ["views", "likes", "saves"]:
        best = max(platform_result.items(), key=lambda x: x[1][metric])
        highlights[metric] = best[0]

    # Total posts
    post_query = db.query(Post)
    if user_id:
        post_query = post_query.filter(Post.user_id == user_id)

    return {
        "platforms": platform_result,
        "highlights": highlights,
        "total_posts": post_query.count(),
    }
