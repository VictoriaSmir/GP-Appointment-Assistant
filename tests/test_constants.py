import pytest
from backend.constants import (
    LANGDETECT_TO_NLLB,
    NLLB_TO_WHISPER,
    NLLB_TO_EDGE_VOICE,
    CHATBOT_QUESTIONS,
    CHATBOT_SYSTEM_MESSAGES,
)

# The 20 NLLB codes the app officially supports
SUPPORTED_NLLB_CODES = {
    "eng_Latn", "spa_Latn", "fra_Latn", "deu_Latn", "por_Latn",
    "pol_Latn", "rus_Cyrl", "ukr_Cyrl", "ara_Arab", "hin_Deva",
    "ben_Beng", "zho_Hans", "ita_Latn", "jpn_Jpan", "kor_Hang",
    "nld_Latn", "tur_Latn", "vie_Latn", "tha_Thai", "ron_Latn",
}

# Required chatbot question keys
REQUIRED_QUESTION_KEYS = {
    "problem_description", "duration", "tried_anything", "worried_about",
    "how_to_help", "contact_times", "medication_name", "additional_info",
    "previous_note", "illness_description", "note_start_date", "note_end_date",
    "employer_help", "care_type", "test_type", "test_date",
    "referral_details", "letter_purpose", "letter_deadline",
}

REQUIRED_SYSTEM_KEYS = {"greeting", "thank_you", "submitted", "echo_prefix", "echo_suffix"}

class TestLanguageMappings:

    def test_all_supported_languages_have_whisper_mapping(self):
        missing = SUPPORTED_NLLB_CODES - set(NLLB_TO_WHISPER.keys())
        assert not missing, f"Missing Whisper mappings: {missing}"

    def test_all_supported_languages_have_tts_voice(self):
        missing = SUPPORTED_NLLB_CODES - set(NLLB_TO_EDGE_VOICE.keys())
        assert not missing, f"Missing TTS voice mappings: {missing}"

    def test_whisper_values_are_non_empty_strings(self):
        for code, whisper in NLLB_TO_WHISPER.items():
            assert isinstance(whisper, str) and whisper.strip(), \
                f"Empty Whisper value for {code}"

    def test_edge_voice_values_follow_format(self):
        import re
        pattern = re.compile(r'^[a-z]{2}-[A-Z]{2}-\w+Neural$')
        for code, voice in NLLB_TO_EDGE_VOICE.items():
            assert pattern.match(voice), \
                f"Invalid Edge TTS voice format for {code}: '{voice}'"

    def test_langdetect_values_are_valid_nllb_codes(self):
        import re
        pattern = re.compile(r'^[a-z]{3}_[A-Z][a-z]{3,}$')
        for detect_code, nllb_code in LANGDETECT_TO_NLLB.items():
            assert pattern.match(nllb_code), \
                f"NLLB code '{nllb_code}' for langdetect '{detect_code}' looks malformed"

    def test_english_maps_to_correct_codes(self):
        assert LANGDETECT_TO_NLLB.get("en") == "eng_Latn"
        assert NLLB_TO_WHISPER.get("eng_Latn") == "english"
        assert NLLB_TO_EDGE_VOICE.get("eng_Latn") == "en-GB-SoniaNeural"

    def test_arabic_maps_to_correct_codes(self):
        assert LANGDETECT_TO_NLLB.get("ar") == "ara_Arab"
        assert NLLB_TO_WHISPER.get("ara_Arab") == "arabic"

    def test_no_duplicate_nllb_codes_in_whisper_map(self):
        values = list(NLLB_TO_WHISPER.values())
        assert len(values) == len(set(values)), "Duplicate Whisper language names found"

    def test_no_duplicate_voice_names(self):
        values = list(NLLB_TO_EDGE_VOICE.values())
        assert len(values) == len(set(values)), "Duplicate Edge TTS voice names found"

class TestChatbotContent:

    def test_all_required_question_keys_present(self):
        missing = REQUIRED_QUESTION_KEYS - set(CHATBOT_QUESTIONS.keys())
        assert not missing, f"Missing question keys: {missing}"

    def test_all_required_system_keys_present(self):
        missing = REQUIRED_SYSTEM_KEYS - set(CHATBOT_SYSTEM_MESSAGES.keys())
        assert not missing, f"Missing system message keys: {missing}"

    def test_all_question_values_non_empty(self):
        for key, val in CHATBOT_QUESTIONS.items():
            assert val and val.strip(), f"Empty question text for key '{key}'"
            
    def test_all_system_values_non_empty(self):
        INTENTIONALLY_EMPTY = {"submitted"}
        from backend.constants import CHATBOT_SYSTEM_MESSAGES
        for key, val in CHATBOT_SYSTEM_MESSAGES.items():
            if key in INTENTIONALLY_EMPTY:
                continue
            assert val and val.strip(), f"Empty system message for key '{key}'"

    def test_questions_end_with_punctuation(self):
        for key, val in CHATBOT_QUESTIONS.items():
            assert val.endswith(("?", ".")), \
                f"Question '{key}' doesn't end with punctuation: '{val}'"

    def test_greeting_mentions_gp(self):
        assert "GP" in CHATBOT_SYSTEM_MESSAGES["greeting"] or \
               "appointment" in CHATBOT_SYSTEM_MESSAGES["greeting"].lower()