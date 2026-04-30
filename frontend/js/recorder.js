function resetRecorder() {
  chunks = [];
  mediaRecorder = null;
  currentUserDraft = null;
  streamRef?.getTracks().forEach(track => track.stop());
  streamRef = null;
}

elements.startBtn.onclick = async () => {
  if (inputMode === "text") return;

  chunks = [];
  const strings = translatedStrings || defaultStrings;

  try {
    setStatus("Requesting microphone...");
    streamRef    = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(streamRef, { mimeType: "audio/webm" });
    mediaRecorder.ondataavailable = (e) => { if (e.data?.size > 0) chunks.push(e.data); };

    currentUserDraft = addMessage({ who: "user", text: strings.listening });
    mediaRecorder.start();
    setStatus(strings.recording, true);
    elements.startBtn.disabled = true;
    elements.stopBtn.disabled  = false;

  } catch (err) {
    console.error(err);
    setStatus(strings.error);
    resetRecorder();
  }
};

elements.stopBtn.onclick = async () => {
  const strings = translatedStrings || defaultStrings;
  setStatus(strings.stopping);
  elements.stopBtn.disabled = true;
  if (currentUserDraft) currentUserDraft.bubble.textContent = strings.processing;

  mediaRecorder.onstop = async () => {
    try {
      setStatus(strings.processingStatus);

      const blob = new Blob(chunks, { type: "audio/webm" });
      const json = await transcribeAudio(blob, selectedLanguage);
      const rawTranscript = (json.transcript || "").trim();

      const isEmptyAudio = !rawTranscript || /^[.\s\u2026]+$/.test(rawTranscript);

      if (isEmptyAudio) {
        if (currentUserDraft) currentUserDraft.message.style.display = "none";
        const s = window._allTranslatedStrings || defaultStrings;
        addMessage({ who: "bot", text: s.noAudioDetected || "No audio detected — please try recording again." });
        setStatus(s.ready || "Ready");
        return;
      }

      const transcript = rawTranscript;

      if (currentUserDraft) currentUserDraft.bubble.textContent = transcript;

      if (typeof getCurrentQuestion === "function" && currentSection) {
        const question = getCurrentQuestion();
        if (question) {
          recordAnswer(question.id, transcript);
        } else {
          await echoBack(transcript);
        }
      } else {
        await echoBack(transcript);
      }

      setStatus(strings.ready);

    } catch (err) {
      console.error(err);
      setStatus((translatedStrings || defaultStrings).error);
      if (currentUserDraft) currentUserDraft.bubble.textContent = (translatedStrings || defaultStrings).error;
    } finally {
      resetRecorder();
      elements.startBtn.disabled = false;
    }
  };

  mediaRecorder.stop();
};

elements.clearBtn.onclick = () => {
  if (typeof restartQuestionnaire === "function") {
    restartQuestionnaire();
  }
};

async function echoBack(transcript) {
  const echoPrefix = await getBotMessage("echo_prefix", "system");
  const echoSuffix = await getBotMessage("echo_suffix", "system");
  addMessage({ who: "bot", text: `${echoPrefix} "${transcript}"\n\n${echoSuffix}` });
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !e.repeat && elements.chatScreen.classList.contains("active")) {
    if (inputMode === "text") return;
    if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
    e.preventDefault();
    if (mediaRecorder?.state === "recording") {
      elements.stopBtn.click();
    } else if (!elements.startBtn.disabled) {
      elements.startBtn.click();
    }
  }
});