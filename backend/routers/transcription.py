import numpy as np
from fastapi import APIRouter, File, Query, UploadFile

import backend.app_state as app_state
from backend.audio_utils import webm_bytes_to_16k_float_list
from backend.constants import NLLB_TO_WHISPER
from backend.helpers import validate_audio, clean_whisper_output

router = APIRouter()


@router.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    src_lang: str = Query("eng_Latn"),
):
    print("\n" + "=" * 60)
    print(f"/transcribe  src_lang={src_lang}")
    print("=" * 60)

    raw = await audio.read()
    samples, _sr = webm_bytes_to_16k_float_list(raw)

    is_valid, error_msg, diagnostics = validate_audio(samples)
    if not is_valid:
        return {"transcript": "", "error": error_msg, "src_lang": src_lang}

    whisper_lang = NLLB_TO_WHISPER.get(src_lang, "english")
    print(f"  whisper language hint: {whisper_lang}")

    try:
        result = app_state.whisper.generate(np.array(samples, dtype=np.float32))
        transcript = ""
        if hasattr(result, "texts") and result.texts:
            transcript = clean_whisper_output(result.texts[0])

        print(f"  transcript: '{transcript}'")
        return {
            "transcript": transcript,
            "src_lang": src_lang,
            "audio_duration_seconds": diagnostics["duration_seconds"],
        }

    except Exception as exc:
        import traceback
        print(f"Whisper error: {exc}")
        traceback.print_exc()
        return {"transcript": "", "error": str(exc), "src_lang": src_lang}