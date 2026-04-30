console.log("LOADING: questionnaire.js");

const questionnaire = {
  initial: [
    { id: "problem_description", type: "voice" },
    { id: "duration",            type: "voice" },
    { id: "tried_anything",      type: "voice" },
    { id: "worried_about",       type: "voice", optional: true },
    { id: "how_to_help",         type: "voice" },
    { id: "contact_times",       type: "voice", optional: true },
  ],
  serviceSelection: {
    question: "What type of appointment do you need?",
    options: [
      { id: "repeat_prescription", title: "Repeat prescription",      description: "Order a prescription or ask a question about your medication" },
      { id: "fit_note",            title: "Fit (sick) note",          description: "A medical statement about your fitness to work" },
      { id: "routine_care",        title: "Routine care appointment", description: "Including long-term condition and medication reviews, vaccinations and screening" },
      { id: "test_results",        title: "Test results",             description: "Ask about the results of a recent test" },
      { id: "referral_followup",   title: "Referral follow-up",       description: "Ask about an existing referral" },
      { id: "doctors_letter",      title: "Doctor's letter",          description: "Including private, insurance and educational letters" },
      { id: "general_appointment", title: "General appointment",      description: "Discuss your health problem with a GP" },
    ],
  },
  followUp: {
    repeat_prescription: [
      { id: "medication_name", type: "voice" },
      { id: "additional_info", type: "voice", optional: true },
    ],
    fit_note: [
      { id: "previous_note",       type: "voice" },
      { id: "illness_description", type: "voice" },
      { id: "note_start_date",     type: "voice" },
      { id: "note_end_date",       type: "voice" },
      { id: "employer_help",       type: "voice", optional: true },
    ],
    routine_care:        [{ id: "care_type",        type: "voice" }],
    test_results:        [{ id: "test_type", type: "voice" }, { id: "test_date", type: "voice" }],
    referral_followup:   [{ id: "referral_details",  type: "voice" }],
    doctors_letter:      [{ id: "letter_purpose", type: "voice" }, { id: "letter_deadline", type: "voice", optional: true }],
    general_appointment: [],
  },
};

let currentQuestionIndex = 0;
let currentSection       = "initial";
let selectedService      = null;
let selectedServiceTitle = null;
let answers              = {};
let translatedQuestions  = {};
let hasSubmitted         = false;
let skippedQuestions = new Set();


function S() {
  return Object.assign({}, defaultStrings, serviceStrings, recStrings, window._allTranslatedStrings || {});
}

function buildFallbackResult() {
  const englishAnswers = {};
  const skip = new Set(["_service_title"]);
  Object.entries(answers).forEach(([k, v]) => {
    if (!skip.has(k)) englishAnswers[k] = v;
  });
  return {
    answers_original: { ...englishAnswers },
    answers_english:  { ...englishAnswers },
    question_labels:  { ...translatedQuestions },
    _isFallback:      true,
  };
}

function getTotalQuestions() {
  const initialCount  = questionnaire.initial.length;
  const serviceCount  = 1;
  const followUpCount = selectedService
    ? (questionnaire.followUp[selectedService]?.length || 0)
    : 0;
  return initialCount + serviceCount + followUpCount;
}

function getAnsweredCount() {
  return Object.keys(answers).length + skippedQuestions.size;
}

function updateProgressBar() {
  const wrapper  = document.getElementById("progressBarWrapper");
  const fill     = document.getElementById("progressFill");
  const label    = document.getElementById("progressLabel");
  const fraction = document.getElementById("progressFraction");
  if (!wrapper) return;

  const s          = S();
  const tQuestion  = s.progressQuestion || "Question";
  const tOf        = s.progressOf       || "of";
  const tAnswered  = s.progressAnswered || "answered";
  const tAllDone   = s.progressAllDone  || "All done!";

  const total    = getTotalQuestions();
  const answered = getAnsweredCount();
  const pct      = total > 0 ? Math.round((answered / total) * 100) : 0;

  wrapper.style.display = "block";
  fill.style.width      = pct + "%";

  const currentNum = Math.min(answered + 1, total);
  label.textContent    = `${tQuestion} ${currentNum} ${tOf} ${total}`;
  fraction.textContent = `${answered} ${tAnswered}`;

  if (answered >= total) {
    fill.style.width     = "100%";
    label.textContent    = tAllDone;
    fraction.textContent = `${total} ${tOf} ${total} ${tAnswered}`;
    wrapper.classList.add("progress-complete");
  } else {
    wrapper.classList.remove("progress-complete");
  }
}

