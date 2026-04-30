console.log("LOADING: ui.js");

var elements = {
  voiceDetectionScreen:    document.getElementById("voiceDetectionScreen"),
  confirmationScreen:      document.getElementById("confirmationScreen"),
  manualLanguageScreen:    document.getElementById("manualLanguageScreen"),
  actionScreen:            document.getElementById("actionScreen"),
  emergencyScreen:         document.getElementById("emergencyScreen"),
  accessibilityScreen:     document.getElementById("accessibilityScreen"),
  chatScreen:              document.getElementById("chatScreen"),
  bannerBack:              document.getElementById("bannerBack"),
  voiceDetectBtn:          document.getElementById("voiceDetectBtn"),
  micInstruction:          document.getElementById("micInstruction"),
  voiceLoadingIndicator:   document.getElementById("voiceLoadingIndicator"),
  btnChooseManually:       document.getElementById("btnChooseManually"),
  detectedLanguageName:    document.getElementById("detectedLanguageName"),
  detectedLanguageNative:  document.getElementById("detectedLanguageNative"),
  btnConfirmLanguage:      document.getElementById("btnConfirmLanguage"),
  btnTryAgain:             document.getElementById("btnTryAgain"),
  btnManualFromConfirm:    document.getElementById("btnManualFromConfirm"),
  translationLoadingIndicator: document.getElementById("translationLoadingIndicator"),
  dropdownSelected:        document.getElementById("dropdownSelected"),
  dropdownMenu:            document.getElementById("dropdownMenu"),
  dropdownOptions:         document.getElementById("dropdownOptions"),
  languageSearch:          document.getElementById("languageSearch"),
  selectedFlag:            document.getElementById("selectedFlag"),
  selectedName:            document.getElementById("selectedName"),
  manualLoadingIndicator:  document.getElementById("manualLoadingIndicator"),
  btnContinueManual:       document.getElementById("btnContinueManual"),
  btnMakeAppointment:      document.getElementById("btnMakeAppointment"),
  chatContainer:           document.getElementById("chatContainer"),
  startBtn:                document.getElementById("startBtn"),
  stopBtn:                 document.getElementById("stopBtn"),
  clearBtn:                document.getElementById("clearBtn"),
  statusText:              document.getElementById("statusText"),
  statusBadge:             document.getElementById("statusBadge"),
};

function showScreen(screen) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  screen.classList.add("active");

  const emergencyActionScreen = document.getElementById("emergencyActionScreen");
  const accessibilityScreen   = document.getElementById("accessibilityScreen");
  const clinicFinderScreen    = document.getElementById("clinicFinderScreen");
  const bannerBackEmergency   = document.getElementById("bannerBackEmergency");
  const s                     = window._allTranslatedStrings || defaultStrings;

  const showBack = [
      elements.emergencyScreen,
      elements.chatScreen,
      clinicFinderScreen,
      elements.manualLanguageScreen,
  ].includes(screen);
  elements.bannerBack.classList.toggle("visible", showBack);

  if (screen === elements.emergencyScreen)      _setText("bannerBackText", s.backText || "Change Language");
  if (screen === elements.chatScreen)           _setText("bannerBackText", s.backText || "Change Language");
  if (screen === clinicFinderScreen)            _setText("bannerBackText", s.backToChat || "Back to conversation");
  if (screen === elements.manualLanguageScreen) _setText("bannerBackText", s.backToVoiceText || "Back to Auto-Detection");

  const showBackEmergency = [emergencyActionScreen, accessibilityScreen].includes(screen);
  if (bannerBackEmergency) bannerBackEmergency.classList.toggle("visible", showBackEmergency);

  currentScreen = screen.id;
}

function setStatus(msg, isRecording = false) {
  elements.statusText.textContent = msg;
  elements.statusBadge.classList.toggle("recording", isRecording);
}

function addMessage({ who, text, isWelcome = false, isQuestion = false }) {
  const message = document.createElement("div");

  if (isWelcome) {
    message.className = "welcome-message";
    const strings = translatedStrings || defaultStrings;
    message.innerHTML = `
      <div class="icon">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </div>
      <h2>${strings.greeting}</h2>
      <p>${strings.greetingDesc}</p>
    `;
    elements.chatContainer.appendChild(message);
    return { message };
  }

  message.className = `message ${who}`;
  if (isQuestion) message.classList.add("is-question");

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.innerHTML = who === "bot"
    ? '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>'
    : '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;

  message.appendChild(avatar);
  message.appendChild(bubble);
  elements.chatContainer.appendChild(message);
  elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;

  return { message, bubble };
}

