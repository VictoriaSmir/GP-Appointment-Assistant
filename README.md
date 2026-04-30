# GP Appointment Assistant

A multilingual, offline-capable desktop application that helps non-English-speaking patients complete a GP appointment request in their native language. Patient answers are automatically translated into English and delivered to clinical staff as a structured bilingual PDF summary.

**Supports 20 languages** — English, Spanish, French, German, Portuguese, Polish, Russian, Ukrainian, Arabic, Hindi, Bengali, Chinese (Simplified), Italian, Japanese, Korean, Dutch, Turkish, Vietnamese, Thai, Romanian.

---

## Downloading the AI Models

The quantised model files are not committed to this repository because they exceed GitHub's file size limits. They are required to run the application either from the packaged executable or from source.

**Option 1 — Pre-built models (recommended).** Download the `models/` folder from the project Google Drive bundle:

> _[Insert Google Drive link here once available]_

The folder contains both `whisper_ov_quantised/` and `nllb_ov_quantised/` ready to use. Place the entire folder in the project root (alongside `app_entry.py`) for source builds, or alongside the executable for packaged builds.

**Option 2 — Build the models yourself.** If the Google Drive link is unavailable, the models can be regenerated from their original HuggingFace sources:

1. Download the unquantised models from HuggingFace:
   - Whisper Medium: https://huggingface.co/openai/whisper-medium
   - NLLB-200 600M distilled: https://huggingface.co/facebook/nllb-200-distilled-600M

2. Convert them to OpenVINO IR format using `optimum-cli` (see HuggingFace Optimum documentation).

3. Place the converted models in `whisper_ov/` and `nllb_ov/` folders at the project root.

4. Run the quantisation script:

   ```bash
   python quantise_models.py --model both
   ```

   This will produce `whisper_ov_quantised/` and `nllb_ov_quantised/` folders in the project root.

---

## Running the Packaged .exe (End Users)

