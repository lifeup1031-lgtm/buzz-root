from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from urllib.parse import urlencode

import os
from database import get_db
from models import OAuthToken

router = APIRouter(prefix="/api/auth", tags=["auth"])

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

OAUTH_CONFIGS = {
    "youtube": {
        "client_id": os.getenv("YOUTUBE_CLIENT_ID", ""),
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "scope": "https://www.googleapis.com/auth/youtube.upload",
        "redirect_uri": f"{BACKEND_URL}/api/auth/callback/youtube",
    },
    "tiktok": {
        "client_id": os.getenv("TIKTOK_CLIENT_KEY", ""),
        "auth_url": "https://www.tiktok.com/v2/auth/authorize/",
        "scope": "video.publish,user.info.basic",
        "redirect_uri": f"{BACKEND_URL}/api/auth/callback/tiktok",
    },
    "instagram": {
        "client_id": os.getenv("META_APP_ID", ""),
        "auth_url": "https://api.instagram.com/oauth/authorize",
        "scope": "instagram_content_publish",
        "redirect_uri": f"{BACKEND_URL}/api/auth/callback/instagram",
    }
}

@router.get("/login/{platform}")
def login_platform(platform: str):
    """Returns the authorization URL for the given platform."""
    if platform not in OAUTH_CONFIGS:
        raise HTTPException(status_code=404, detail="Platform not supported")
    
    config = OAUTH_CONFIGS[platform]
    params = {
        "client_id": config["client_id"],
        "redirect_uri": config["redirect_uri"],
        "scope": config["scope"],
        "response_type": "code",
    }
    
    if platform == "youtube":
        params["access_type"] = "offline"
        params["prompt"] = "consent"
    
    auth_url = f"{config['auth_url']}?{urlencode(params)}"
    return {"auth_url": auth_url}

@router.get("/callback/{platform}")
def oauth_callback(platform: str, code: str, db: Session = Depends(get_db)):
    """Receives the authorization code and exchanges it for an access token (stubbed for now)."""
    if platform not in OAUTH_CONFIGS:
        raise HTTPException(status_code=404, detail="Platform not supported")
        
    # TODO: Exchange 'code' for access_token with platform API here
    
    fake_access_token = f"stub_access_token_{platform}_{code[:5]}"
    fake_refresh_token = f"stub_refresh_token_{platform}"
    
    token_obj = db.query(OAuthToken).filter(OAuthToken.platform == platform).first()
    if not token_obj:
        token_obj = OAuthToken(platform=platform)
        db.add(token_obj)
        
    token_obj.access_token = fake_access_token
    token_obj.refresh_token = fake_refresh_token
    token_obj.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": f"Successfully connected to {platform} (Stubbed)"}

@router.get("/status")
def get_auth_status(db: Session = Depends(get_db)):
    """Returns connection status for all platforms."""
    tokens = db.query(OAuthToken).all()
    connected_platforms = {t.platform: True for t in tokens}
    
    return {
        "youtube": connected_platforms.get("youtube", False),
        "tiktok": connected_platforms.get("tiktok", False),
        "instagram": connected_platforms.get("instagram", False)
    }
