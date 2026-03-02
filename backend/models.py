"""
SQLAlchemy ORM models for CPSM.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, Text, DateTime, ForeignKey, Boolean, CheckConstraint
from sqlalchemy.orm import relationship
from database import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    hashtags = Column(Text, default="")
    video_path = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    scheduled_at = Column(DateTime, nullable=True)  # None = immediate publish
    status = Column(String(20), default="published")  # draft / scheduled / published
    is_kids_content = Column(Boolean, default=False)  # YouTube COPPA flag
    ig_share_to_feed = Column(Boolean, default=True)  # Instagram feed share flag
    thumbnail_path = Column(String(500), nullable=True)

    stats = relationship("PlatformStats", back_populates="post", cascade="all, delete-orphan")
    history = relationship("StatsHistory", back_populates="post", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "hashtags": self.hashtags,
            "video_path": self.video_path,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "scheduled_at": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "status": self.status or "published",
            "is_kids_content": self.is_kids_content,
            "ig_share_to_feed": self.ig_share_to_feed,
            "thumbnail": f"/{self.thumbnail_path}" if self.thumbnail_path else None,
            "stats": [s.to_dict() for s in self.stats],
        }


class PlatformStats(Base):
    __tablename__ = "platform_stats"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    platform = Column(String(20), nullable=False)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    saves = Column(Integer, default=0)
    views_1h = Column(Integer, default=0)  # Views in first 1 hour
    drop_off_rate = Column(Float, default=0.0)  # Early drop-off rate (%) within first 3 seconds
    fetched_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint("platform IN ('youtube', 'tiktok', 'instagram')", name="valid_platform"),
    )

    post = relationship("Post", back_populates="stats")

    def to_dict(self):
        return {
            "id": self.id,
            "post_id": self.post_id,
            "platform": self.platform,
            "views": self.views,
            "likes": self.likes,
            "saves": self.saves,
            "views_1h": self.views_1h,
            "drop_off_rate": self.drop_off_rate,
            "fetched_at": self.fetched_at.isoformat() if self.fetched_at else None,
        }


class StatsHistory(Base):
    """Daily snapshot of stats for trend tracking."""
    __tablename__ = "stats_history"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    platform = Column(String(20), nullable=False)
    date = Column(DateTime, nullable=False)
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    saves = Column(Integer, default=0)

    post = relationship("Post", back_populates="history")

    def to_dict(self):
        return {
            "date": self.date.strftime("%m/%d") if self.date else None,
            "platform": self.platform,
            "views": self.views,
            "likes": self.likes,
            "saves": self.saves,
        }


class OAuthToken(Base):
    """Stores OAuth tokens for platforms."""
    __tablename__ = "oauth_tokens"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(50), unique=True, nullable=False)  # e.g., 'youtube', 'tiktok', 'instagram'
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "platform": self.platform,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
