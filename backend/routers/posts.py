"""
Posts router — CRUD operations for video posts.
"""
import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Post, PlatformStats
from services.platform_api import youtube_api, tiktok_api, instagram_api

router = APIRouter(prefix="/api/posts", tags=["posts"])

UPLOAD_DIR = "uploads"


@router.get("")
def list_posts(db: Session = Depends(get_db)):
    """Get all posts with their platform stats."""
    posts = db.query(Post).order_by(Post.created_at.desc()).all()
    return {"posts": [p.to_dict() for p in posts]}


@router.get("/{post_id}")
def get_post(post_id: int, db: Session = Depends(get_db)):
    """Get a single post by ID."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post.to_dict()


@router.post("")
async def create_post(
    title: str = Form(...),
    description: str = Form(""),
    hashtags: str = Form(""),
    platforms: str = Form("youtube,tiktok,instagram"),
    video: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Create a new post and upload video to selected platforms."""
    # Save the uploaded video
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(video.filename)[1] if video.filename else ".mp4"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    content = await video.read()
    with open(filepath, "wb") as f:
        f.write(content)

    # Create post record
    post = Post(
        title=title,
        description=description,
        hashtags=hashtags,
        video_path=filepath,
        created_at=datetime.utcnow(),
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    # Upload to platforms (stubs) and create initial stats
    selected_platforms = [p.strip() for p in platforms.split(",")]
    upload_results = []

    for platform in selected_platforms:
        tags = [t.strip() for t in hashtags.split(",") if t.strip()]

        if platform == "youtube":
            result = await youtube_api.upload_video(filepath, title, description, tags)
        elif platform == "tiktok":
            result = await tiktok_api.upload_video(filepath, title, description, tags)
        elif platform == "instagram":
            result = await instagram_api.upload_video(filepath, title, description, tags)
        else:
            continue

        upload_results.append(result)

        # Create initial stats entry
        stat = PlatformStats(
            post_id=post.id,
            platform=platform,
            views=0,
            likes=0,
            saves=0,
            views_1h=0,
        )
        db.add(stat)

    db.commit()

    return {
        "post": post.to_dict(),
        "upload_results": upload_results,
    }


@router.get("/{post_id}/stats")
def get_post_stats(post_id: int, db: Session = Depends(get_db)):
    """Get platform stats for a specific post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    stats = db.query(PlatformStats).filter(PlatformStats.post_id == post_id).all()
    return {
        "post_id": post_id,
        "title": post.title,
        "stats": [s.to_dict() for s in stats],
    }
