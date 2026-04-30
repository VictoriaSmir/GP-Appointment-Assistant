console.log("LOADING: api.js");

function getEnglishFallback(key, type) {
  const questions = {
    problem_description: "Can you describe your health problem?",
    duration:            "How long has it been going on for? Is it getting better or worse?",
    tried_anything:      "Have you tried anything to help?",
    worried_about:       "Is there anything you're particularly worried about?",
    how_to_help:         "How would you like us to help?",
    contact_times:       "When are the best times to contact you?",
    medication_name:     "What medication do you need?",
    additional_info:     "Is there anything else you want to tell us?",
    previous_note:       "Have you previously had a note about this?",
    illness_description: "Briefly describe your illness or medical problem.",
    note_start_date:     "When should the sick note start? Please say the day, month, and year.",
    note_end_date:       "When should the sick note end? Please say the day, month, and year.",
    employer_help:       "Can your employer do anything to help you return to work sooner?",
    care_type:           "What type of routine care do you need?",
    test_type:           "What test was it?",
    test_date:           "When was the test done?",
    referral_details:    "What referral is it about?",
    letter_purpose:      "What is the letter for?",
    letter_deadline:     "When do you need the letter by?",
    service_selection:   "What type of appointment do you need?",
  };
  const system = {
    greeting:    "Hello! I'm here to help you book a GP appointment. I'll ask you a few questions about your health problem.",
    thank_you:   "Thank you! Here's a summary of your answers. We'll review this and contact you soon.",
    submitted:   "",
    echo_prefix: "I heard:",
    echo_suffix: "How else can I help you?",
  };
  return type === "question" ? (questions[key] || key) : (system[key] || key);
}

async function getBotMessage(messageKey, messageType = "question") {
  if (selectedLanguage === "eng_Latn") {
    return getEnglishFallback(messageKey, messageType);
  }
  try {
    const res = await fetch(`${BACKEND_BASE}/chatbot_message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_key: messageKey, target_lang: selectedLanguage, message_type: messageType }),
    });
    if (!res.ok) throw new Error(`chatbot_message ${res.status}`);
    const json = await res.json();
    return json.text || getEnglishFallback(messageKey, messageType);
  } catch (err) {
    console.error("getBotMessage error:", err);
    return getEnglishFallback(messageKey, messageType);
  }
}

const UI_STRINGS_VERSION = "v20";

async function translateStringsObject(stringsObj, targetLang, cacheLabel) {
  if (targetLang === "eng_Latn") return stringsObj;

  const cacheKey = `translations_${cacheLabel}_${targetLang}_${UI_STRINGS_VERSION}`;

  for (const key of Object.keys(sessionStorage)) {
    if (key.startsWith(`translations_${cacheLabel}_${targetLang}`) && key !== cacheKey) {
      sessionStorage.removeItem(key);
    }
  }

  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (_) {}

  try {
    const res = await fetch(`${BACKEND_BASE}/translate_ui`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ strings: stringsObj, target_lang: targetLang }),
    });
    if (!res.ok) throw new Error(`translate_ui ${res.status}`);
    const translated = await res.json();
    try { sessionStorage.setItem(cacheKey, JSON.stringify(translated)); } catch (_) {}
    return translated;
  } catch (err) {
    console.error("translateStringsObject error:", err);
    return stringsObj;
  }
}

async function translateEmergencyStrings(targetLang) {
  return translateStringsObject(emergencyStrings, targetLang, "emergency");
}

async function translateCoreStrings(targetLang) {
  return translateStringsObject(coreStrings, targetLang, "core");
}

async function translateUIStrings(targetLang) {
  return translateStringsObject(defaultStrings, targetLang, "ui");
}

async function translateServiceStrings(targetLang) {
  return translateStringsObject(serviceStrings, targetLang, "svc");
}

async function translateRecStrings(targetLang) {
  return translateStringsObject(recStrings, targetLang, "rec");
}

async function submitFormToBackend(answers, sourceLang) {
  const res = await fetch(`${BACKEND_BASE}/submit_form`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, source_lang: sourceLang }),
  });
  if (!res.ok) throw new Error(`submit_form ${res.status}`);
  return res.json();
}

async function detectLanguageFromAudio(blob) {
  const form = new FormData();
  form.append("audio", blob, "speech.webm");
  const res = await fetch(`${BACKEND_BASE}/detect_language`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`detect_language ${res.status}`);
  return res.json();
}

async function transcribeAudio(blob, srcLang) {
  const form = new FormData();
  form.append("audio", blob, "speech.webm");
  const url = `${BACKEND_BASE}/transcribe?src_lang=${encodeURIComponent(srcLang)}`;
  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) throw new Error(`transcribe ${res.status}`);
  return res.json();
}

console.log("DONE:    api.js");