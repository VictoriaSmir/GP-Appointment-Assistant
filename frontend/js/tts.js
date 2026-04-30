async function speakText(text) {
  if (!ttsEnabled || !text || !text.trim()) return;

  if (ttsAudio) { ttsAudio.pause(); ttsAudio = null; }

  try {
    const res = await fetch(`${BACKEND_BASE}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lang: selectedLanguage }),
    });
    if (!res.ok) return;

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    ttsAudio   = new Audio(url);

    await new Promise((resolve) => {
      ttsAudio.onended = () => {
        URL.revokeObjectURL(url);
        ttsAudio = null;
        resolve();
      };
      ttsAudio.onerror = () => {
        URL.revokeObjectURL(url);
        ttsAudio = null;
        resolve();
      };
      ttsAudio.play().catch(() => {
        URL.revokeObjectURL(url);
        ttsAudio = null;
        resolve();
      });
    });

  } catch (err) {
    console.error("TTS error:", err);
  }
}

function updateTTSBtn() {
  const btn   = document.getElementById("ttsToggleBtn");
  const label = document.getElementById("ttsLabel");
  if (!btn) return;

  if (ttsEnabled) {
    btn.classList.add("tts-on");
    btn.classList.remove("tts-off");
    btn.title = "Voiceover on — click to turn off";
    if (label) label.classList.remove("tts-label-off");
  } else {
    btn.classList.add("tts-off");
    btn.classList.remove("tts-on");
    btn.title = "Voiceover off — click to turn on";
    if (label) label.classList.add("tts-label-off");
  }
}

document.getElementById("ttsToggleBtn")?.addEventListener("click", () => {
  ttsEnabled = !ttsEnabled;
  if (!ttsEnabled && ttsAudio) { ttsAudio.pause(); ttsAudio = null; }
  updateTTSBtn();
});

updateTTSBtn();