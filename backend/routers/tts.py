import io
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from backend.constants import NLLB_TO_EDGE_VOICE
from backend.schemas import TTSRequest

router = APIRouter()


@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    if not request.text or not request.text.strip():
        return {"error": "No text provided"}

    import edge_tts

    voice = NLLB_TO_EDGE_VOICE.get(request.lang, "en-GB-SoniaNeural")

    try:
        communicate = edge_tts.Communicate(request.text, voice)
        audio_buffer = io.BytesIO()

        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_buffer.write(chunk["data"])

        audio_buffer.seek(0)
        return StreamingResponse(
            audio_buffer,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=tts.mp3"},
        )

    except Exception as exc:
        import traceback
        traceback.print_exc()
        return {"error": str(exc)}