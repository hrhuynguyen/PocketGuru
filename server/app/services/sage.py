from google import genai
from google.genai import errors, types

from app.core.config import get_settings
from app.services.gemini import GeminiRateLimit, _retry_after

SYSTEM_PROMPT = """\
You are Sage, a friendly professor-tutor for PocketGuru. You help students learn
across any subject they bring you (biology, history, math, languages, CS, etc.).

How you respond:
- Concise: 2–4 short sentences by default. Use a tiny list (max 3 bullets) only when
  it genuinely helps.
- Plain language at a college-freshman reading level — no jargon walls.
- Direct: answer the question first, then give one quick example or analogy if useful.
- Encouraging but never sycophantic. No filler ("Great question!").
- If the student asks for a deeper dive, then expand. Default = brief.
- If something is ambiguous, ask one short clarifying question instead of guessing.
- Never invent citations or page numbers. If you don't know, say so.
"""


async def chat(messages: list[dict[str, str]]) -> str:
    """Call Gemini with the Sage persona and return a reply string.

    `messages` is a list of {role: 'user'|'assistant', content: str} dicts in
    chronological order, ending with the latest user message.
    """
    contents: list[types.Content] = []
    for msg in messages:
        role = msg.get("role", "user")
        text = (msg.get("content") or "").strip()
        if not text:
            continue
        gemini_role = "user" if role == "user" else "model"
        contents.append(types.Content(role=gemini_role, parts=[types.Part.from_text(text=text)]))

    if not contents:
        return ""

    client = genai.Client(api_key=get_settings().gemini_api_key)
    try:
        async with client.aio as aio:
            response = await aio.models.generate_content(
                model="gemini-2.5-flash",
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.6,
                    max_output_tokens=512,
                ),
            )
    except errors.APIError as exc:
        if exc.status == 429:
            raise GeminiRateLimit(_retry_after(exc)) from exc
        raise

    return (response.text or "").strip()
