"""
SQLAlchemy ORM models for CPSM.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, CheckConstraint
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

    stats = relationship("PlatformStats", back_populates="post", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "hashtags": self.hashtags,
            "video_path": self.video_path,
            "created_at": self.created_at.isoformat() if self.created_at else None,
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
            "fetched_at": self.fetched_at.isoformat() if self.fetched_at else None,
        }
