console.log("LOADING: manual-language.js");

elements.btnChooseManually.addEventListener("click", () => {
  console.log("MANUAL BUTTON CLICKED");
  selectedLanguage = "eng_Latn";
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

function populateDropdown(filter = "") {
  elements.dropdownOptions.innerHTML = "";
  const filtered = languages.filter(lang =>
    lang.name.toLowerCase().includes(filter.toLowerCase()) ||
    lang.native.toLowerCase().includes(filter.toLowerCase())
  );
  filtered.forEach(lang => {
    const flag   = languageFlags[lang.code] || lang.abbr;
    const option = document.createElement("div");
    option.className = `dropdown-option ${lang.code === selectedLanguage ? "selected" : ""}`;
    const showEnglish = lang.native !== lang.name;
    option.innerHTML = `
      <div class="dropdown-flag-lg">${flag}</div>
      <div class="lang-info">
        <span class="lang-native-primary">${lang.native}</span>
        ${showEnglish ? `<span class="lang-english-sub">${lang.name}</span>` : ""}
      </div>
      <span class="checkmark">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </span>
    `;
    option.addEventListener("click", () => selectDropdownLanguage(lang));
    elements.dropdownOptions.appendChild(option);
  });
}

function selectDropdownLanguage(lang) {
  selectedLanguage = lang.code;
  const flag = languageFlags[lang.code] || lang.abbr;
  elements.selectedFlag.textContent = flag;
  elements.selectedName.innerHTML = `
    <span class="selected-native">${lang.native}</span>
    ${lang.native !== lang.name ? `<span class="selected-english">${lang.name}</span>` : ""}
  `;
  closeDropdown();
  populateDropdown();
}

function openDropdown() {
  elements.dropdownMenu.classList.add("open");
  elements.dropdownSelected.classList.add("open");
  elements.languageSearch.focus();
}

function closeDropdown() {
  elements.dropdownMenu.classList.remove("open");
  elements.dropdownSelected.classList.remove("open");
  elements.languageSearch.value = "";
  populateDropdown();
}

elements.dropdownSelected.addEventListener("click", (e) => {
  e.stopPropagation();
  elements.dropdownMenu.classList.contains("open") ? closeDropdown() : openDropdown();
});

elements.languageSearch.addEventListener("input", (e) => populateDropdown(e.target.value));

document.addEventListener("click", (e) => {
  if (!elements.dropdownMenu.contains(e.target) && !elements.dropdownSelected.contains(e.target)) {
    closeDropdown();
  }
});

elements.btnContinueManual.addEventListener("click", async () => {
  elements.btnContinueManual.disabled = true;
  elements.manualLoadingIndicator.classList.add("active");
  showGlobalLoading();
  try {
    await proceedWithLanguage();
  } finally {
    hideGlobalLoading();
    elements.btnContinueManual.disabled = false;
    elements.manualLoadingIndicator.classList.remove("active");
  }
});
document.getElementById("btnBackToVoice")?.addEventListener("click", () => {
  showScreen(document.getElementById("voiceDetectionScreen"));
});

console.log("DONE:    manual-language.js");