import re
import os
import sys
import pytest

ROOT         = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_JS  = os.path.join(ROOT, "frontend", "js")
CONFIG_PATH  = os.path.join(FRONTEND_JS, "config.js")
UI_PATH      = os.path.join(FRONTEND_JS, "ui.js")


def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def extract_keys_from_block(content, block_name):
    pattern = rf"const {block_name}\s*=\s*\{{(.*?)\}};"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        return set()
    block = match.group(1)
    keys = re.findall(r"^\s{2}(\w+)\s*:", block, re.MULTILINE)
    return set(keys)


def extract_settext_keys(content):
    return set(re.findall(r'_setText\("[^"]+",\s*strings\.(\w+)\)', content))


class TestTranslationBatches:

    def setup_method(self):
        self.config         = read_file(CONFIG_PATH)
        self.ui             = read_file(UI_PATH)
        self.emergency_keys = extract_keys_from_block(self.config, "emergencyStrings")
        self.core_keys      = extract_keys_from_block(self.config, "coreStrings")

    def test_emergency_and_core_keys_loaded(self):
        assert len(self.emergency_keys) > 0, "emergencyStrings is empty or not found"
        assert len(self.core_keys) > 0, "coreStrings is empty or not found"

    def test_no_overlapping_keys(self):
        overlap = self.emergency_keys & self.core_keys
        assert overlap == set(), \
            f"Keys defined in both batches (translated twice): {overlap}"

    def test_default_strings_is_union_of_batches(self):
        assert "...emergencyStrings" in self.config, \
            "defaultStrings does not spread emergencyStrings"
        assert "...coreStrings" in self.config, \
            "defaultStrings does not spread coreStrings"

    def test_all_settext_keys_exist_in_config(self):
        settext_keys    = extract_settext_keys(self.ui)
        all_config_keys = self.emergency_keys | self.core_keys
        missing         = settext_keys - all_config_keys
        assert missing == set(), \
            f"Keys used in _setText() but not defined in config.js: {missing}"

    def test_emergency_keys_cover_safety_critical_strings(self):
        required = {
            "emergency999Btn", "emergencyCallTitle", "urgencyChipLabel",
            "emergency111Btn", "emergencyAETitle", "disclaimerText", "disclaimerLabel",
        }
        missing = required - self.emergency_keys
        assert missing == set(), \
            f"Safety-critical strings not in emergencyStrings: {missing}"

    def test_core_keys_cover_chatbot_strings(self):
        required = {
            "summaryTitle", "submitText", "progressQuestion",
            "skipText", "pdfDownloadBtn", "findClinicsBtnText",
        }
        missing = required - self.core_keys
        assert missing == set(), \
            f"Expected core strings not in coreStrings: {missing}"

    def test_service_strings_not_in_main_batches(self):
        svc_keys = extract_keys_from_block(self.config, "serviceStrings")
        assert len(svc_keys) > 0, "serviceStrings not found"
        overlap_emergency = svc_keys & self.emergency_keys
        overlap_core      = svc_keys & self.core_keys
        assert overlap_emergency == set(), \
            f"serviceStrings duplicated in emergencyStrings: {overlap_emergency}"
        assert overlap_core == set(), \
            f"serviceStrings duplicated in coreStrings: {overlap_core}"