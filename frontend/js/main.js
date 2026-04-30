console.log("LOADING: main.js");

document.getElementById("bannerBackEmergency")?.addEventListener("click", () => {
  showScreen(elements.emergencyScreen);
});

elements.bannerBack.addEventListener("click", () => {
  if (currentScreen === "clinicFinderScreen") {
    showScreen(elements.chatScreen);
    return;
  }
  if (currentScreen === "manualLanguageScreen") {
    showScreen(elements.voiceDetectionScreen);
    return;
  }

  selectedLanguage  = "eng_Latn";
  translatedStrings = null;
  window._progressStrings = null;
  window._allTranslatedStrings = {};

  if (typeof restartQuestionnaire === "function") {
    currentQuestionIndex = 0;
    currentSection       = "initial";
    selectedService      = null;
    selectedServiceTitle = null;
    answers              = {};
    translatedQuestions  = {};
    hasSubmitted         = false;
  }

  const chatContainer = document.getElementById("chatContainer");
  if (chatContainer) chatContainer.innerHTML = "";

  const progressWrapper = document.getElementById("progressBarWrapper");
  if (progressWrapper) progressWrapper.style.display = "none";

  const defaultLang = languages[0];
  elements.selectedFlag.textContent = languageFlags[defaultLang.code] || defaultLang.abbr;
  elements.selectedName.innerHTML   = `<span class="selected-native">${defaultLang.native}</span>`;
  populateDropdown();

  resetVoiceDetection();
  showScreen(elements.voiceDetectionScreen);
});

populateDropdown();

console.log(`GP Voice Assistant ready. ${languages.length} languages supported.`);

console.log("DONE:    main.js");