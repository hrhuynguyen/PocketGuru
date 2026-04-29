"""Nightly job: delete object-storage files whose Document row no longer exists."""

import logging

from botocore.exceptions import BotoCoreError, ClientError
from sqlalchemy import select

from app.core.config import get_settings
from app.deps import _get_sessionmaker
from app.models import Document
from app.services.storage import _client

logger = logging.getLogger(__name__)

STORAGE_PREFIX = "docs/"


async def _live_storage_keys() -> set[str]:
    settings = get_settings()
    maker = _get_sessionmaker(settings)
    async with maker() as session:
        rows = await session.execute(
            select(Document.storage_key).where(Document.deleted_at.is_(None))
        )
        return {key for (key,) in rows.all() if key}


async def _list_remote_keys() -> set[str]:
    settings = get_settings()
    keys: set[str] = set()
    async with _client() as client:
        paginator = client.get_paginator("list_objects_v2")
        async for page in paginator.paginate(
            Bucket=settings.storage_bucket, Prefix=STORAGE_PREFIX
        ):
            for obj in page.get("Contents", []) or []:
                key = obj.get("Key")
                if key:
                    keys.add(key)
    return keys


async def run() -> dict[str, int]:
    """Delete remote objects under docs/ that have no live Document row.

    Returns a small report so callers/tests can assert outcomes.
    """
    settings = get_settings()
    try:
        live = await _live_storage_keys()
        remote = await _list_remote_keys()
    except (BotoCoreError, ClientError) as exc:
        logger.exception("orphan_sweep_list_failed", exc_info=exc)
        return {"scanned": 0, "deleted": 0, "errors": 1}

    orphans = sorted(remote - live)
    if not orphans:
        logger.info("orphan_sweep_clean scanned=%d", len(remote))
        return {"scanned": len(remote), "deleted": 0, "errors": 0}

    deleted = 0
    errors = 0
    async with _client() as client:
        for i in range(0, len(orphans), 1000):
            batch = orphans[i : i + 1000]
            try:
                resp = await client.delete_objects(
                    Bucket=settings.storage_bucket,
                    Delete={"Objects": [{"Key": k} for k in batch], "Quiet": True},
                )
                errors += len(resp.get("Errors", []) or [])
                deleted += len(batch) - len(resp.get("Errors", []) or [])
            except (BotoCoreError, ClientError) as exc:
                logger.exception("orphan_sweep_delete_failed", exc_info=exc)
                errors += len(batch)

    logger.info(
        "orphan_sweep_done scanned=%d deleted=%d errors=%d",
        len(remote),
        deleted,
        errors,
    )
    return {"scanned": len(remote), "deleted": deleted, "errors": errors}
