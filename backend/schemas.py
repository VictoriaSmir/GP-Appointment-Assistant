from pydantic import BaseModel


class UITranslationRequest(BaseModel):
    strings: dict[str, str]
    target_lang: str


class ChatbotMessageRequest(BaseModel):
    message_key: str          # e.g. "problem_description"
    target_lang: str          # NLLB code e.g. "ita_Latn"
    message_type: str = "question"  # "question" | "system"


class FormTranslationRequest(BaseModel):
    answers: dict[str, str]   # question_id → answer in user's language
    source_lang: str          # NLLB code of user's language


class TranscriptTranslateRequest(BaseModel):
    text: str
    source_lang: str          # NLLB code — the language of the text


class TTSRequest(BaseModel):
    text: str
    lang: str