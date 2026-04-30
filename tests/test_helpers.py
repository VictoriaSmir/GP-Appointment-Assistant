import numpy as np
import pytest
from unittest.mock import MagicMock, patch

from backend.helpers import validate_audio, clean_whisper_output, translate_text

class TestValidateAudio:

    def test_empty_samples_rejected(self):
        ok, msg, diag = validate_audio([])
        assert not ok
        assert "No audio" in msg
        assert diag["num_samples"] == 0

    def test_too_short_rejected(self):
        samples = [0.5] * 1600
        ok, msg, diag = validate_audio(samples)
        assert not ok
        assert "too short" in msg
        assert diag["duration_seconds"] == pytest.approx(0.1, abs=0.01)

    def test_silent_audio_rejected(self):
        samples = [0.0] * 16000
        ok, msg, diag = validate_audio(samples)
        assert not ok
        assert "No audio signal" in msg
        assert not diag["has_audio"]

    def test_valid_audio_passes(self):
        t = np.linspace(0, 1, 16000, endpoint=False)
        samples = (0.5 * np.sin(2 * np.pi * 440 * t)).tolist()
        ok, msg, diag = validate_audio(samples)
        assert ok
        assert msg == ""
        assert diag["has_audio"]
        assert diag["duration_seconds"] == pytest.approx(1.0, abs=0.01)

    def test_amplitude_near_zero_rejected(self):
        samples = [0.0005] * 16000
        ok, msg, diag = validate_audio(samples)
        assert not ok
        assert not diag["has_audio"]

    def test_diagnostics_keys_always_present(self):
        _, _, diag = validate_audio([])
        assert set(diag.keys()) == {"num_samples", "duration_seconds", "max_amplitude", "has_audio"}


class TestCleanWhisperOutput:

    def test_empty_string_returns_empty(self):
        assert clean_whisper_output("") == ""

    def test_none_returns_empty(self):
        assert clean_whisper_output(None) == ""

    def test_normal_text_unchanged(self):
        assert clean_whisper_output("Hello, I have a headache.") == "Hello, I have a headache."

    def test_strips_hallucination_token(self):
        result = clean_whisper_output("<|en|>У меня болит голова.")
        assert "<|" not in result
        assert "|>" not in result

    def test_strips_trailing_whitespace(self):
        assert clean_whisper_output("  hello  ") == "hello"

    def test_removes_content_after_token(self):
        result = clean_whisper_output("I have a headache.<|endoftext|>")
        assert result == "I have a headache."

class TestTranslateText:

    def test_same_language_returns_original(self):
        result = translate_text("Hello", "eng_Latn", "eng_Latn")
        assert result == "Hello"

    def test_empty_string_returns_empty(self):
        result = translate_text("", "eng_Latn", "rus_Cyrl")
        assert result == ""

    def test_whitespace_only_returns_original(self):
        result = translate_text("   ", "eng_Latn", "rus_Cyrl")
        assert result == "   "

    def test_successful_translation(self):
        import backend.app_state as app_state
        mock_translator = MagicMock()
        mock_translator.translate.return_value = "Привет"
        app_state.translator = mock_translator

        result = translate_text("Hello", "eng_Latn", "rus_Cyrl")
        assert result == "Привет"
        mock_translator.translate.assert_called_once_with(
            "Hello", src_lang="eng_Latn", tgt_lang="rus_Cyrl"
        )

    def test_translation_failure_returns_original(self):
        import backend.app_state as app_state
        mock_translator = MagicMock()
        mock_translator.translate.side_effect = RuntimeError("model error")
        app_state.translator = mock_translator

        result = translate_text("Hello", "eng_Latn", "rus_Cyrl")
        assert result == "Hello"