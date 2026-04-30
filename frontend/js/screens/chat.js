function toggleInputMode(mode) {
  inputMode = mode;
  const voiceMode         = document.getElementById("voiceModeBtn");
  const textMode          = document.getElementById("textModeBtn");
  const controlButtons    = document.querySelector(".control-buttons");
  const textInputContainer= document.getElementById("textInputContainer");

  if (!voiceMode || !textMode || !controlButtons || !textInputContainer) return;

  if (mode === "voice") {
    voiceMode.classList.add("active");
    textMode.classList.remove("active");
    controlButtons.style.display     = "flex";
    textInputContainer.style.display = "none";
  } else {
    textMode.classList.add("active");
    voiceMode.classList.remove("active");
    controlButtons.style.display     = "none";
    textInputContainer.style.display = "flex";
  }
}

async function sendTextMessage() {
  const textInput = document.getElementById("textInput");
  if (!textInput) return;
  const text = textInput.value.trim();
  if (!text) return;

  addMessage({ who: "user", text });
  textInput.value = "";

  if (typeof getCurrentQuestion === "function" && currentSection) {
    const question = getCurrentQuestion();
    if (question) {
      recordAnswer(question.id, text);
    } else {
      await echoBack(text);
    }
  } else {
    await echoBack(text);
  }
}

function handleTextInputKeydown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendTextMessage();
  }
}

setTimeout(() => {
  document.getElementById("voiceModeBtn")?.addEventListener("click", () => toggleInputMode("voice"));
  document.getElementById("textModeBtn")?.addEventListener("click",  () => toggleInputMode("text"));
  document.getElementById("sendTextBtn")?.addEventListener("click",  sendTextMessage);
  document.getElementById("textInput")?.addEventListener("keydown",  handleTextInputKeydown);
}, 500);