import numpy as np

import backend.app_state as app_state

def validate_audio(samples: list[float]) -> tuple[bool, str, dict]:
    diagnostics = {
        "num_samples":       len(samples) if samples else 0,
        "duration_seconds":  0.0,
        "max_amplitude":     0.0,
        "has_audio":         False,
    }

    if not samples:
        return False, "No audio data received", diagnostics

    diagnostics["duration_seconds"] = round(len(samples) / 16000, 2)

    arr = np.array(samples, dtype=np.float32)
    diagnostics["max_amplitude"] = round(float(np.max(np.abs(arr))), 4)
    diagnostics["has_audio"] = diagnostics["max_amplitude"] > 0.001

    if diagnostics["duration_seconds"] < 0.3:
        return False, "Audio too short (< 0.3s)", diagnostics

    if not diagnostics["has_audio"]:
        return False, "No audio signal detected", diagnostics

    return True, "", diagnostics

def clean_whisper_output(text: str) -> str:
    if not text:
        return ""
    if "<|" in text or "|>" in text:
        text = text.split("<|")[0].strip()
    return text.strip()

def translate_text(text: str, src_lang: str, tgt_lang: str) -> str:
    if not text or not text.strip():
        return text
    if src_lang == tgt_lang:
        return text
    try:
        return app_state.translator.translate(text, src_lang=src_lang, tgt_lang=tgt_lang)
    except Exception as exc:
        print(f"Translation failed ({src_lang}→{tgt_lang}): {exc}")
        return text