"""
CPSM Backend — FastAPI Application Entry Point.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import posts, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    init_db()
    # Seed demo data for MVP
    seed_demo_data()
    yield


app = FastAPI(
    title="BUZZ-ROOT API",
    description="バズルート — ショート動画の統合投稿 & アナリティクス API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(posts.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"message": "CPSM API is running", "docs": "/docs"}


def seed_demo_data():
    """Seed the database with demo data for MVP demonstration."""
    from database import SessionLocal
    from models import Post, PlatformStats
    from datetime import datetime
    import random

    db = SessionLocal()

    # Only seed if database is empty
    if db.query(Post).count() > 0:
        db.close()
        return

    demo_posts = [
        {"title": "朝のルーティン⏰", "description": "毎朝やってる5分ルーティン", "hashtags": "#morningroutine,#日常,#vlog"},
        {"title": "カフェ巡り☕ in 渋谷", "description": "渋谷のおしゃれカフェ3選", "hashtags": "#cafe,#渋谷,#カフェ巡り"},
        {"title": "簡単レシピ🍳 5分パスタ", "description": "超簡単！5分で作れるペペロンチーノ", "hashtags": "#cooking,#レシピ,#簡単料理"},
        {"title": "筋トレ💪 腹筋3分", "description": "毎日続けられる腹筋ワークアウト", "hashtags": "#fitness,#筋トレ,#workout"},
        {"title": "夜景ドライブ🌃", "description": "東京タワー周辺の夜景ドライブ", "hashtags": "#nightdrive,#夜景,#東京"},
    ]

    for post_data in demo_posts:
        post = Post(
            title=post_data["title"],
            description=post_data["description"],
            hashtags=post_data["hashtags"],
            video_path="",
            created_at=datetime.utcnow(),
        )
        db.add(post)
        db.commit()
        db.refresh(post)

        # Generate realistic-ish random stats for each platform
        for platform in ["youtube", "tiktok", "instagram"]:
            base_views = random.randint(500, 50000)
            stat = PlatformStats(
                post_id=post.id,
                platform=platform,
                views=base_views,
                likes=random.randint(int(base_views * 0.02), int(base_views * 0.15)),
                saves=random.randint(int(base_views * 0.005), int(base_views * 0.05)),
                views_1h=random.randint(int(base_views * 0.1), int(base_views * 0.6)),
                fetched_at=datetime.utcnow(),
            )
            db.add(stat)

    db.commit()
    db.close()
