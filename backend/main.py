"""
BUZZ-ROOT Backend — FastAPI Application Entry Point.
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import posts, analytics, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    init_db()
    # Only seed demo data if explicitly enabled (for development/demo)
    if os.getenv("SEED_DEMO", "").lower() == "true":
        seed_demo_data()
    yield


app = FastAPI(
    title="BUZZ-ROOT API",
    description="バズルート — ショート動画の統合投稿 & アナリティクス API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configuration — controlled by environment variable
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(posts.router)
app.include_router(analytics.router)
app.include_router(auth.router)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/")
def root():
    return {"message": "CPSM API is running", "docs": "/docs"}


def seed_demo_data():
    """Seed the database with demo data for MVP demonstration."""
    from database import SessionLocal
    from models import Post, PlatformStats, StatsHistory
    from datetime import datetime, timedelta
    import random
    import math

    db = SessionLocal()

    # Only seed if database is empty
    if db.query(Post).count() > 0:
        db.close()
        return

    # Published posts (existing)
    demo_posts = [
        {"title": "朝のルーティン⏰", "description": "毎朝やってる5分ルーティン", "hashtags": "#morningroutine,#日常,#vlog", "status": "published"},
        {"title": "カフェ巡り☕ in 渋谷", "description": "渋谷のおしゃれカフェ3選", "hashtags": "#cafe,#渋谷,#カフェ巡り", "status": "published"},
        {"title": "簡単レシピ🍳 5分パスタ", "description": "超簡単！5分で作れるペペロンチーノ", "hashtags": "#cooking,#レシピ,#簡単料理", "status": "published"},
        {"title": "筋トレ💪 腹筋3分", "description": "毎日続けられる腹筋ワークアウト", "hashtags": "#fitness,#筋トレ,#workout", "status": "published"},
        {"title": "夜景ドライブ🌃", "description": "東京タワー周辺の夜景ドライブ", "hashtags": "#nightdrive,#夜景,#東京", "status": "published"},
        # Scheduled posts
        {"title": "桜スポット🌸 TOP5", "description": "東京都内の穴場桜スポットを紹介", "hashtags": "#桜,#花見,#春", "status": "scheduled",
         "scheduled_at": datetime.utcnow() + timedelta(days=3, hours=6)},
        {"title": "100均DIY✨ 収納術", "description": "100均アイテムだけでおしゃれ収納", "hashtags": "#100均,#DIY,#収納", "status": "scheduled",
         "scheduled_at": datetime.utcnow() + timedelta(days=5, hours=9)},
        # Draft posts
        {"title": "【下書き】旅行Vlog", "description": "まだ編集中...", "hashtags": "#travel,#vlog", "status": "draft"},
    ]

    for post_data in demo_posts:
        post = Post(
            title=post_data["title"],
            description=post_data["description"],
            hashtags=post_data["hashtags"],
            video_path="",
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
            scheduled_at=post_data.get("scheduled_at"),
            status=post_data["status"],
        )
        db.add(post)
        db.commit()
        db.refresh(post)

        # Generate stats only for published posts
        if post_data["status"] != "published":
            continue

        # Generate realistic-ish random stats for each platform
        for platform in ["youtube", "tiktok", "instagram"]:
            base_views = random.randint(500, 50000)
            # Platform-specific drop-off rate ranges (realistic)
            drop_off_ranges = {
                "youtube": (20, 45),    # YT Shorts: 30-40% is critical zone
                "tiktok": (15, 55),     # TikTok: wider range, 50%+ is danger
                "instagram": (18, 50),  # IG Reels: strictest, 25-40% is caution
            }
            dor_min, dor_max = drop_off_ranges[platform]
            stat = PlatformStats(
                post_id=post.id,
                platform=platform,
                views=base_views,
                likes=random.randint(int(base_views * 0.02), int(base_views * 0.15)),
                saves=random.randint(int(base_views * 0.005), int(base_views * 0.05)),
                views_1h=random.randint(int(base_views * 0.1), int(base_views * 0.6)),
                drop_off_rate=round(random.uniform(dor_min, dor_max), 1),
                fetched_at=datetime.utcnow(),
            )
            db.add(stat)

        # Generate 365 days of trend history for this post
        today = datetime.utcnow().date()
        for platform in ["youtube", "tiktok", "instagram"]:
            base = random.randint(200, 3000)
            # Seasonal multiplier adds natural variation
            for day_offset in range(365):
                d = today - timedelta(days=364 - day_offset)
                # Growth over time + seasonal wave + daily noise
                growth = 1.0 + (day_offset / 365) * random.uniform(1.5, 5)
                seasonal = 1.0 + 0.3 * math.sin(day_offset / 30 * math.pi)
                noise = random.uniform(0.6, 1.4)
                views = int(base * growth * seasonal * noise)
                likes = int(views * random.uniform(0.03, 0.12))
                saves = int(views * random.uniform(0.005, 0.04))
                db.add(StatsHistory(
                    post_id=post.id,
                    platform=platform,
                    date=datetime.combine(d, datetime.min.time()),
                    views=views,
                    likes=likes,
                    saves=saves,
                ))

    db.commit()
    db.close()
