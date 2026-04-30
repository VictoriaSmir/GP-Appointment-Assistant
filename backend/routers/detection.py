import numpy as np
from fastapi import APIRouter, File, UploadFile
from langdetect import detect, LangDetectException

import backend.app_state as app_state
from backend.constants import LANGDETECT_TO_NLLB, NLLB_TO_WHISPER
from backend.helpers import validate_audio, clean_whisper_output
from backend.audio_utils import webm_bytes_to_16k_float_list

router = APIRouter()

_DEFAULT = {"detected_language": "en", "nllb_code": "eng_Latn", "transcript": ""}


@router.post("/detect_language")
async def detect_language(audio: UploadFile = File(...)):
    print("\n" + "=" * 60)
    print("/detect_language")
    print("=" * 60)

    raw = await audio.read()
    print(f"  raw bytes: {len(raw)}")

    samples, _sr = webm_bytes_to_16k_float_list(raw)
    is_valid, error_msg, diagnostics = validate_audio(samples)

    if not is_valid:
        print(f"Audio validation failed: {error_msg}")
        return {**_DEFAULT, "detection_method": "default (audio validation failed)", "error": error_msg}

    try:
        result = app_state.whisper.generate(np.array(samples, dtype=np.float32))
        transcript = ""
        if hasattr(result, "texts") and result.texts:
            transcript = clean_whisper_output(result.texts[0])
            print(f"  transcript: '{transcript}'")
    except Exception as exc:
        print(f"Whisper error: {exc}")
        return {**_DEFAULT, "detection_method": "default (whisper failed)", "error": str(exc)}

    if not transcript or len(transcript.strip()) < 3:
        return {**_DEFAULT, "transcript": transcript, "detection_method": "default (transcript too short)"}

    try:
        langdetect_code = detect(transcript)
        nllb_code = LANGDETECT_TO_NLLB.get(langdetect_code, "eng_Latn")
        whisper_code = NLLB_TO_WHISPER.get(nllb_code, "en")
        print(f"  detected: {langdetect_code} → {nllb_code}")
        return {
            "detected_language": whisper_code,
            "nllb_code": nllb_code,
            "transcript": transcript,
            "detection_method": "langdetect",
        }
    except LangDetectException:
        return {**_DEFAULT, "transcript": transcript, "detection_method": "default (detection failed)"}