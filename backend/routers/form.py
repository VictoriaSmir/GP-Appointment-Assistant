from fastapi import APIRouter

from backend.constants import CHATBOT_QUESTIONS
from backend.helpers import translate_text
from backend.schemas import FormTranslationRequest

router = APIRouter()


@router.post("/submit_form")
async def submit_form(request: FormTranslationRequest):
    print(f"\n/submit_form  source_lang={request.source_lang}")
    print(f"  {len(request.answers)} answers to translate")

    if request.source_lang == "eng_Latn":
        translated_answers = dict(request.answers)
    else:
        translated_answers = {}
        for question_id, answer in request.answers.items():
            if not answer or not answer.strip():
                translated_answers[question_id] = answer
                continue
            english = translate_text(answer, src_lang=request.source_lang, tgt_lang="eng_Latn")
            print(f"  [{question_id}] '{answer}' → '{english}'")
            translated_answers[question_id] = english

    question_labels = {
        k: CHATBOT_QUESTIONS.get(k, k.replace("_", " ").title())
        for k in request.answers.keys()
    }

    return {
        "success": True,
        "patient_language": request.source_lang,
        "answers_original": request.answers,
        "answers_english": translated_answers,
        "question_labels": question_labels,
    }