function getCurrentQuestion() {
  if (currentSection === "initial")
    return questionnaire.initial[currentQuestionIndex];
  if (currentSection === "followUp" && selectedService)
    return questionnaire.followUp[selectedService]?.[currentQuestionIndex];
  return null;
}

async function askNextQuestion() {
  const question = getCurrentQuestion();

  if (!question) {
    if (currentSection === "initial")  { showServiceSelection(); return; }
    if (currentSection === "followUp") { showSummary(); return; }
  }

  const questionText = await getBotMessage(question.id, "question");
  translatedQuestions[question.id] = questionText;

  const s             = S();
  const optionalLabel = question.optional ? ` ${s.optionalText || "(optional)"}` : "";

  addMessage({ who: "bot", text: questionText + optionalLabel, isQuestion: true });
  await speakText(questionText);
  setStatus(s.ready || "Ready");

  if (question.optional) {
    const skipBtn = document.createElement("button");
    skipBtn.className   = "skip-button";
    skipBtn.textContent = s.skipText || "Skip this question";
    skipBtn.onclick     = () => skipQuestion(question.id, skipBtn);
    elements.chatContainer.appendChild(skipBtn);
    elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
  }
}

function skipQuestion(questionId, skipBtn) {
  skipBtn?.remove();
  skippedQuestions.add(questionId);
  currentQuestionIndex++;
  updateProgressBar();
  setTimeout(() => askNextQuestion(), 500);
}

function recordAnswer(questionId, answer) {
  answers[questionId] = answer;

  const skipBtn = elements.chatContainer.querySelector(".skip-button");
  if (skipBtn) skipBtn.remove();

  const translatedLabel = translatedQuestions[questionId]
    || getEnglishFallback(questionId, "question");

  displayQACard(translatedLabel, answer, questionId);

  currentQuestionIndex++;
  updateProgressBar();
  setTimeout(() => askNextQuestion(), 1000);
}

function displayQACard(questionLabel, answer, questionId) {
  const qaCard = document.createElement("div");
  qaCard.className = "qa-card";
  qaCard.dataset.questionId = questionId || "";
  qaCard.innerHTML = `
    <div class="qa-question">${questionLabel}</div>
    <div class="qa-answer">${answer}</div>
  `;
  elements.chatContainer.appendChild(qaCard);
  elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
}

async function showServiceSelection() {
  currentSection = "serviceSelection";

  showGlobalLoading();
  const translatedSvc = await translateServiceStrings(selectedLanguage);
  hideGlobalLoading();
  window._allTranslatedStrings = Object.assign(window._allTranslatedStrings || {}, translatedSvc);

  const s = S();

  const serviceQuestion = s.serviceSelectionQuestion || "What type of appointment do you need?";
  translatedQuestions["service_selection"] = serviceQuestion;
  addMessage({ who: "bot", text: serviceQuestion, isQuestion: true });

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "service-selection";

  const SVC_KEYS = {
    repeat_prescription: ["svc_repeat_prescription_title", "svc_repeat_prescription_desc"],
    fit_note:            ["svc_fit_note_title",            "svc_fit_note_desc"],
    routine_care:        ["svc_routine_care_title",        "svc_routine_care_desc"],
    test_results:        ["svc_test_results_title",        "svc_test_results_desc"],
    referral_followup:   ["svc_referral_followup_title",   "svc_referral_followup_desc"],
    doctors_letter:      ["svc_doctors_letter_title",      "svc_doctors_letter_desc"],
    general_appointment: ["svc_general_appointment_title", "svc_general_appointment_desc"],
  };

  questionnaire.serviceSelection.options.forEach(option => {
    const keys  = SVC_KEYS[option.id] || [];
    const title = (keys[0] && s[keys[0]]) ? s[keys[0]] : option.title;
    const desc  = (keys[1] && s[keys[1]]) ? s[keys[1]] : option.description;

    const button = document.createElement("button");
    button.className = "service-option";
    button.innerHTML = `
      <div class="service-title">${title}</div>
      <div class="service-description">${desc}</div>
    `;
    button.onclick = () => selectService(option.id, title);
    buttonContainer.appendChild(button);
  });

  elements.chatContainer.appendChild(buttonContainer);
  elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
}

