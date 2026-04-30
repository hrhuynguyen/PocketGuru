from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from app.core.config import get_settings
from app.core.logging import configure_logging
from app.deps import get_user_id
from app.routers import attempts, documents, process
from app.services.gemini import GeminiRateLimit


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="SnapStudy API", version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(process.router, prefix="/api", tags=["process"])
    app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
    app.include_router(attempts.router, prefix="/api/attempts", tags=["attempts"])

    @app.exception_handler(GeminiRateLimit)
    async def gemini_rate_limit_handler(
        request: Request, exc: GeminiRateLimit
    ) -> JSONResponse:
        return JSONResponse(
            status_code=429,
            content={"detail": "Gemini rate limit exceeded"},
            headers={"Retry-After": str(exc.retry_after)},
        )

    @app.exception_handler(ValidationError)
    async def pydantic_validation_error_handler(
        request: Request, exc: ValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content={"detail": "Gemini response validation failed"},
        )

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/whoami")
    async def whoami(user_id: Annotated[str, Depends(get_user_id)]) -> dict[str, str]:
        return {"user_id": user_id}

    return app


app = create_app()
