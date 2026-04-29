from pathlib import Path

from pypdf import PdfReader

from app.core.errors import OcrTooShortError
from app.services import gemini

MIN_TEXT_CHARS = 200


async def extract_text(pdf_path: Path) -> str:
    """Extract text via pypdf; fall back to PyMuPDF render-then-OCR if too short."""
    text = _extract_with_pypdf(pdf_path)
    if len(text.strip()) >= MIN_TEXT_CHARS:
        return text

    pages = await render_pages(pdf_path)
    ocr_text = (await gemini.vision_ocr(pages)).strip()
    final = ocr_text or text.strip()
    if len(final) < MIN_TEXT_CHARS:
        raise OcrTooShortError()
    return final


async def render_pages(pdf_path: Path) -> list[bytes]:
    """Render each page to PNG bytes using PyMuPDF."""
    import fitz

    pages: list[bytes] = []
    with fitz.open(pdf_path) as doc:
        for page in doc:
            pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            pages.append(pixmap.tobytes("png"))
    return pages


def _extract_with_pypdf(pdf_path: Path) -> str:
    try:
        reader = PdfReader(str(pdf_path))
    except Exception:
        return ""

    chunks: list[str] = []
    for page in reader.pages:
        try:
            page_text = page.extract_text() or ""
        except Exception:
            page_text = ""
        if page_text:
            chunks.append(page_text)
    return "\n\n".join(chunks).strip()
