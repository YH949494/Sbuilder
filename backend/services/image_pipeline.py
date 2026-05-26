import os
import io
import base64
import requests
from PIL import Image
from rembg import remove
from services.asset_manager import upload_asset

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
SYMBOL_SIZE = (256, 256)
SYMBOL_PADDING = 10

ROLE_HINTS = {
    "HP1": "premium hero symbol, highly detailed",
    "HP2": "premium hero symbol, highly detailed",
    "LP1": "simple card symbol",
    "LP2": "simple card symbol",
    "LP3": "simple card symbol",
    "LP4": "simple card symbol",
    "WILD": "WILD text badge, glowing, ornate",
    "SCAT": "SCATTER text badge, glowing, mystical"
}


def generate_and_process(prompt: str, slot_id: str, game_id: str) -> str:
    """
    Full pipeline:
    1. Call GPT Image API with enriched prompt
    2. Download raw image
    3. Remove background (rembg)
    4. Resize to 256x256 with padding
    5. Upload to R2/S3
    6. Return public URL
    """
    enriched = _enrich_prompt(prompt, slot_id)
    raw_bytes = _call_gpt_image(enriched)
    processed = _process_image(raw_bytes)
    url = upload_asset(
        file_bytes=processed,
        key=f"games/{game_id}/symbols/{slot_id}.png",
        content_type="image/png"
    )
    return url


def _enrich_prompt(prompt: str, slot_id: str) -> str:
    role_hint = ROLE_HINTS.get(slot_id, "game symbol")
    return (
        f"{prompt}, {role_hint}, "
        f"transparent background, slot game art style, "
        f"vibrant colors, centered composition, "
        f"no text unless specified, high contrast"
    )


def _call_gpt_image(prompt: str) -> bytes:
    response = requests.post(
        "https://api.openai.com/v1/images/generations",
        headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
        json={
            "model": "gpt-image-1",
            "prompt": prompt,
            "n": 1,
            "size": "1024x1024",
            "response_format": "b64_json"
        },
        timeout=60
    )
    response.raise_for_status()
    b64 = response.json()["data"][0]["b64_json"]
    return base64.b64decode(b64)


def _process_image(raw_bytes: bytes) -> bytes:
    """Remove BG → resize to 256x256 with padding → return PNG bytes."""
    no_bg = remove(raw_bytes)
    img = Image.open(io.BytesIO(no_bg)).convert("RGBA")

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    canvas_size = SYMBOL_SIZE[0] - (SYMBOL_PADDING * 2)
    img.thumbnail((canvas_size, canvas_size), Image.LANCZOS)

    canvas = Image.new("RGBA", SYMBOL_SIZE, (0, 0, 0, 0))
    offset = (
        (SYMBOL_SIZE[0] - img.width) // 2,
        (SYMBOL_SIZE[1] - img.height) // 2
    )
    canvas.paste(img, offset, img)

    output = io.BytesIO()
    canvas.save(output, format="PNG")
    return output.getvalue()
