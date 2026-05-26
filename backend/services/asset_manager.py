import os
import io
import boto3
from botocore.client import Config

R2_ENDPOINT   = os.environ.get("CLOUDFLARE_R2_ENDPOINT", "")
R2_ACCESS_KEY = os.environ.get("CLOUDFLARE_R2_ACCESS_KEY", "")
R2_SECRET_KEY = os.environ.get("CLOUDFLARE_R2_SECRET_KEY", "")
R2_BUCKET     = os.environ.get("CLOUDFLARE_R2_BUCKET", "slotforge-assets")
ASSET_BASE_URL = os.environ.get("ASSET_BASE_URL", "")


def _get_client():
    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto"
    )


def upload_asset(file_bytes: bytes, key: str, content_type: str = "image/png") -> str:
    """Upload bytes to R2/S3, return public URL."""
    client = _get_client()
    client.put_object(
        Bucket=R2_BUCKET,
        Key=key,
        Body=io.BytesIO(file_bytes),
        ContentType=content_type,
        ACL="public-read"
    )
    return f"{ASSET_BASE_URL}/{key}"


def upload_asset_from_file(file_bytes: bytes, key: str, content_type: str = "image/png") -> str:
    """Process raw upload bytes and store."""
    return upload_asset(file_bytes=file_bytes, key=key, content_type=content_type)


def download_asset(key: str) -> bytes:
    client = _get_client()
    response = client.get_object(Bucket=R2_BUCKET, Key=key)
    return response["Body"].read()
