import io
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

import backend.app_state as app_state


@pytest.fixture(autouse=True)
def mock_models():
    mock_whisper = MagicMock()
    mock_result = MagicMock()
    mock_result.texts = ["I have a headache"]
    mock_whisper.generate.return_value = mock_result

    mock_translator = MagicMock()
    mock_translator.translate.return_value = "У меня болит голова"

    app_state.whisper    = mock_whisper
    app_state.translator = mock_translator
    yield
    app_state.whisper    = None
    app_state.translator = None


@pytest.fixture
def client():
    from backend.main import app
    return TestClient(app, raise_server_exceptions=False)


def _make_audio_bytes() -> bytes:
    return b"\x1a\x45\xdf\xa3" + b"\x00" * 100


class TestChatbotMessage:

    def test_returns_english_without_translation(self, client):
        resp = client.post("/chatbot_message", json={
            "message_key": "problem_description",
            "target_lang": "eng_Latn",
            "message_type": "question",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "text" in data
        assert data["text"]
        assert data["translated"] is False

    def test_translates_question_for_non_english(self, client):
        resp = client.post("/chatbot_message", json={
            "message_key": "problem_description",
            "target_lang": "rus_Cyrl",
            "message_type": "question",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["translated"] is True
        assert data["text"]
        assert data["source"]

    def test_system_message_returned(self, client):
        resp = client.post("/chatbot_message", json={
            "message_key": "greeting",
            "target_lang": "eng_Latn",
            "message_type": "system",
        })
        assert resp.status_code == 200
        assert "GP" in resp.json()["text"] or "appointment" in resp.json()["text"].lower()

    def test_unknown_key_returns_error(self, client):
        resp = client.post("/chatbot_message", json={
            "message_key": "nonexistent_key",
            "target_lang": "eng_Latn",
            "message_type": "question",
        })
        assert resp.status_code == 200
        assert "error" in resp.json()

    def test_all_question_keys_resolvable(self, client):
        from backend.constants import CHATBOT_QUESTIONS
        for key in CHATBOT_QUESTIONS:
            resp = client.post("/chatbot_message", json={
                "message_key": key,
                "target_lang": "eng_Latn",
                "message_type": "question",
            })
            assert resp.status_code == 200, f"Failed for key: {key}"
            assert resp.json().get("text"), f"Empty text for key: {key}"

    def test_all_system_keys_resolvable(self, client):
        from backend.constants import CHATBOT_SYSTEM_MESSAGES
        INTENTIONALLY_EMPTY = {"submitted"}
        for key in CHATBOT_SYSTEM_MESSAGES:
            if key in INTENTIONALLY_EMPTY:
                continue
            resp = client.post("/chatbot_message", json={
                "message_key": key,
                "target_lang": "eng_Latn",
                "message_type": "system",
            })
            assert resp.status_code == 200, f"Failed for key: {key}"
            assert resp.json().get("text"), f"Empty text for key: {key}"


class TestTranslateUI:

    def test_english_returns_unchanged(self, client):
        strings = {"bannerTitle": "GP Appointment Assistant", "submitText": "Submit"}
        resp = client.post("/translate_ui", json={
            "strings": strings,
            "target_lang": "eng_Latn",
        })
        assert resp.status_code == 200
        assert resp.json() == strings

    def test_non_english_translates_all_keys(self, client):
        strings = {"bannerTitle": "GP Appointment Assistant", "submitText": "Submit"}
        resp = client.post("/translate_ui", json={
            "strings": strings,
            "target_lang": "rus_Cyrl",
        })
        assert resp.status_code == 200
        assert set(resp.json().keys()) == set(strings.keys())

    def test_empty_strings_pass_through(self, client):
        strings = {"emptyKey": "", "normalKey": "Hello"}
        resp = client.post("/translate_ui", json={
            "strings": strings,
            "target_lang": "fra_Latn",
        })
        assert resp.status_code == 200
        assert resp.json()["emptyKey"] == ""

    def test_large_batch_accepted(self, client):
        strings = {f"key_{i}": f"String number {i}" for i in range(50)}
        resp = client.post("/translate_ui", json={
            "strings": strings,
            "target_lang": "deu_Latn",
        })
        assert resp.status_code == 200
        assert len(resp.json()) == 50


class TestSubmitForm:

    def test_english_answers_not_translated(self, client):
        answers = {
            "problem_description": "I have a bad headache",
            "duration": "Three days",
        }
        resp = client.post("/submit_form", json={
            "answers": answers,
            "source_lang": "eng_Latn",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["answers_english"] == answers

    def test_non_english_answers_get_translated(self, client):
        answers = {"problem_description": "У меня болит голова"}
        resp = client.post("/submit_form", json={
            "answers": answers,
            "source_lang": "rus_Cyrl",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "answers_english" in data
        assert "answers_original" in data
        assert data["answers_original"] == answers
        assert data["patient_language"] == "rus_Cyrl"

    def test_response_includes_question_labels(self, client):
        answers = {"problem_description": "headache", "duration": "2 days"}
        resp = client.post("/submit_form", json={
            "answers": answers,
            "source_lang": "eng_Latn",
        })
        data = resp.json()
        assert "question_labels" in data
        assert "problem_description" in data["question_labels"]

    def test_empty_answer_handled_gracefully(self, client):
        answers = {"problem_description": "I feel unwell", "contact_times": ""}
        resp = client.post("/submit_form", json={
            "answers": answers,
            "source_lang": "eng_Latn",
        })
        assert resp.status_code == 200
        assert resp.json()["success"] is True

    def test_service_type_key_preserved(self, client):
        answers = {
            "problem_description": "chest pain",
            "service_type": "general_appointment",
        }
        resp = client.post("/submit_form", json={
            "answers": answers,
            "source_lang": "eng_Latn",
        })
        assert resp.status_code == 200
        assert "service_type" in resp.json()["answers_english"]


class TestDetectLanguage:

    @patch("backend.routers.detection.webm_bytes_to_16k_float_list", return_value=([0.01] * 16000, 16000))
    def test_valid_audio_returns_language(self, mock_ffmpeg, client):
        resp = client.post(
            "/detect_language",
            files={"audio": ("speech.webm", io.BytesIO(_make_audio_bytes()), "audio/webm")},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "nllb_code" in data
        assert "detected_language" in data

    @patch("backend.routers.detection.webm_bytes_to_16k_float_list", return_value=([0.01] * 16000, 16000))
    def test_detected_language_is_valid_nllb(self, mock_ffmpeg, client):
        from backend.constants import NLLB_TO_WHISPER
        resp = client.post(
            "/detect_language",
            files={"audio": ("speech.webm", io.BytesIO(_make_audio_bytes()), "audio/webm")},
        )
        data = resp.json()
        assert data["nllb_code"] in NLLB_TO_WHISPER or data["nllb_code"] == "eng_Latn"

    def test_missing_audio_returns_422(self, client):
        resp = client.post("/detect_language")
        assert resp.status_code == 422


class TestTranscribe:

    @patch("backend.routers.transcription.webm_bytes_to_16k_float_list", return_value=([0.01] * 16000, 16000))
    def test_valid_audio_returns_transcript(self, mock_ffmpeg, client):
        resp = client.post(
            "/transcribe",
            files={"audio": ("speech.webm", io.BytesIO(_make_audio_bytes()), "audio/webm")},
            data={"src_lang": "eng_Latn"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "transcript" in data
        assert isinstance(data["transcript"], str)

    def test_missing_audio_returns_422(self, client):
        resp = client.post("/transcribe", data={"src_lang": "eng_Latn"})
        assert resp.status_code == 422

    @patch("backend.routers.transcription.webm_bytes_to_16k_float_list", return_value=([0.01] * 16000, 16000))
    def test_unsupported_lang_falls_back(self, mock_ffmpeg, client):
        resp = client.post(
            "/transcribe",
            files={"audio": ("speech.webm", io.BytesIO(_make_audio_bytes()), "audio/webm")},
            data={"src_lang": "xyz_Unkn"},
        )
        assert resp.status_code == 200


class TestTTS:

    @patch("edge_tts.Communicate")
    def test_tts_returns_audio_bytes(self, mock_communicate, client):
        async def fake_stream():
            yield {"type": "audio", "data": b"\xff\xfb\x90\x00" * 100}
            yield {"type": "WordBoundary", "data": {}}

        mock_instance = MagicMock()
        mock_instance.stream.return_value = fake_stream()
        mock_communicate.return_value = mock_instance

        resp = client.post("/tts", json={
            "text": "Hello, how can I help you?",
            "lang": "eng_Latn"
        })
        assert resp.status_code == 200
        assert resp.headers["content-type"].startswith("audio/")

    @patch("edge_tts.Communicate")
    def test_tts_uses_correct_voice_for_language(self, mock_communicate, client):
        async def fake_stream():
            yield {"type": "audio", "data": b"\x00" * 100}

        mock_instance = MagicMock()
        mock_instance.stream.return_value = fake_stream()
        mock_communicate.return_value = mock_instance

        client.post("/tts", json={"text": "Bonjour", "lang": "fra_Latn"})
        call_args = mock_communicate.call_args
        assert call_args is not None
        voice_used = call_args[0][1] if len(call_args[0]) > 1 else call_args[1].get("voice", "")
        assert "fr-FR" in voice_used

    def test_tts_empty_text_returns_error(self, client):
        resp = client.post("/tts", json={"text": "", "lang": "eng_Latn"})
        assert resp.status_code == 200
        assert "error" in resp.json()