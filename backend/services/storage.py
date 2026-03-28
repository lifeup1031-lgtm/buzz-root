"""
Cloud Storage Service — Cloudflare R2 (S3-compatible) integration.
Handles video and thumbnail uploads to Cloudflare R2.
Falls back to local storage if R2 is not configured.
"""
import os
import uuid
import logging
from typing import Optional

logger = logging.getLogger("buzz-root.storage")

# R2 configuration from environment variables
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "buzz-root-videos")
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL", "")  # e.g., https://pub-xxx.r2.dev


def _is_r2_configured() -> bool:
    """Check if R2 credentials are configured."""
    return bool(R2_ACCOUNT_ID and R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY)


def _get_s3_client():
    """Create an S3-compatible client for Cloudflare R2."""
    import boto3

    return boto3.client(
        "s3",
        endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )


async def upload_file(
    file_content: bytes,
    original_filename: str,
    folder: str = "videos",
    content_type: str = "video/mp4",
) -> dict:
    """
    Upload a file to Cloudflare R2 (or local storage as fallback).

    Returns:
        dict with 'path' (storage key) and 'url' (public URL).
    """
    ext = os.path.splitext(original_filename)[1] if original_filename else ".mp4"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    storage_key = f"{folder}/{unique_name}"

    if _is_r2_configured():
        return await _upload_to_r2(file_content, storage_key, content_type)
    else:
        return _upload_to_local(file_content, storage_key)


async def _upload_to_r2(
    file_content: bytes,
    storage_key: str,
    content_type: str,
) -> dict:
    """Upload file to Cloudflare R2."""
    try:
        client = _get_s3_client()
        client.put_object(
            Bucket=R2_BUCKET_NAME,
            Key=storage_key,
            Body=file_content,
            ContentType=content_type,
        )

        # Build public URL
        if R2_PUBLIC_URL:
            public_url = f"{R2_PUBLIC_URL.rstrip('/')}/{storage_key}"
        else:
            public_url = f"https://{R2_BUCKET_NAME}.{R2_ACCOUNT_ID}.r2.dev/{storage_key}"

        logger.info(f"Uploaded to R2: {storage_key}")
        return {
            "path": storage_key,
            "url": public_url,
            "storage": "r2",
        }

    except Exception as e:
        logger.error(f"R2 upload failed: {e}, falling back to local storage")
        return _upload_to_local(file_content, storage_key)


def _upload_to_local(file_content: bytes, storage_key: str) -> dict:
    """Fallback: save file to local uploads/ directory."""
    local_dir = "uploads"
    os.makedirs(local_dir, exist_ok=True)

    # Flatten the key for local storage
    filename = storage_key.replace("/", "_")
    filepath = os.path.join(local_dir, filename)

    with open(filepath, "wb") as f:
        f.write(file_content)

    logger.info(f"Saved locally (R2 not configured): {filepath}")
    return {
        "path": filepath,
        "url": f"/{filepath}",
        "storage": "local",
    }


async def delete_file(storage_key: str) -> bool:
    """Delete a file from R2 (or local)."""
    if _is_r2_configured():
        try:
            client = _get_s3_client()
            client.delete_object(Bucket=R2_BUCKET_NAME, Key=storage_key)
            logger.info(f"Deleted from R2: {storage_key}")
            return True
        except Exception as e:
            logger.error(f"R2 delete failed: {e}")
            return False
    else:
        # Local fallback
        filename = storage_key.replace("/", "_")
        filepath = os.path.join("uploads", filename)
        if os.path.exists(filepath):
            os.remove(filepath)
            return True
        return False


def get_public_url(storage_key: str) -> Optional[str]:
    """
    Get the public URL for a stored file.
    This URL can be used for Instagram API (which requires a public video URL).
    """
    if _is_r2_configured() and R2_PUBLIC_URL:
        return f"{R2_PUBLIC_URL.rstrip('/')}/{storage_key}"
    return None
