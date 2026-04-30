import os
import sys
import pytest


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "backend"))

from fastapi.testclient import TestClient
from fastapi import FastAPI
from routers.pdf import router

app = FastAPI()
app.include_router(router)
client = TestClient(app)

VALID_PAYLOAD = {
    "answers_original": {
        "problem_description": "Ich habe Kopfschmerzen",
        "duration": "Seit drei Tagen",
    },
    "answers_english": {
        "problem_description": "I have a headache",
        "duration": "For three days",
    },
    "question_labels": {
        "problem_description": "Can you describe your health problem?",
        "duration": "How long has it been going on?",
    },
    "patient_language": "deu_Latn",
    "service_title": "General appointment",
}


class TestPDFGeneration:

    def test_returns_200(self):
        response = client.post("/generate_pdf", json=VALID_PAYLOAD)
        assert response.status_code == 200

    def test_content_type_is_pdf(self):
        response = client.post("/generate_pdf", json=VALID_PAYLOAD)
        assert response.headers["content-type"] == "application/pdf"

    def test_content_disposition_header_present(self):
        response = client.post("/generate_pdf", json=VALID_PAYLOAD)
        assert "filename=" in response.headers.get("content-disposition", "")

    def test_filename_contains_gp_appointment(self):
        response = client.post("/generate_pdf", json=VALID_PAYLOAD)
        assert "gp_appointment" in response.headers.get("content-disposition", "")

    def test_response_body_is_valid_pdf(self):
        response = client.post("/generate_pdf", json=VALID_PAYLOAD)
        assert response.content[:4] == b"%PDF"

    def test_empty_answers_does_not_crash(self):
        payload = {
            "answers_original": {}, "answers_english": {},
            "question_labels": {}, "patient_language": "eng_Latn",
            "service_title": "General appointment",
        }
        response = client.post("/generate_pdf", json=payload)
        assert response.status_code == 200
        assert response.content[:4] == b"%PDF"

    def test_missing_service_title_uses_default(self):
        payload = {
            "answers_original": {"problem_description": "Pain"},
            "answers_english":  {"problem_description": "Pain"},
            "question_labels":  {"problem_description": "What is wrong?"},
            "patient_language": "eng_Latn",
        }
        response = client.post("/generate_pdf", json=payload)
        assert response.status_code == 200

    def test_skips_internal_keys(self):
        payload = {**VALID_PAYLOAD,
            "answers_english": {
                "_service_title": "General appointment",
                "service_type": "general_appointment",
                "problem_description": "Headache",
            }
        }
        payload["answers_original"] = payload["answers_english"]
        response = client.post("/generate_pdf", json=payload)
        assert response.status_code == 200

    def test_all_seven_service_types_produce_pdf(self):
        for svc in ["General appointment", "Repeat prescription", "Fit (sick) note",
                    "Routine care appointment", "Test results",
                    "Referral follow-up", "Doctor's letter"]:
            response = client.post("/generate_pdf", json={**VALID_PAYLOAD, "service_title": svc})
            assert response.status_code == 200, f"Failed for: {svc}"
            assert response.content[:4] == b"%PDF", f"Not a PDF for: {svc}"

    def test_arabic_answers_do_not_crash(self):
        payload = {
            "answers_original": {"problem_description": "لدي صداع شديد"},
            "answers_english":  {"problem_description": "I have a severe headache"},
            "question_labels":  {"problem_description": "Describe your problem"},
            "patient_language": "ara_Arab",
            "service_title": "General appointment",
        }
        response = client.post("/generate_pdf", json=payload)
        assert response.status_code == 200
        assert response.content[:4] == b"%PDF"