function selectService(serviceId, serviceTitle) {
  selectedService      = serviceId;
  selectedServiceTitle = serviceTitle;
  answers.service_type   = serviceId;
  answers._service_title = serviceTitle;

  const s            = S();
  const serviceLabel = translatedQuestions["service_selection"]
    || s.serviceTypeLabel || "Appointment type";

  displayQACard(serviceLabel, serviceTitle, "service_type");

  currentSection       = "followUp";
  currentQuestionIndex = 0;
  updateProgressBar();
  setTimeout(() => askNextQuestion(), 1000);
}

async function showSummary() {
  const s = S();

  const thankYouText = await getBotMessage("thank_you", "system");
  addMessage({ who: "bot", text: thankYouText });

  renderSummaryCard();

  const submitLabel    = s.submitText    || "Submit";
  const startOverLabel = s.startOverText || "Start Over";
  const editLabel      = s.editText      || "Edit";

  const actionButtons = document.createElement("div");
  actionButtons.className = "summary-actions";
  actionButtons.id        = "summaryActions";
  actionButtons.innerHTML = `
    <button class="button button-primary" id="summarySubmitBtn">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      ${submitLabel}
    </button>
    <button class="button button-outline" id="summaryEditBtn">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>
      ${editLabel}
    </button>
    <button class="button button-secondary" id="summaryRestartBtn">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
      </svg>
      ${startOverLabel}
    </button>
  `;
  elements.chatContainer.appendChild(actionButtons);
  elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;

  document.getElementById("summarySubmitBtn").onclick  = submitAnswers;
  document.getElementById("summaryEditBtn").onclick    = showEditPanel;
  document.getElementById("summaryRestartBtn").onclick = restartQuestionnaire;
}

function renderSummaryCard() {
  document.getElementById("summaryCard")?.remove();

  const s = S();
  const summaryTitle = s.summaryTitle || "Your Answers:";

  const summaryCard = document.createElement("div");
  summaryCard.className = "summary-card";
  summaryCard.id        = "summaryCard";

  let summaryHTML = `<h3>${summaryTitle}</h3>`;
  Object.entries(answers).forEach(([key, value]) => {
    let label;
    if (key === "service_type") {
      label = translatedQuestions["service_selection"] || s.serviceTypeLabel || "Appointment type";
      value = answers._service_title || value.replace(/_/g, " ");
    } else if (key === "_service_title") {
      return;
    } else {
      label = translatedQuestions[key] || getEnglishFallback(key, "question");
    }
    summaryHTML += `
      <div class="summary-item" data-key="${key}">
        <div class="summary-item-label">${label}</div>
        <div class="summary-item-value">${value}</div>
      </div>`;
  });

  summaryCard.innerHTML = summaryHTML;

  const actions = document.getElementById("summaryActions");
  if (actions) {
    elements.chatContainer.insertBefore(summaryCard, actions);
  } else {
    elements.chatContainer.appendChild(summaryCard);
  }
}

