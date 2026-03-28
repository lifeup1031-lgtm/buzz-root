"""
Posts router — CRUD operations for video posts.
"""
import os
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Post, PlatformStats, User
from services.platform_api import youtube_api, tiktok_api, instagram_api
from services.storage import upload_file
from services.auth_utils import get_current_user

router = APIRouter(prefix="/api/posts", tags=["posts"])


@router.get("")
def list_posts(
    status: Optional[str] = None, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get all posts. Scoped to current user if authenticated."""
    query = db.query(Post)
    if current_user:
        query = query.filter(Post.user_id == current_user.id)
    if status:
        query = query.filter(Post.status == status)
    posts = query.order_by(Post.created_at.desc()).all()
    return {"posts": [p.to_dict() for p in posts]}


@router.get("/queue")
def get_queue(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get posts grouped by status for the management page."""
    query = db.query(Post)
    if current_user:
        query = query.filter(Post.user_id == current_user.id)
        
    all_posts = query.order_by(Post.scheduled_at.asc(), Post.created_at.desc()).all()
    result = {"scheduled": [], "published": [], "draft": []}
    for p in all_posts:
        s = p.status or "published"
        if s in result:
            result[s].append(p.to_dict())
        else:
            result.setdefault(s, []).append(p.to_dict())

    # Counts for UI badges
    counts = {k: len(v) for k, v in result.items()}
    counts["all"] = sum(counts.values())

    return {"queue": result, "counts": counts}


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
    scheduled_at: Optional[str] = Form(None),
    is_kids_content: bool = Form(False),
    ig_share_to_feed: bool = Form(True),
    video: UploadFile = File(...),
    thumbnail: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """Create a new post and upload video to selected platforms."""
    # Upload video to cloud storage (or local fallback)
    video_content = await video.read()
    video_result = await upload_file(
        file_content=video_content,
        original_filename=video.filename or "video.mp4",
        folder="videos",
        content_type=video.content_type or "video/mp4",
    )

    # Upload thumbnail if provided
    thumbnail_url = None
    thumbnail_path = None
    if thumbnail:
        thumb_content = await thumbnail.read()
        thumb_result = await upload_file(
            file_content=thumb_content,
            original_filename=thumbnail.filename or "thumb.jpg",
            folder="thumbnails",
            content_type=thumbnail.content_type or "image/jpeg",
        )
        thumbnail_path = thumb_result["path"]
        thumbnail_url = thumb_result["url"]

    # Determine scheduling
    schedule_dt = None
    post_status = "published"
    if scheduled_at:
        try:
            schedule_dt = datetime.fromisoformat(scheduled_at)
            if schedule_dt > datetime.utcnow():
                post_status = "scheduled"
            else:
                post_status = "published"
        except ValueError:
            pass  # Invalid date format, treat as immediate

    # Create post record
    post = Post(
        user_id=current_user.id if current_user else None,
        title=title,
        description=description,
        hashtags=hashtags,
        video_path=video_result["path"],
        video_url=video_result["url"],
        thumbnail_path=thumbnail_path,
        thumbnail_url=thumbnail_url,
        created_at=datetime.utcnow(),
        scheduled_at=schedule_dt,
        status=post_status,
        is_kids_content=is_kids_content,
        ig_share_to_feed=ig_share_to_feed,
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    # Upload to platforms (stubs) and create initial stats
    selected_platforms = [p.strip() for p in platforms.split(",")]
    upload_results = []

    # Use the cloud URL for platform uploads (required for Instagram API)
    video_url_for_platforms = video_result["url"]

    for platform in selected_platforms:
        tags = [t.strip() for t in hashtags.split(",") if t.strip()]

        if platform == "youtube":
            result = await youtube_api.upload_video(video_url_for_platforms, title, description, tags, is_kids_content=is_kids_content)
        elif platform == "tiktok":
            result = await tiktok_api.upload_video(video_url_for_platforms, title, description, tags)
        elif platform == "instagram":
            result = await instagram_api.upload_video(video_url_for_platforms, title, description, tags, share_to_feed=ig_share_to_feed)
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
            drop_off_rate=0.0,
        )
        db.add(stat)

    db.commit()

    return {
        "post": post.to_dict(),
        "upload_results": upload_results,
    }


@router.patch("/{post_id}")
def update_post(
    post_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    hashtags: Optional[str] = Form(None),
    scheduled_at: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """Update a post's metadata or schedule."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if title is not None:
        post.title = title
    if description is not None:
        post.description = description
    if hashtags is not None:
        post.hashtags = hashtags
    if scheduled_at is not None:
        try:
            post.scheduled_at = datetime.fromisoformat(scheduled_at) if scheduled_at else None
        except ValueError:
            pass
    if status is not None and status in ("draft", "scheduled", "published"):
        post.status = status

    db.commit()
    db.refresh(post)
    return post.to_dict()


@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    """Delete a post and its associated stats."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(post)
    db.commit()
    return {"message": f"Post {post_id} deleted", "id": post_id}


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
