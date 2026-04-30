import json
import re
import pytest


def load_emergency_data() -> dict:

    path = "frontend/js/screens/emergency.js"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    match = re.search(r'const EMERGENCY_SYMPTOMS\s*=\s*(\{.*?\n\};)', content, re.DOTALL)
    if not match:
        pytest.fail("Could not find EMERGENCY_SYMPTOMS in emergency.js")

    raw = match.group(1).rstrip(";")

    raw = re.sub(r',\s*([}\]])', r'\1', raw)
    return json.loads(raw)


SUPPORTED_LANGS = [
    "eng_Latn", "spa_Latn", "fra_Latn", "deu_Latn", "por_Latn",
    "pol_Latn", "rus_Cyrl", "ukr_Cyrl", "ara_Arab", "hin_Deva",
    "ben_Beng", "zho_Hans", "ita_Latn", "jpn_Jpan", "kor_Hang",
    "nld_Latn", "tur_Latn", "vie_Latn", "tha_Thai", "ron_Latn",
]

REQUIRED_TOP_KEYS = {"warning_title", "screen_title", "button_emergency", "button_continue", "symptoms"}
REQUIRED_SYMPTOM_KEYS = {"category", "description"}
EXPECTED_SYMPTOM_COUNT = 11


@pytest.fixture(scope="module")
def data():
    return load_emergency_data()


class TestEmergencyData:

    def test_all_20_languages_present(self, data):
        missing = set(SUPPORTED_LANGS) - set(data.keys())
        assert not missing, f"Missing languages in emergency data: {missing}"

    @pytest.mark.parametrize("lang", SUPPORTED_LANGS)
    def test_language_has_required_keys(self, data, lang):
        assert REQUIRED_TOP_KEYS.issubset(data[lang].keys()), \
            f"{lang} missing keys: {REQUIRED_TOP_KEYS - set(data[lang].keys())}"

    @pytest.mark.parametrize("lang", SUPPORTED_LANGS)
    def test_language_has_correct_symptom_count(self, data, lang):
        symptoms = data[lang]["symptoms"]
        assert len(symptoms) == EXPECTED_SYMPTOM_COUNT, \
            f"{lang} has {len(symptoms)} symptoms, expected {EXPECTED_SYMPTOM_COUNT}"

    @pytest.mark.parametrize("lang", SUPPORTED_LANGS)
    def test_all_symptoms_have_category_and_description(self, data, lang):
        for i, symptom in enumerate(data[lang]["symptoms"]):
            assert REQUIRED_SYMPTOM_KEYS.issubset(symptom.keys()), \
                f"{lang} symptom {i} missing keys"
            assert symptom["category"].strip(), f"{lang} symptom {i} has empty category"
            assert symptom["description"].strip(), f"{lang} symptom {i} has empty description"

    @pytest.mark.parametrize("lang", SUPPORTED_LANGS)
    def test_all_top_level_strings_non_empty(self, data, lang):
        for key in REQUIRED_TOP_KEYS - {"symptoms"}:
            assert data[lang][key].strip(), f"{lang}.{key} is empty"

    def test_english_contains_999(self, data):
        eng = data["eng_Latn"]
        assert "999" in eng["button_emergency"]
        assert "999" in eng["warning_title"]

    def test_heart_attack_in_all_languages(self, data):
        for lang in SUPPORTED_LANGS:
            first = data[lang]["symptoms"][0]
            combined = (first["category"] + " " + first["description"]).lower()
            assert first["category"].strip(), f"{lang}: first symptom has empty category"