function showEditPanel() {
  const s = S();

  document.getElementById("editPanel")?.remove();

  const panel = document.createElement("div");
  panel.className = "edit-panel";
  panel.id        = "editPanel";

  const heading = document.createElement("p");
  heading.className   = "edit-panel-title";
  heading.textContent = s.editAnswerTitle || "Edit your answer:";
  panel.appendChild(heading);

  Object.entries(answers).forEach(([key, value]) => {
    let label;
    let displayValue = value;
    if (key === "service_type") {
      label = s.serviceTypeLabel || "Appointment type";
      const svcOption = questionnaire.serviceSelection.options.find(o => o.id === value);
      displayValue = svcOption ? svcOption.title : value.replace(/_/g, " ");
    } else {
      label = translatedQuestions[key] || getEnglishFallback(key, "question");
    }

    if (key === "service_type" || key === "_service_title") return;

    const row = document.createElement("div");
    row.className = "edit-row";
    row.innerHTML = `
      <div class="edit-row-label">${label}</div>
      <div class="edit-row-current">${displayValue}</div>
      <textarea class="edit-textarea" data-key="${key}" rows="2">${value}</textarea>
      <div class="edit-row-actions">
        <button class="edit-save-btn" data-key="${key}">${s.saveEditText || "Save"}</button>
        <button class="edit-cancel-btn">${s.cancelEditText || "Cancel"}</button>
      </div>
    `;
    panel.appendChild(row);
  });

  elements.chatContainer.appendChild(panel);
  elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;

  panel.querySelectorAll(".edit-save-btn").forEach(btn => {
    btn.onclick = () => {
      const key      = btn.dataset.key;
      const textarea = panel.querySelector(`.edit-textarea[data-key="${key}"]`);
      if (textarea && textarea.value.trim()) {
        answers[key] = textarea.value.trim();
        panel.remove();
        renderSummaryCard();
      }
    };
  });

  panel.querySelectorAll(".edit-cancel-btn").forEach(btn => {
    btn.onclick = () => panel.remove();
  });
}
async function submitAnswers() {
  if (hasSubmitted) return;
  hasSubmitted = true;

  const submitBtn = document.getElementById("summarySubmitBtn");
  if (submitBtn) submitBtn.disabled = true;

  document.getElementById("editPanel")?.remove();
  const s = S();
  showGlobalLoading(
    s.loadingSubmitting || "Submitting your answers...",
    s.loadingSubSubmit  || "Please wait while we send your information."
  );

  try {
    const result = await submitFormToBackend(answers, selectedLanguage);
    _lastSubmissionResult = result;
  } catch (err) {
    console.error("Submit error — using local fallback:", err);
    _lastSubmissionResult = buildFallbackResult();
  }

  try {
    const translatedRec = await translateRecStrings(selectedLanguage);
    window._allTranslatedStrings = Object.assign(window._allTranslatedStrings || {}, translatedRec);
  } catch (err) {
    console.error("Rec translation error:", err);
  }

  try {
    const fresh = await translateUIStrings(selectedLanguage);
    window._allTranslatedStrings = Object.assign(window._allTranslatedStrings || {}, fresh);
  } catch (err) {
    console.error("UI translation error:", err);
  }

  hideGlobalLoading();

  try {
    const englishAnswers = _lastSubmissionResult?.answers_english || answers;
    const recs = getRecommendations(englishAnswers);
    await renderRecommendationsNoLoading(recs);
  } catch (err) {
    console.error("Recommendations error:", err);
  }

  showFindClinicButtonNoLoading();
}

var _lastSubmissionResult = null;