### What You Need
- Windows 10 (updated) or Windows 11
- Microsoft Edge WebView2 Runtime (built into Windows 11 and most updated Windows 10 machines — if missing, download from https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
- Internet connection for text-to-speech (Edge TTS) and the clinic/A&E finder map
- The full `GP-Appointment-Assistant` folder (do not move individual files out of it)

### What Is Included in the Distribution Folder
```
GP-Appointment-Assistant/
├── GP-Appointment-Assistant.exe   ← Main application
├── ffmpeg.exe                     ← Required for voice recording
├── Unblock.bat                    ← Run once after extracting (see below)
├── models/
│   ├── whisper_ov_quantised/      ← Speech recognition model
│   └── nllb_ov_quantised/         ← Translation model
└── _internal/                     ← Python runtime (do not modify)
```

### How to Run

**Step 1 — Unblock the files (important, do this first).**

When Windows downloads a zip from the internet, it marks every file inside as untrusted. This can prevent some of the app's internal components from loading, causing the app window to fail to open.

You have two options:

- **Recommended:** Right-click the downloaded `.zip` file → **Properties** → tick **Unblock** at the bottom → **OK**. Then extract the zip.
- **Alternative:** Extract the zip first, then double-click `Unblock.bat` inside the extracted folder. Click "Yes" or "Run" if Windows asks.

**Step 2 — Launch the app.**

1. Open the extracted `GP-Appointment-Assistant` folder
2. Double-click `GP-Appointment-Assistant.exe`
3. Select your microphone from the dialog and click Continue
4. Wait for the loading screen — models take ~60 seconds on first launch
5. The application window will open automatically once ready

### Troubleshooting

- **Window never opens / flashes and disappears** — the Unblock step was skipped. Close the app, run `Unblock.bat`, and try again.
- **Takes 3 minutes to load then errors** — a previous instance may still be running. Open Task Manager (`Ctrl + Shift + Esc`) → Details tab → end any `GP-Appointment-Assistant.exe` processes → relaunch.
- **Black screen or WebView2 error** — install WebView2 from https://developer.microsoft.com/en-us/microsoft-edge/webview2/
- **Voice recording not working** — check that the correct microphone is selected in the startup dialog. Ensure microphone permissions are granted in Windows Settings → Privacy → Microphone.

---

## Running from Source (Developers)

### Requirements
- Python 3.11+
- Intel CPU (OpenVINO optimised — runs on CPU, no GPU required)
- ~4 GB RAM minimum (models occupy ~1.2 GB after INT8 quantisation)
- ffmpeg installed and on your system PATH
- Internet connection for Edge TTS and clinic finder map

### AI Model Files

See the **Downloading the AI Models** section above. The model folders must be placed in the project root before running:

```
gp-voice-web-local/
├── models/
│   ├── whisper_ov_quantised/     ← Whisper Medium INT8 (OpenVINO format)
│   └── nllb_ov_quantised/        ← NLLB-200 600M INT8 (OpenVINO format)
```

### Installation

```bash
# 1. Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Mac/Linux

# 2. Install dependencies
pip install -r backend/requirements.txt
```

### Running from Source

```bash
# Start the backend
uvicorn backend.main:app --host 0.0.0.0 --port 8765 --reload
```

The first startup takes a few seconds while AI models load.

Then open a second terminal:

```bash
cd frontend
python -m http.server 3000
```

Open your browser at `http://localhost:3000`.

> **Note:** The frontend must be served over HTTP — opening `index.html` directly as `file://` will not work.

### Running Tests

```bash
python -m pytest tests/ -v
```

Expected: ~204 passed, ~14 skipped, 0 failed. All AI models are mocked — no model files required for tests.

### Building the .exe

The build bundles pythonnet and clr_loader so the embedded browser window works on machines without a matching .NET Framework installation. Ensure all font files are in the project root, then run:

```bash
pyinstaller --noconfirm app.spec
xcopy /E /I models dist\GP-Appointment-Assistant\models
copy "C:\path\to\ffmpeg.exe" dist\GP-Appointment-Assistant\
copy Unblock.bat dist\GP-Appointment-Assistant\
```

> Replace `C:\path\to\ffmpeg.exe` with the actual path to your ffmpeg binary. To find it, run `where ffmpeg` in your terminal. ffmpeg can be installed via `winget install Gyan.FFmpeg` or downloaded from https://ffmpeg.org/download.html

Then zip the entire `dist\GP-Appointment-Assistant` folder and distribute. Include the Unblock instructions when sharing the zip — see the end-user section above.

### Debug vs Distribution Builds

The project ships configured for **distribution** — no console window, no developer tools. Three settings control this:

- `console=False` in `app.spec` hides the terminal that would otherwise show the server logs and print statements.
- `debug=False` in the two `webview.start()` calls in `app_entry.py` stops the Edge DevTools panel from opening alongside the app window.
- `creationflags=_NO_WINDOW` on subprocess calls (ffmpeg in `backend/audio_utils.py`, netstat/taskkill in `app_entry.py`) prevents a cmd window from flashing on screen every time a subprocess runs — most noticeably during audio processing.

For debugging a failed build, temporarily flip `console` and `debug` back to `True` and set `_NO_WINDOW_FLAG = 0` / `_NO_WINDOW = 0`. You will then see all stdout/stderr in a terminal and be able to right-click inside the app window to open Chrome DevTools.

---

## Project Structure

```
gp-voice-web-local/
├── backend/
│   ├── routers/
│   │   ├── detection.py       # /detect_language endpoint
│   │   ├── transcription.py   # /transcribe endpoint
│   │   ├── translation.py     # /translate_ui endpoint
│   │   ├── form.py            # /submit_form endpoint
│   │   ├── tts.py             # /tts endpoint
│   │   ├── pdf.py             # /generate_pdf and /save_pdf endpoints
│   │   └── clinics.py         # /find_clinics and /geocode_postcode endpoints
│   ├── app_state.py           # Shared model instances
│   ├── audio_utils.py         # ffmpeg audio conversion
│   ├── constants.py           # Language mappings, model paths, chatbot content
│   ├── helpers.py             # Audio validation, translation wrapper
│   ├── main.py                # FastAPI app entry point
│   ├── schemas.py             # Pydantic request/response models
│   ├── translate_utils.py     # NLLB translator loading and inference
│   └── requirements.txt
├── frontend/
│   ├── css/
│   │   ├── components/        # dropdown.css, messages.css, questionnaire.css
│   │   ├── screens/           # chat.css, emergency.css, voice-detection.css
│   │   └── base.css
│   ├── js/
│   │   ├── screens/           # One JS file per screen
│   │   ├── api.js             # Backend fetch calls and translation caching
│   │   ├── config.js          # Language list, UI strings, translation batches
│   │   ├── questionnaire.js   # Chatbot flow, question sets per service type
│   │   ├── recommendations.js # NHS keyword matching engine
│   │   ├── clinic-finder.js   # Overpass/OSM clinic finder, Leaflet map
│   │   ├── tts.js             # Edge TTS audio playback
│   │   ├── ui.js              # DOM helpers, screen transitions
│   │   ├── state.js           # Shared application state
│   │   ├── recorder.js        # MediaRecorder audio capture
│   │   └── main.js            # App entry point, event wiring
│   └── index.html
├── models/                    # AI model files (not in repo — see download section above)
├── tests/                     # Automated test suite (pytest)
├── app_entry.py               # PyInstaller entry point
├── app.spec                   # PyInstaller build config
├── Unblock.bat                # End-user script to clear Windows MOTW flag
├── quantise_models.py         # INT8 quantisation script (NNCF)
├── measure_baseline.py        # Pre-quantisation baseline measurement
├── hook_inspect_fix.py        # PyInstaller runtime hook
├── pytest.ini
└── README.md
```

---

## Configuration

Key settings are in `backend/constants.py`:

| Setting | Default | Description |
|---|---|---|
| `WHISPER_MODEL_DIR` | `models/whisper_ov_quantised` | Path to Whisper model folder |
| `NLLB_MODEL_DIR` | `models/nllb_ov_quantised` | Path to NLLB model folder |
| `DEVICE` | `CPU` | OpenVINO device (`CPU`, `GPU`, `NPU`) |

The frontend backend URL is set in `frontend/js/config.js`:

```javascript
const BACKEND_BASE = "http://127.0.0.1:8765";
```