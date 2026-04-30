console.log("LOADING: accessibility.js");

elements.btnMakeAppointment.addEventListener("click", () => {
  appointmentType = "appointment";
  if (translatedStrings) updateUIWithTranslations(translatedStrings);
  showScreen(document.getElementById("accessibilityScreen"));
});

function startChat(withVoice) {
  ttsEnabled = withVoice;
  updateTTSBtn();
  showScreen(elements.chatScreen);
  updateProgressBar();
  showGreeting().then(() => setTimeout(() => askNextQuestion(), 1500));
  setStatus((translatedStrings || defaultStrings).ready);
}

document.getElementById("btnBackToEmergency")?.addEventListener("click", () => {
  showScreen(elements.emergencyScreen);
});

document.getElementById("btnChooseVoice")?.addEventListener("click", () => startChat(true));
document.getElementById("btnChooseText")?.addEventListener("click",  () => startChat(false));

console.log("DONE:    accessibility.js");