async function showFindClinicButton() {
  let s = defaultStrings;
  try {
    const fresh = await translateUIStrings(selectedLanguage);
    window._allTranslatedStrings = Object.assign(window._allTranslatedStrings || {}, fresh);
    s = fresh;
  } catch (e) {
    s = S();
  }

  const btn = document.createElement("button");
  btn.className = "button button-primary find-clinic-cta";
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
    <span>${s.findClinicCta || "Download PDF & find a local clinic"}</span>
  `;
  btn.onclick = () => showClinicFinder(_lastSubmissionResult);
  elements.chatContainer.appendChild(btn);
  elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
}

async function restartQuestionnaire() {
  currentQuestionIndex  = 0;
  currentSection        = "initial";
  selectedService       = null;
  selectedServiceTitle  = null;
  answers               = {};
  translatedQuestions   = {};
  hasSubmitted          = false;
  _lastSubmissionResult = null;
  skippedQuestions = new Set();

  elements.chatContainer.innerHTML = "";

  const wrapper = document.getElementById("progressBarWrapper");
  if (wrapper) {
    wrapper.style.display = "none";
    wrapper.classList.remove("progress-complete");
  }

  const fill = document.getElementById("progressFill");
  if (fill) fill.style.width = "0%";

  const label = document.getElementById("progressLabel");
  if (label) label.textContent = "";

  const fraction = document.getElementById("progressFraction");
  if (fraction) fraction.textContent = "";

  await showGreeting();
  setTimeout(() => askNextQuestion(), 1500);
}
async function renderRecommendationsNoLoading(recommendations) {
  const s = Object.assign({}, defaultStrings, recStrings, window._allTranslatedStrings);

  const wrapper = document.createElement("div");
  wrapper.className = "recommendations-wrapper";

  const heading = document.createElement("div");
  heading.className = "recommendations-heading";
  heading.innerHTML = `
    <span class="rec-heading-icon">💡</span>
    <span>${s.recommendationsTitle || "Based on what you shared, you may also find these helpful:"}</span>
  `;
  wrapper.appendChild(heading);

  recommendations.forEach((rec, i) => {
    const card = document.createElement("div");
    card.className = "rec-card";
    card.style.animationDelay = `${i * 80}ms`;
    card.style.setProperty("--rec-color", rec.color);

    const keys  = REC_STRING_KEYS[rec.id] || [];
    const title = (keys[0] && s[keys[0]]) ? s[keys[0]] : rec.title;
    const blurb = (keys[1] && s[keys[1]]) ? s[keys[1]] : rec.blurb;

    const linksHTML = rec.links.map(link => `
      <a class="rec-link" href="${link.url}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 6v2H5v11h11v-5h2v7H3V6h7zm11-3v8l-3.103-3.103-7.01 7.01-1.414-1.414 7.01-7.01L13 3h8z"/>
        </svg>
        ${link.label}${link.note ? `<span class="rec-link-note">${link.note}</span>` : ""}
      </a>
    `).join("");

    card.innerHTML = `
      <div class="rec-card-header">
        <span class="rec-icon">${rec.icon}</span>
        <span class="rec-title">${title}</span>
      </div>
      <p class="rec-blurb">${blurb}</p>
      <div class="rec-links">${linksHTML}</div>
    `;
    wrapper.appendChild(card);
  });

  const disclaimer = document.createElement("p");
  disclaimer.className = "rec-disclaimer";
  disclaimer.textContent = s.recommendationsDisclaimer || "These suggestions are informational only and do not replace clinical advice from your GP.";
  wrapper.appendChild(disclaimer);

  const fallbackKeys  = REC_STRING_KEYS["nhs_general"];
  const fallbackTitle = (fallbackKeys[0] && s[fallbackKeys[0]]) ? s[fallbackKeys[0]] : NHS_GENERAL_FALLBACK.title;
  const fallbackBlurb = (fallbackKeys[1] && s[fallbackKeys[1]]) ? s[fallbackKeys[1]] : NHS_GENERAL_FALLBACK.blurb;
  const fallbackCard  = document.createElement("div");
  fallbackCard.className = "rec-card";
  fallbackCard.style.setProperty("--rec-color", NHS_GENERAL_FALLBACK.color);
  fallbackCard.innerHTML = `
    <div class="rec-card-header">
      <span class="rec-icon">${NHS_GENERAL_FALLBACK.icon}</span>
      <span class="rec-title">${fallbackTitle}</span>
    </div>
    <p class="rec-blurb">${fallbackBlurb}</p>
    <div class="rec-links">${NHS_GENERAL_FALLBACK.links.map(link => `
      <a class="rec-link" href="${link.url}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24"><path d="M10 6v2H5v11h11v-5h2v7H3V6h7zm11-3v8l-3.103-3.103-7.01 7.01-1.414-1.414 7.01-7.01L13 3h8z"/></svg>
        ${link.label}
      </a>`).join("")}
    </div>
  `;
  wrapper.appendChild(fallbackCard);

  elements.chatContainer.appendChild(wrapper);
  elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
}

function showFindClinicButtonNoLoading() {
  const s = Object.assign({}, defaultStrings, window._allTranslatedStrings);
  const btn = document.createElement("button");
  btn.className = "button button-primary find-clinic-cta";
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
    <span>${s.findClinicCta || "Download PDF & find a local clinic"}</span>
  `;
  btn.onclick = () => showClinicFinder(_lastSubmissionResult);
  elements.chatContainer.appendChild(btn);
  elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
}

console.log("DONE:    questionnaire.js");