function _setText(id, val) {
  const el = document.getElementById(id);
  if (el && val) el.textContent = val;
}

function showGlobalLoading(title, sub) {
  const overlay = document.getElementById("globalLoadingOverlay");
  if (!overlay) return;
  const t = window._allTranslatedStrings || {};
  document.getElementById("globalLoadingTitle").textContent = title || t.loadingTitle || "Translating...";
  document.getElementById("globalLoadingSub").textContent  = sub   || t.loadingSub   || "Setting up your language. This takes a few seconds.";
  overlay.style.display = "flex";
}

function hideGlobalLoading() {
  const overlay = document.getElementById("globalLoadingOverlay");
  if (overlay) overlay.style.display = "none";
}

function updateUIWithTranslations(strings) {
  translatedStrings = strings;

  _setText("bannerTitle", strings.bannerTitle);
  _setText("bannerHelpBtnText", strings.helpBtnText);

  _setText("actionTitle",      strings.actionTitle);
  _setText("appointmentText",  strings.appointmentText);
  _setText("emergencyText",    strings.emergencyText);

  _setText("disclaimerLabel", strings.disclaimerLabel);

  _setText("accessibilityTitle",    strings.accessibilityTitle);
  _setText("accessibilitySubtitle", strings.accessibilitySubtitle);
  _setText("voiceOptionText",       strings.voiceOptionText);
  _setText("textOptionText",        strings.textOptionText);
  _setText("disclaimerText",         strings.disclaimerText);
  _setText("pdfCardTitle",           strings.pdfCardTitle);
  _setText("pdfCardSubtitle",        strings.pdfCardSubtitle);
  _setText("pdfDownloadBtnText",     strings.pdfDownloadBtn);
  _setText("clinicFinderTitle",      strings.clinicFinderTitle);
  _setText("clinicFinderSubtitle",   strings.clinicFinderSubtitle);
  _setText("findClinicsBtnText",     strings.findClinicsBtnText);
  _setText("clinicLoadingText",      strings.clinicLoadingText);
  _setText("backToEmergencyText",    strings.backToEmergencyText);
  _setText("backToSymptomsText",     strings.backToSymptomsText);
  _setText("emailSenderTitle",       strings.emailSenderTitle);
  _setText("emailSenderSubtitle",    strings.emailSenderSubtitle);
  _setText("emailSendBtnText",       strings.emailSendBtnText);
  _setText("emailHint",              strings.emailHint);
  _setText("emergencyCallTitle",     strings.emergencyCallTitle);
  _setText("emergencyCallSubtitle",  strings.emergencyCallSubtitle);
  _setText("emergency999Btn",        strings.emergency999Btn);
  _setText("emergency111Title",      strings.emergency111Title);
  _setText("emergency111Btn",        strings.emergency111Btn);
  _setText("emergencyAETitle",       strings.emergencyAETitle);
  _setText("emergencyAEUseLocation", strings.emergencyAEUseLocation);
  _setText("emergencyAELoading",     strings.emergencyAELoading);
  _setText("emergencyBackBtn",       strings.emergencyBackBtn);
  const emailInp = document.getElementById("clinicEmailInput");
  if (emailInp && strings.emailPlaceholder) emailInp.placeholder = strings.emailPlaceholder;
  _setText("ttsLabel",               strings.voiceoverLabel);

  window._allTranslatedStrings = Object.assign(window._allTranslatedStrings || {}, strings);
  window._progressStrings = strings;

  _setText("voiceModeBtnText", strings.voiceModeText);
  _setText("textModeBtnText",  strings.typeModeText);

  _setText("startBtnText",  strings.startRecording);
  _setText("stopBtnText",   strings.stopSend);
  _setText("clearBtnText",  strings.clearLast);
  _setText("hintText",      strings.hintText);
  _setText("hintText2",     strings.hintText2);
  _setText("hintText3",     strings.hintText3);
  _setText("sendBtnText",    strings.sendText);

  const textInput = document.getElementById("textInput");
  if (textInput && strings.textInputPlaceholder) textInput.placeholder = strings.textInputPlaceholder;

  elements.statusText.textContent = strings.ready;

  _setText("bannerBackText",          strings.backText);
  _setText("bannerBackEmergencyText",   strings.backToEmergencyText || "Back to Emergency Symptoms");
}

async function showGreeting() {
  const greetingText = await getBotMessage("greeting", "system");
  addMessage({ who: "bot", text: greetingText });
  await speakText(greetingText);
}

console.log("DONE:    ui.js");