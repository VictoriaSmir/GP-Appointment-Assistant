from __future__ import annotations
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    import openvino_genai as ov_genai
    from backend.translate_utils import NLLBTranslator

whisper: "ov_genai.WhisperPipeline | None" = None
translator: "NLLBTranslator | None" = None