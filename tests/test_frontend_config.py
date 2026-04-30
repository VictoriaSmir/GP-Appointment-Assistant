import re
import pytest

CONFIG_PATH = "frontend/js/config.js"


def read_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return f.read()


SUPPORTED_CODES = [
    "eng_Latn", "spa_Latn", "fra_Latn", "deu_Latn", "por_Latn",
    "pol_Latn", "rus_Cyrl", "ukr_Cyrl", "ara_Arab", "hin_Deva",
    "ben_Beng", "zho_Hans", "ita_Latn", "jpn_Jpan", "kor_Hang",
    "nld_Latn", "tur_Latn", "vie_Latn", "tha_Thai", "ron_Latn",
]

REQUIRED_DEFAULT_STRINGS = [
    "bannerTitle", "backText", "actionTitle", "appointmentText",
    "emergencyText", "skipText", "optionalText", "summaryTitle",
    "submitText", "startOverText", "editText", "serviceTypeLabel",
    "serviceSelectionQuestion", "recommendationsTitle", "disclaimerText",
    "voiceoverLabel", "progressQuestion", "progressOf", "progressAnswered",
    "loadingTitle", "loadingSub", "sendText", "textInputPlaceholder",
]

REQUIRED_SERVICE_STRINGS = [
    "svc_repeat_prescription_title", "svc_fit_note_title",
    "svc_routine_care_title", "svc_test_results_title",
    "svc_referral_followup_title", "svc_doctors_letter_title",
    "svc_general_appointment_title",
]

REQUIRED_REC_STRINGS = [
    "rec_dental_title", "rec_mental_title", "rec_back_title",
    "rec_physio_title", "rec_eye_title", "rec_skin_title",
    "rec_weight_title", "rec_sleep_title", "rec_diabetes_title",
    "rec_sexual_title", "rec_addiction_title", "rec_child_title",
    "rec_nhs_title",
]


class TestLanguageConfig:

    def test_all_20_language_codes_defined(self):
        config = read_config()
        for code in SUPPORTED_CODES:
            assert f'code: "{code}"' in config, f"Language code {code} missing from config.js"

    def test_all_20_languages_have_flags(self):
        config = read_config()
        for code in SUPPORTED_CODES:
            assert f'"{code}"' in config, f"Flag for {code} may be missing"

    def test_all_languages_have_native_name(self):
        config = read_config()
        native_matches = re.findall(r'native:\s*"([^"]+)"', config)
        assert len(native_matches) >= 20, \
            f"Expected at least 20 native names, found {len(native_matches)}"

    def test_all_languages_have_whisper_code(self):
        config = read_config()
        whisper_matches = re.findall(r'whisper:\s*"([^"]+)"', config)
        assert len(whisper_matches) >= 20, \
            f"Expected at least 20 Whisper codes, found {len(whisper_matches)}"

    def test_no_duplicate_language_codes(self):
        config = read_config()
        codes = re.findall(r'code:\s*"([^"]+)"', config)
        assert len(codes) == len(set(codes)), \
            f"Duplicate language codes found: {[c for c in codes if codes.count(c) > 1]}"


class TestDefaultStrings:

    def test_all_required_default_strings_present(self):
        config = read_config()
        for key in REQUIRED_DEFAULT_STRINGS:
            assert f'{key}:' in config, f"Missing defaultStrings key: {key}"

    def test_all_required_service_strings_present(self):
        config = read_config()
        for key in REQUIRED_SERVICE_STRINGS:
            assert f'{key}:' in config, f"Missing serviceStrings key: {key}"

    def test_all_required_rec_strings_present(self):
        config = read_config()
        for key in REQUIRED_REC_STRINGS:
            assert f'{key}:' in config, f"Missing recStrings key: {key}"

    def test_default_strings_values_non_empty(self):
        config = read_config()
        start = config.index("const defaultStrings = {")
        end   = config.index("\n};", start) + 3
        block = config[start:end]
        pairs = re.findall(r'(\w+):\s*"([^"]*)"', block)
        for key, val in pairs:
            assert val.strip(), f"defaultStrings.{key} is empty"

    def test_all_translations_split_into_three_objects(self):
        config = read_config()
        assert "const defaultStrings" in config
        assert "const serviceStrings" in config
        assert "const recStrings"     in config

    def test_window_all_translated_strings_on_window(self):
        config = read_config()
        assert "window._allTranslatedStrings" in config
        assert "let _allTranslatedStrings" not in config