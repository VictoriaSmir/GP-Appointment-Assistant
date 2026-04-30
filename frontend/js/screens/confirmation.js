console.log("LOADING: confirmation.js");

async function proceedWithLanguage() {
  const strings = await translateEmergencyStrings(selectedLanguage);
  window._allTranslatedStrings = Object.assign(window._allTranslatedStrings || {}, strings);
  updateUIWithTranslations(strings);
  loadEmergencySymptoms(selectedLanguage);
  showScreen(elements.emergencyScreen);
}

elements.btnConfirmLanguage.addEventListener("click", async () => {
  elements.btnConfirmLanguage.disabled = true;
  elements.translationLoadingIndicator.classList.add("active");
  showGlobalLoading();
  try {
    await proceedWithLanguage();
  } finally {
    hideGlobalLoading();
    elements.btnConfirmLanguage.disabled = false;
    elements.translationLoadingIndicator.classList.remove("active");
  }
});

elements.btnTryAgain.addEventListener("click", () => {
  selectedLanguage = "eng_Latn";
  resetVoiceDetection();
  showScreen(elements.voiceDetectionScreen);
});

elements.btnManualFromConfirm.addEventListener("click", () => {
  const lang = getLangByCode(selectedLanguage);
  const flag = languageFlags[lang.code] || lang.abbr;
  elements.selectedFlag.textContent = flag;
  elements.selectedName.innerHTML = `
    <span class="selected-native">${lang.native}</span>
    ${lang.native !== lang.name ? `<span class="selected-english">${lang.name}</span>` : ""}
  `;
  populateDropdown();
  showScreen(elements.manualLanguageScreen);
});

console.log("DONE:    confirmation.js");