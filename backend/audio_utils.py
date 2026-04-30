from __future__ import annotations

import subprocess
import tempfile
import sys
import os
from pathlib import Path

import numpy as np
import soundfile as sf

# Windows flag to prevent a console window from flashing on screen each time
# a subprocess (ffmpeg, taskkill, etc.) is launched from a windowed build.
# When the main exe is built with console=False in app.spec, Windows would
# otherwise briefly show a black cmd window every time ffmpeg runs to process
# a user's audio recording. Setting creationflags=CREATE_NO_WINDOW hides it.
#
# To re-enable the console windows (useful when debugging ffmpeg errors),
# either set _NO_WINDOW_FLAG = 0 below, or build with console=True in app.spec
# so you can see all output in the main terminal.
_NO_WINDOW_FLAG = 0x08000000 if sys.platform == "win32" else 0


def get_ffmpeg():
    import shutil
    if getattr(sys, 'frozen', False):
        beside = os.path.join(os.path.dirname(sys.executable), 'ffmpeg.exe')
        if os.path.exists(beside):
            return beside
    found = shutil.which('ffmpeg')
    if found:
        return found
    raise RuntimeError("ffmpeg not found")


def webm_bytes_to_16k_float_list(webm_bytes: bytes) -> tuple[list[float], int]:
    with tempfile.TemporaryDirectory() as td:
        td_path = Path(td)
        in_path = td_path / "in.webm"
        out_path = td_path / "out.wav"

        in_path.write_bytes(webm_bytes)

        cmd = [get_ffmpeg(), "-y", "-i", str(in_path), "-ac", "1", "-ar", "16000", str(out_path)]
        proc = subprocess.run(cmd, capture_output=True, text=True, creationflags=_NO_WINDOW_FLAG)
        if proc.returncode != 0:
            raise RuntimeError(f"ffmpeg failed:\n{proc.stderr}")

        audio, sr = sf.read(str(out_path), dtype="float32")
        audio = np.asarray(audio, dtype=np.float32).reshape(-1)
        audio = np.clip(audio, -1.0, 1.0)

        return audio.tolist(), sr