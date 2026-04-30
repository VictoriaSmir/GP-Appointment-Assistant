from fastapi import APIRouter

from backend.constants import CHATBOT_QUESTIONS, CHATBOT_SYSTEM_MESSAGES
from backend.helpers import translate_text
from backend.schemas import ChatbotMessageRequest, UITranslationRequest

router = APIRouter()


@router.post("/chatbot_message")
async def chatbot_message(request: ChatbotMessageRequest):
    print(f"/chatbot_message  key={request.message_key}  lang={request.target_lang}")

    if request.message_type == "question":
        english_text = CHATBOT_QUESTIONS.get(request.message_key)
    else:
        english_text = CHATBOT_SYSTEM_MESSAGES.get(request.message_key)

    if not english_text:
        return {"error": f"Unknown message key: {request.message_key}", "text": ""}

    if request.target_lang == "eng_Latn":
        return {"text": english_text, "source": english_text, "translated": False}

    translated = translate_text(english_text, src_lang="eng_Latn", tgt_lang=request.target_lang)
    print(f"  '{english_text}' → '{translated}'")
    return {"text": translated, "source": english_text, "translated": True}


@router.post("/translate_ui")
async def translate_ui(request: UITranslationRequest):
    print(f"/translate_ui  lang={request.target_lang}")

    if request.target_lang == "eng_Latn":
        return request.strings

    translated = {
        key: translate_text(text, src_lang="eng_Latn", tgt_lang=request.target_lang)
        if text and text.strip() else text
        for key, text in request.strings.items()
    }

    print(f"  translated {len(translated)} UI strings")
    return translated