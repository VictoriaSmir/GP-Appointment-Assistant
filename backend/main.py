from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
from fastapi.staticfiles import StaticFiles

import openvino_genai as ov_genai
import backend.app_state as app_state
from backend.constants import WHISPER_MODEL_DIR, NLLB_MODEL_DIR, DEVICE
from backend.translate_utils import load_nllb_translator

from backend.routers import detection, transcription, tts, translation, form, pdf, clinics

app = FastAPI(title="GP Voice Assistant Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("=" * 60)
print("LOADING MODELS...")
print("=" * 60)

app_state.whisper    = ov_genai.WhisperPipeline(WHISPER_MODEL_DIR, DEVICE)
print("Whisper loaded")

app_state.translator = load_nllb_translator(NLLB_MODEL_DIR, DEVICE)
print("Translator loaded")
print("=" * 60)

app.include_router(detection.router)
app.include_router(transcription.router)
app.include_router(tts.router)
app.include_router(translation.router)
app.include_router(form.router)
app.include_router(pdf.router)
app.include_router(clinics.router)

@app.get("/")
async def root():
    return {"status": "ok", "message": "GP Voice Assistant Backend"}

_frontend = os.path.join(
    getattr(sys, "_MEIPASS", os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "frontend"
)
if os.path.exists(_frontend):
    app.mount("/app", StaticFiles(directory=_frontend, html=True), name="static")