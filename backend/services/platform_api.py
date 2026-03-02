"""
Platform API service — Boilerplate/stubs for YouTube, TikTok, Instagram APIs.
Replace stubs with real API calls when credentials are configured.
"""
import os
from dotenv import load_dotenv

load_dotenv()  # Load from OS environment variables


class YouTubeAPI:
    """YouTube Data API v3 integration stub."""

    def __init__(self):
        self.api_key = os.getenv("YOUTUBE_API_KEY", "")
        self.client_id = os.getenv("YOUTUBE_CLIENT_ID", "")
        self.client_secret = os.getenv("YOUTUBE_CLIENT_SECRET", "")

    async def upload_video(self, video_path: str, title: str, description: str, tags: list[str], is_kids_content: bool = False) -> dict:
        """Upload a video to YouTube Shorts. (Stub)"""
        # TODO: Implement with google-api-python-client
        # API requires setting snippet.categoryId and status.selfDeclaredMadeForKids
        return {
            "platform": "youtube",
            "status": "stub",
            "message": "YouTube upload not yet implemented. Configure YOUTUBE_API_KEY.",
            "video_id": None,
            "is_kids_content": is_kids_content,
        }

    async def get_stats(self, video_id: str) -> dict:
        """Fetch video statistics from YouTube. (Stub)"""
        return {
            "platform": "youtube",
            "views": 0,
            "likes": 0,
            "saves": 0,
            "views_1h": 0,
        }


class TikTokAPI:
    """TikTok API integration stub."""

    def __init__(self):
        self.client_key = os.getenv("TIKTOK_CLIENT_KEY", "")
        self.client_secret = os.getenv("TIKTOK_CLIENT_SECRET", "")

    async def upload_video(self, video_path: str, title: str, description: str, tags: list[str]) -> dict:
        """Upload a video to TikTok. (Stub)"""
        return {
            "platform": "tiktok",
            "status": "stub",
            "message": "TikTok upload not yet implemented. Configure TIKTOK_CLIENT_KEY.",
            "video_id": None,
        }

    async def get_stats(self, video_id: str) -> dict:
        """Fetch video statistics from TikTok. (Stub)"""
        return {
            "platform": "tiktok",
            "views": 0,
            "likes": 0,
            "saves": 0,
            "views_1h": 0,
        }


class InstagramAPI:
    """Meta Graph API (Instagram Reels) integration stub."""

    def __init__(self):
        self.app_id = os.getenv("META_APP_ID", "")
        self.app_secret = os.getenv("META_APP_SECRET", "")
        self.access_token = os.getenv("INSTAGRAM_ACCESS_TOKEN", "")

    async def upload_video(self, video_path: str, title: str, description: str, tags: list[str]) -> dict:
        """Upload a video to Instagram Reels. (Stub)"""
        return {
            "platform": "instagram",
            "status": "stub",
            "message": "Instagram upload not yet implemented. Configure META_APP_ID.",
            "video_id": None,
        }

    async def get_stats(self, video_id: str) -> dict:
        """Fetch video statistics from Instagram. (Stub)"""
        return {
            "platform": "instagram",
            "views": 0,
            "likes": 0,
            "saves": 0,
            "views_1h": 0,
        }


# Singleton instances
youtube_api = YouTubeAPI()
tiktok_api = TikTokAPI()
instagram_api = InstagramAPI()
