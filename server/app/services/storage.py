from pathlib import Path

import aioboto3
from botocore.exceptions import BotoCoreError, ClientError

from app.core.config import get_settings
from app.core.errors import StorageError


def _storage_key(user_id: str, document_id: str) -> str:
    return f"docs/{user_id}/{document_id}.pdf"


def _client():
    settings = get_settings()
    session = aioboto3.Session()
    return session.client(
        "s3",
        endpoint_url=settings.storage_endpoint,
        aws_access_key_id=settings.storage_access_key,
        aws_secret_access_key=settings.storage_secret_key,
        region_name="auto",
    )


async def put(user_id: str, document_id: str, source: Path) -> str:
    """Upload local file to object storage; return storage_key."""
    key = _storage_key(user_id, document_id)
    settings = get_settings()

    try:
        async with _client() as client:
            await client.upload_file(str(source), settings.storage_bucket, key)
    except (BotoCoreError, ClientError, OSError) as exc:
        raise StorageError(f"upload failed: {exc!s}") from exc

    return key


async def signed_url(storage_key: str, expires_in: int = 600) -> str:
    settings = get_settings()
    try:
        async with _client() as client:
            return await client.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.storage_bucket, "Key": storage_key},
                ExpiresIn=expires_in,
            )
    except (BotoCoreError, ClientError) as exc:
        raise StorageError(f"presign failed: {exc!s}") from exc


async def delete(storage_key: str) -> None:
    settings = get_settings()
    try:
        async with _client() as client:
            await client.delete_object(Bucket=settings.storage_bucket, Key=storage_key)
    except (BotoCoreError, ClientError) as exc:
        raise StorageError(f"delete failed: {exc!s}") from exc
