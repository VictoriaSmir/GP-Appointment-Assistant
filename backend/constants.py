import os
import sys

def _get_base():
    if getattr(sys, "frozen", False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

_BASE = _get_base()

WHISPER_MODEL_DIR = os.path.join(_BASE, "models", "whisper_ov_quantised")
NLLB_MODEL_DIR    = os.path.join(_BASE, "models", "nllb_ov_quantised")
DEVICE            = "CPU"

LANGDETECT_TO_NLLB: dict[str, str] = {
    "en":    "eng_Latn", "es": "spa_Latn", "fr": "fra_Latn",
    "de":    "deu_Latn", "pt": "por_Latn", "pl": "pol_Latn",
    "ru":    "rus_Cyrl", "uk": "ukr_Cyrl", "ar": "ara_Arab",
    "hi":    "hin_Deva", "bn": "ben_Beng", "zh-cn": "zho_Hans",
    "zh-tw": "zho_Hant", "it": "ita_Latn", "ja": "jpn_Jpan",
    "ko":    "kor_Hang", "nl": "nld_Latn", "tr": "tur_Latn",
    "vi":    "vie_Latn", "th": "tha_Thai", "ro": "ron_Latn",
    "cs":    "ces_Latn", "sv": "swe_Latn", "da": "dan_Latn",
    "fi":    "fin_Latn", "no": "nno_Latn",
}

NLLB_TO_WHISPER: dict[str, str] = {
    "eng_Latn": "english",    "spa_Latn": "spanish",
    "fra_Latn": "french",     "deu_Latn": "german",
    "por_Latn": "portuguese", "pol_Latn": "polish",
    "rus_Cyrl": "russian",    "ukr_Cyrl": "ukrainian",
    "ara_Arab": "arabic",     "hin_Deva": "hindi",
    "ben_Beng": "bengali",    "zho_Hans": "chinese",
    "ita_Latn": "italian",    "jpn_Jpan": "japanese",
    "kor_Hang": "korean",     "nld_Latn": "dutch",
    "tur_Latn": "turkish",    "vie_Latn": "vietnamese",
    "tha_Thai": "thai",       "ron_Latn": "romanian",
}

NLLB_TO_EDGE_VOICE: dict[str, str] = {
    "eng_Latn": "en-GB-SoniaNeural",    "spa_Latn": "es-ES-ElviraNeural",
    "fra_Latn": "fr-FR-DeniseNeural",   "deu_Latn": "de-DE-KatjaNeural",
    "por_Latn": "pt-PT-RaquelNeural",   "pol_Latn": "pl-PL-ZofiaNeural",
    "rus_Cyrl": "ru-RU-SvetlanaNeural", "ukr_Cyrl": "uk-UA-PolinaNeural",
    "ara_Arab": "ar-SA-ZariyahNeural",  "hin_Deva": "hi-IN-SwaraNeural",
    "ben_Beng": "bn-IN-TanishaaNeural", "zho_Hans": "zh-CN-XiaoxiaoNeural",
    "ita_Latn": "it-IT-ElsaNeural",     "jpn_Jpan": "ja-JP-NanamiNeural",
    "kor_Hang": "ko-KR-SunHiNeural",    "nld_Latn": "nl-NL-ColetteNeural",
    "tur_Latn": "tr-TR-EmelNeural",     "vie_Latn": "vi-VN-HoaiMyNeural",
    "tha_Thai": "th-TH-PremwadeeNeural","ron_Latn": "ro-RO-AlinaNeural",
}

CHATBOT_QUESTIONS: dict[str, str] = {
    "problem_description": "Can you describe your health problem?",
    "duration":            "How long has it been going on for? Is it getting better or worse?",
    "tried_anything":      "Have you tried anything to help?",
    "worried_about":       "Is there anything you're particularly worried about?",
    "how_to_help":         "How would you like us to help?",
    "contact_times":       "When are the best times to contact you?",
    "medication_name":     "What medication do you need?",
    "additional_info":     "Is there anything else you want to tell us?",
    "previous_note":       "Have you previously had a note about this?",
    "illness_description": "Briefly describe your illness or medical problem.",
    "note_start_date":     "When should the sick note start? Please say the day, month, and year.",
    "note_end_date":       "When should the sick note end? Please say the day, month, and year.",
    "employer_help":       "Can your employer do anything to help you return to work sooner?",
    "care_type":           "What type of routine care do you need?",
    "test_type":           "What test was it?",
    "test_date":           "When was the test done?",
    "referral_details":    "What referral is it about?",
    "letter_purpose":      "What is the letter for?",
    "letter_deadline":     "When do you need the letter by?",
}

CHATBOT_SYSTEM_MESSAGES: dict[str, str] = {
    "greeting":     "Hello! I'm here to help you book a GP appointment. I'll ask you a few questions about your health problem.",
    "thank_you":    "Thank you! Here's a summary of your answers. We'll review this and contact you soon.",
    "submitted":    "",
    "echo_prefix":  "I heard:",
    "echo_suffix":  "How else can I help you?",
}

LANGUAGE_NAMES = {
    "eng_Latn": "English",
    "spa_Latn": "Spanish",
    "fra_Latn": "French",
    "deu_Latn": "German",
    "por_Latn": "Portuguese",
    "pol_Latn": "Polish",
    "rus_Cyrl": "Russian",
    "ukr_Cyrl": "Ukrainian",
    "ara_Arab": "Arabic",
    "hin_Deva": "Hindi",
    "ben_Beng": "Bengali",
    "zho_Hans": "Chinese",
    "ita_Latn": "Italian",
    "jpn_Jpan": "Japanese",
    "kor_Hang": "Korean",
    "nld_Latn": "Dutch",
    "tur_Latn": "Turkish",
    "vie_Latn": "Vietnamese",
    "tha_Thai": "Thai",
    "ron_Latn": "Romanian",
}