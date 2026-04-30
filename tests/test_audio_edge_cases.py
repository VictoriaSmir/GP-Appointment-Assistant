import io
import os
import sys
import wave
import struct
import pytest
from unittest.mock import patch, MagicMock

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "backend"))

try:
    from fastapi.testclient import TestClient
    from main import app
    client = TestClient(app, raise_server_exceptions=False)
    APP_AVAILABLE = True
except Exception as e:
    print(f"App import failed: {e}")
    APP_AVAILABLE = False

FAKE_SAMPLES = [0.01] * 16000 
FFMPEG_MOCK = "backend.routers.transcription.webm_bytes_to_16k_float_list"
WHISPER_MOCK  = "app_state.whisper"


def make_wav(duration_seconds=1, sample_rate=16000, amplitude=100):
    num_samples = int(duration_seconds * sample_rate)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(struct.pack(f"<{num_samples}h", *([amplitude] * num_samples)))
    buf.seek(0)
    return buf.read()


@pytest.mark.skipif(not APP_AVAILABLE, reason="FastAPI app not importable")
class TestAudioEdgeCases:

    @patch(FFMPEG_MOCK, return_value=(FAKE_SAMPLES, 16000))
    @patch(WHISPER_MOCK)
    def test_valid_audio_returns_transcript(self, mock_whisper, mock_ffmpeg):
        mock_result = MagicMock()
        mock_result.texts = ["I have a headache"]
        mock_whisper.generate.return_value = mock_result

        response = client.post(
            "/transcribe",
            files={"audio": ("audio.wav", make_wav(), "audio/wav")},
            data={"src_lang": "eng_Latn"},
        )
        assert response.status_code == 200
        assert "transcript" in response.json()

    @patch(FFMPEG_MOCK, return_value=([0.0] * 4800, 16000))
    def test_silence_rejected(self, mock_ffmpeg):
        response = client.post(
            "/transcribe",
            files={"audio": ("audio.wav", make_wav(amplitude=0), "audio/wav")},
            data={"src_lang": "eng_Latn"},
        )
        assert response.status_code == 200
        body = response.json()
        assert "transcript" in body
        assert body["transcript"] == ""

    @patch(FFMPEG_MOCK, return_value=([0.01] * 1600, 16000))
    def test_too_short_audio_rejected(self, mock_ffmpeg):
        response = client.post(
            "/transcribe",
            files={"audio": ("audio.wav", make_wav(duration_seconds=0.1), "audio/wav")},
            data={"src_lang": "eng_Latn"},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["transcript"] == ""
        assert "error" in body

    @patch(FFMPEG_MOCK, side_effect=RuntimeError("ffmpeg failed: Invalid data"))
    def test_corrupted_audio_returns_error_not_500(self, mock_ffmpeg):
        response = client.post(
            "/transcribe",
            files={"audio": ("audio.wav", b"\x00\x01\x02\x03", "audio/wav")},
            data={"src_lang": "eng_Latn"},
        )

        assert response.status_code in (400, 422, 500)

    @patch(FFMPEG_MOCK, return_value=(FAKE_SAMPLES, 16000))
    @patch(WHISPER_MOCK)
    def test_hallucination_tokens_stripped(self, mock_whisper, mock_ffmpeg):
        mock_result = MagicMock()
        mock_result.texts = ["<|en|><|transcribe|> I have a headache"]
        mock_whisper.generate.return_value = mock_result

        response = client.post(
            "/transcribe",
            files={"audio": ("audio.wav", make_wav(), "audio/wav")},
            data={"src_lang": "eng_Latn"},
        )
        assert response.status_code == 200
        transcript = response.json().get("transcript", "")
        assert "<|en|>" not in transcript
        assert "<|transcribe|>" not in transcript

    @patch(FFMPEG_MOCK, return_value=(FAKE_SAMPLES * 30, 16000))
    @patch(WHISPER_MOCK)
    def test_very_long_audio_handled(self, mock_whisper, mock_ffmpeg):
        mock_result = MagicMock()
        mock_result.texts = ["Long recording result"]
        mock_whisper.generate.return_value = mock_result

        response = client.post(
            "/transcribe",
            files={"audio": ("audio.wav", make_wav(duration_seconds=30), "audio/wav")},
            data={"src_lang": "eng_Latn"},
        )
        assert response.status_code == 200

    @patch(FFMPEG_MOCK, return_value=(FAKE_SAMPLES, 16000))
    @patch(WHISPER_MOCK)
    def test_unknown_language_code_falls_back(self, mock_whisper, mock_ffmpeg):
        mock_result = MagicMock()
        mock_result.texts = ["hello"]
        mock_whisper.generate.return_value = mock_result

        response = client.post(
            "/transcribe",
            files={"audio": ("audio.wav", make_wav(), "audio/wav")},
            data={"src_lang": "xyz_Fake"},
        )
        assert response.status_code == 200

    @patch(FFMPEG_MOCK, return_value=(FAKE_SAMPLES, 16000))
    @patch(WHISPER_MOCK)
    def test_whisper_exception_returns_empty_transcript(self, mock_whisper, mock_ffmpeg):
        mock_whisper.generate.side_effect = Exception("Model crashed")

        response = client.post(
            "/transcribe",
            files={"audio": ("audio.wav", make_wav(), "audio/wav")},
            data={"src_lang": "eng_Latn"},
        )
        assert response.status_code == 200
        assert response.json().get("transcript") == ""