import re
import os
import pytest

ROOT               = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_JS        = os.path.join(ROOT, "frontend", "js")
QUESTIONNAIRE_PATH = os.path.join(FRONTEND_JS, "questionnaire.js")


def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


INITIAL_QUESTIONS = [
    "problem_description", "duration", "tried_anything",
    "worried_about", "how_to_help", "contact_times",
]

FOLLOW_UP_QUESTIONS = {
    "repeat_prescription": ["medication_name", "additional_info"],
    "fit_note":            ["previous_note", "illness_description", "note_start_date", "note_end_date", "employer_help"],
    "routine_care":        ["care_type"],
    "test_results":        ["test_type", "test_date"],
    "referral_followup":   ["referral_details"],
    "doctors_letter":      ["letter_purpose", "letter_deadline"],
    "general_appointment": [],
}

SERVICE_SELECTION_COUNT = 1


def get_total_questions(service_id):
    return len(INITIAL_QUESTIONS) + SERVICE_SELECTION_COUNT + len(FOLLOW_UP_QUESTIONS.get(service_id, []))


class TestQuestionnaireLogic:

    def setup_method(self):
        self.js = read_file(QUESTIONNAIRE_PATH)

    def test_questionnaire_js_exists(self):
        assert len(self.js) > 0

    def test_all_service_types_defined(self):
        for svc in FOLLOW_UP_QUESTIONS:
            assert svc in self.js, f"Service type '{svc}' not found in questionnaire.js"

    def test_total_questions_general_appointment(self):
        assert get_total_questions("general_appointment") == 7

    def test_total_questions_fit_note(self):
        assert get_total_questions("fit_note") == 12

    def test_total_questions_repeat_prescription(self):
        assert get_total_questions("repeat_prescription") == 9

    def test_total_questions_routine_care(self):
        assert get_total_questions("routine_care") == 8

    def test_total_questions_test_results(self):
        assert get_total_questions("test_results") == 9

    def test_total_questions_referral_followup(self):
        assert get_total_questions("referral_followup") == 8

    def test_total_questions_doctors_letter(self):
        assert get_total_questions("doctors_letter") == 9

    def test_no_duplicate_question_ids(self):
        all_ids = list(INITIAL_QUESTIONS)
        for ids in FOLLOW_UP_QUESTIONS.values():
            all_ids.extend(ids)
        assert len(all_ids) == len(set(all_ids)), "Duplicate question IDs found"

    def test_all_question_ids_non_empty(self):
        all_ids = list(INITIAL_QUESTIONS)
        for ids in FOLLOW_UP_QUESTIONS.values():
            all_ids.extend(ids)
        for qid in all_ids:
            assert qid.strip() != "", "Empty question ID found"

    def test_initial_questions_present_in_js(self):
        for qid in INITIAL_QUESTIONS:
            assert qid in self.js, f"Question '{qid}' not found in questionnaire.js"

    def test_followup_questions_present_in_js(self):
        for svc, questions in FOLLOW_UP_QUESTIONS.items():
            for qid in questions:
                assert qid in self.js, \
                    f"Follow-up '{qid}' for '{svc}' not found in questionnaire.js"

    def test_unknown_service_returns_initial_plus_one(self):
        assert get_total_questions("unknown_service") == len(INITIAL_QUESTIONS) + SERVICE_SELECTION_COUNT