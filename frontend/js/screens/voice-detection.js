elements.voiceDetectBtn.onclick = async () => {
  chunks = [];
  elements.voiceDetectBtn.disabled = true;
  elements.voiceDetectBtn.classList.add("recording");
  elements.micInstruction.textContent = "Listening... Say a full sentence in your language";

  try {
    streamRef     = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(streamRef, { mimeType: "audio/webm" });
    mediaRecorder.ondataavailable = (e) => { if (e.data?.size > 0) chunks.push(e.data); };
    mediaRecorder.start();

    setTimeout(async () => {
      if (mediaRecorder?.state === "recording") {
        mediaRecorder.stop();
        elements.voiceDetectBtn.classList.remove("recording");
        elements.micInstruction.textContent = "Processing...";
        elements.voiceLoadingIndicator.classList.add("active");

        mediaRecorder.onstop = async () => {
          try {
            const blob = new Blob(chunks, { type: "audio/webm" });
            const json = await detectLanguageFromAudio(blob);

            const nllbCode  = json.nllb_code || "eng_Latn";
            detectedLanguage = getLangByCode(nllbCode);
            selectedLanguage = detectedLanguage.code;

            const flagEl = document.getElementById("detectedLanguageFlag");
            if (flagEl) flagEl.textContent = languageFlags[detectedLanguage.code] || "";
            elements.detectedLanguageName.textContent   = detectedLanguage.native;
            elements.detectedLanguageNative.textContent = detectedLanguage.native !== detectedLanguage.name
              ? detectedLanguage.name : "";
            showScreen(elements.confirmationScreen);

          } catch (err) {
            console.error("Detection error:", err);
            alert("Could not detect language. Please try again or choose manually.");
            resetVoiceDetection();
          } finally {
            elements.voiceLoadingIndicator.classList.remove("active");
            streamRef?.getTracks().forEach(t => t.stop());
            streamRef = null;
          }
        };
      }
    }, 7000);

  } catch (err) {
    console.error(err);
    alert("Microphone permission denied.");
    resetVoiceDetection();
  }
};

function resetVoiceDetection() {
  elements.voiceDetectBtn.disabled = false;
  elements.voiceDetectBtn.classList.remove("recording");
  elements.micInstruction.textContent = "Tap to speak";
  elements.voiceLoadingIndicator.classList.remove("active");
  chunks = [];
  streamRef?.getTracks().forEach(t => t.stop());
  streamRef = null;
}