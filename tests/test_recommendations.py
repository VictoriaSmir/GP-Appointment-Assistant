import re
import os
import json
import pytest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RECS_JS_PATH = os.path.join(ROOT, "frontend", "js", "recommendations.js")


def load_rules() -> list[dict]:
    with open(RECS_JS_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    match = re.search(r'const RECOMMENDATION_RULES\s*=\s*(\[.*?\]);', content, re.DOTALL)
    if not match:
        pytest.fail("Could not find RECOMMENDATION_RULES in recommendations.js")

    raw = match.group(1)
    raw = re.sub(r'^\s*//[^\n]*', '', raw, flags=re.MULTILINE)
    raw = re.sub(r',\s*([}\]])', r'\1', raw)
    raw = re.sub(r'([,{\s])([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)', r'\1"\2"\3', raw)
    raw = re.sub(r"(?<=\w)'(?=\w)", "APOSTROPHE", raw)
    raw = re.sub(r"(?<![\\])'([^']*)'", r'"\1"', raw)
    raw = raw.replace("APOSTROPHE", "'")
    raw = re.sub(r'`[^`]*`', '""', raw)
    raw = re.sub(r'[ \t]{2,}', ' ', raw)

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        lines = raw.split('\n')
        line_no = e.lineno - 1
        context = '\n'.join(lines[max(0, line_no-2):line_no+3])
        pytest.fail(f"JSON parse error at line {e.lineno}: {e.msg}\nContext:\n{context}")


def get_recommendations(answers: dict, rules: list) -> list[dict]:
    all_text = " ".join(answers.values()).lower()
    return [
        rule for rule in rules
        if any(kw.lower() in all_text for kw in rule["keywords"])
    ]


@pytest.fixture(scope="module")
def rules():
    return load_rules()


EXPECTED_RULE_IDS = {
    "dental", "mental_health", "back_pain", "physio", "eye_care",
    "skin", "weight", "sleep", "diabetes", "sexual_health",
    "addiction", "child_health",
}


class TestRuleStructure:

    def test_all_expected_categories_present(self, rules):
        ids = {r["id"] for r in rules}
        missing = EXPECTED_RULE_IDS - ids
        assert not missing, f"Missing recommendation categories: {missing}"

    def test_each_rule_has_required_fields(self, rules):
        required = {"id", "keywords", "title", "icon", "color", "blurb", "links"}
        for rule in rules:
            missing = required - set(rule.keys())
            assert not missing, f"Rule '{rule.get('id')}' missing fields: {missing}"

    def test_each_rule_has_at_least_one_link(self, rules):
        for rule in rules:
            assert rule["links"], f"Rule '{rule['id']}' has no links"

    def test_links_have_label_and_url(self, rules):
        for rule in rules:
            for link in rule["links"]:
                assert "label" in link and link["label"], \
                    f"Rule '{rule['id']}' has link with empty label"
                assert "url" in link and link["url"].startswith("http"), \
                    f"Rule '{rule['id']}' has link with invalid URL"

    def test_keywords_are_non_empty_strings(self, rules):
        for rule in rules:
            for kw in rule["keywords"]:
                assert isinstance(kw, str) and kw.strip(), \
                    f"Rule '{rule['id']}' has empty/invalid keyword"


class TestKeywordMatching:

    def test_dental_matches_toothache(self, rules):
        assert "dental" in {r["id"] for r in
            get_recommendations({"problem": "I have a bad toothache"}, rules)}

    def test_mental_health_matches_anxiety(self, rules):
        assert "mental_health" in {r["id"] for r in
            get_recommendations({"problem": "I have been very anxious lately"}, rules)}

    def test_back_pain_matches(self, rules):
        assert "back_pain" in {r["id"] for r in
            get_recommendations({"problem": "I have severe lower back pain"}, rules)}

    def test_diabetes_matches(self, rules):
        assert "diabetes" in {r["id"] for r in
            get_recommendations({"problem": "I am diabetic and my blood sugar is high"}, rules)}

    def test_sleep_matches_insomnia(self, rules):
        assert "sleep" in {r["id"] for r in
            get_recommendations({"problem": "I have terrible insomnia"}, rules)}

    def test_no_match_returns_empty(self, rules):
        recs = get_recommendations({"problem": "I need my prescription renewed"}, rules)
        assert len(recs) == 0

    def test_multiple_categories_can_match(self, rules):
        ids = {r["id"] for r in get_recommendations({
            "problem": "I have a toothache and feel very anxious"
        }, rules)}
        assert "dental" in ids
        assert "mental_health" in ids

    def test_matching_is_case_insensitive(self, rules):
        lower = {r["id"] for r in get_recommendations({"p": "diabetes"}, rules)}
        upper = {r["id"] for r in get_recommendations({"p": "DIABETES"}, rules)}
        assert lower == upper

    def test_child_health_matches(self, rules):
        assert "child_health" in {r["id"] for r in
            get_recommendations({"problem": "my child has a fever"}, rules)}

    def test_physio_matches_sprain(self, rules):
        assert "physio" in {r["id"] for r in
            get_recommendations({"problem": "I sprained my ankle last week"}, rules)}