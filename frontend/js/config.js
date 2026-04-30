console.log("LOADING: config.js");
// ─────────────────────────────────────────────
// Backend URL
// ─────────────────────────────────────────────
const BACKEND_BASE = "http://127.0.0.1:8765";

// ─────────────────────────────────────────────
// Supported Languages
// ─────────────────────────────────────────────
const languages = [
  { code: "eng_Latn", abbr: "EN", name: "English",    native: "English",    whisper: "english" },
  { code: "spa_Latn", abbr: "ES", name: "Spanish",    native: "Español",    whisper: "spanish" },
  { code: "fra_Latn", abbr: "FR", name: "French",     native: "Français",   whisper: "french" },
  { code: "deu_Latn", abbr: "DE", name: "German",     native: "Deutsch",    whisper: "german" },
  { code: "por_Latn", abbr: "PT", name: "Portuguese", native: "Português",  whisper: "portuguese" },
  { code: "pol_Latn", abbr: "PL", name: "Polish",     native: "Polski",     whisper: "polish" },
  { code: "rus_Cyrl", abbr: "RU", name: "Russian",    native: "Русский",    whisper: "russian" },
  { code: "ukr_Cyrl", abbr: "UK", name: "Ukrainian",  native: "Українська", whisper: "ukrainian" },
  { code: "ara_Arab", abbr: "AR", name: "Arabic",     native: "العربية",    whisper: "arabic" },
  { code: "hin_Deva", abbr: "HI", name: "Hindi",      native: "हिन्दी",      whisper: "hindi" },
  { code: "ben_Beng", abbr: "BN", name: "Bengali",    native: "বাংলা",      whisper: "bengali" },
  { code: "zho_Hans", abbr: "ZH", name: "Chinese",    native: "简体中文",    whisper: "chinese" },
  { code: "ita_Latn", abbr: "IT", name: "Italian",    native: "Italiano",   whisper: "italian" },
  { code: "jpn_Jpan", abbr: "JA", name: "Japanese",   native: "日本語",     whisper: "japanese" },
  { code: "kor_Hang", abbr: "KO", name: "Korean",     native: "한국어",     whisper: "korean" },
  { code: "nld_Latn", abbr: "NL", name: "Dutch",      native: "Nederlands", whisper: "dutch" },
  { code: "tur_Latn", abbr: "TR", name: "Turkish",    native: "Türkçe",     whisper: "turkish" },
  { code: "vie_Latn", abbr: "VI", name: "Vietnamese", native: "Tiếng Việt", whisper: "vietnamese" },
  { code: "tha_Thai", abbr: "TH", name: "Thai",       native: "ไทย",        whisper: "thai" },
  { code: "ron_Latn", abbr: "RO", name: "Romanian",   native: "Română",     whisper: "romanian" },
];

const languageFlags = {
  "eng_Latn": "🇬🇧", "spa_Latn": "🇪🇸", "fra_Latn": "🇫🇷", "deu_Latn": "🇩🇪",
  "por_Latn": "🇵🇹", "pol_Latn": "🇵🇱", "rus_Cyrl": "🇷🇺", "ukr_Cyrl": "🇺🇦",
  "ara_Arab": "🇸🇦", "hin_Deva": "🇮🇳", "ben_Beng": "🇧🇩", "zho_Hans": "🇨🇳",
  "ita_Latn": "🇮🇹", "jpn_Jpan": "🇯🇵", "kor_Hang": "🇰🇷", "nld_Latn": "🇳🇱",
  "tur_Latn": "🇹🇷", "vie_Latn": "🇻🇳", "tha_Thai": "🇹🇭", "ron_Latn": "🇷🇴",
};


const emergencyStrings = {
  // Banner / navigation
  bannerTitle:            "GP Appointment Assistant",
  backText:               "Change Language",
  backToEmergencyText:    "Back to emergency check",
  backToSymptomsText:     "Back to symptoms list",
  helpBtnText: "Help",
  backToVoiceText: "Back to Auto-Detection",

  // Action screen
  actionTitle:            "How can we help you today?",
  appointmentText:        "Make Appointment",
  emergencyText:          "Emergency",

  // Accessibility / disclaimer — shown before chat starts
  accessibilityTitle:     "How would you like to use the assistant?",
  accessibilitySubtitle:  "You can change this at any time during the conversation",
  voiceOptionText:        "Voice assistant — read questions aloud",
  textOptionText:         "Text only — no audio",
  disclaimerLabel:        "Important notice",
  disclaimerText:         "You are not speaking to a real clinician. This is a digital assistant to help you book a GP appointment. No medical advice is provided.",

  // Emergency symptoms page
  emergencyPageTitle:     "Emergency — Call 999",
  emergencyUseLocation:   "Find A&E near me",
  emergencyOrPostcode:    "or enter postcode",
  emergencyNoAE:          "No A&E found nearby. Please call 999 or visit nhs.uk",

  // Emergency action screen
  urgencyChipLabel:       "Life-threatening emergency",
  emergencyCallTitle:     "Call 999 immediately",
  emergencyCallSubtitle:  "This is a life-threatening emergency. Call 999 now.",
  emergency999Btn:        "Call 999 Now",
  emergency111Title:      "Less urgent but still need help?",
  ae111Desc:              "Online triage and advice",
  emergency111Btn:        "Go to NHS 111 online",
  ae111Note:              "Free 24/7 — use if you need urgent help but it is not life-threatening",
  emergencyAETitle:       "Nearest A&E departments",
  aeFinderDesc:           "Walk-in emergency departments",
  emergencyAEUseLocation: "Find A&E near me",
  emergencyAEPostcode:    "Or enter postcode",
  aePostcodePlaceholder:  "e.g. NP7 5EE",
  emergencyAELoading:     "Finding nearest hospitals...",
  emergencyDirections:    "Get directions",
  emergencyCallHospital:  "Call hospital",
  emergencyBackBtn:       "Back to symptoms list",
  aeBadge:                "A&E",
};

const coreStrings = {
  // Chat UI
  assistant:              "Assistant",
  you:                    "You",
  greeting:               "Hello",
  greetingDesc:           "I'm here to help you book a GP appointment. Press the record button and tell me what you need.",
  startRecording:         "Speak",
  stopSend:               "Stop",
  clearLast:              "Restart",
  hintText:               "Press",
  hintText2:              "to record",
  hintText3:              "or switch to Type mode",
  ready:                  "Ready",
  recording:              "Recording",
  listening:              "Listening",
  processing:             "Processing",
  stopping:               "Stopping",
  processingStatus:       "Processing",
  error:                  "Error",
  noSpeech:               "(no speech detected)",
  echoPrefix:             "I heard:",
  echoSuffix:             "How else can I help you?",
  voiceModeText:          "Voice",
  typeModeText:           "Type",
  voiceoverLabel:         "Voiceover",
  textInputPlaceholder:   "Type your answer here...",
  sendText:               "Send",
  backToChat: "Back to conversation",

  // Questionnaire / progress
  progressQuestion:       "Question",
  progressOf:             "of",
  progressAnswered:       "answered",
  progressAllDone:        "All done!",
  optionalText:           "(optional — you can skip this)",
  skipText:               "Skip this question",
  summaryTitle:           "Your Answers:",
  submitText:             "Submit",
  startOverText:          "Start Over",
  editText:               "Edit Answers",
  editAnswerTitle:        "Edit your answer:",
  saveEditText:           "Save",
  cancelEditText:         "Cancel",
  serviceTypeLabel:       "Appointment type",
  serviceSelectionQuestion: "What type of appointment do you need?",
  noAudioDetected: "No audio detected — please try recording again.",

  // Loading states
  loadingTitle:           "Translating...",
  loadingSub:             "Setting up your language. This takes a few seconds.",
  loadingSubmitting:      "Submitting your answers...",
  loadingSubSubmit:       "Please wait while we send your information.",

  // Recommendations
  recommendationsTitle:   "Based on what you shared, you may also find these helpful:",
  recommendationsDisclaimer: "These suggestions are informational only and do not replace clinical advice from your GP.",

  // Clinic finder & PDF
  pdfCardTitle:           "Your appointment summary is ready",
  pdfCardSubtitle:        "Download your completed form to send to your GP",
  pdfDownloadBtn:         "Download PDF",
  pdfGenerating:          "Generating PDF...",
  pdfDownloaded:          "Downloaded!",
  findClinicCta:          "Download PDF and send it to your local clinic",
  clinicFinderTitle:      "Find your nearest GP clinic",
  clinicFinderSubtitle:   "Find clinics near you and get their contact details",
  findClinicsBtnText:     "Find clinics near me",
  clinicLoadingText:      "Finding nearby clinics...",
  emailSenderTitle:       "Send your summary by email",
  emailSenderSubtitle:    "Enter the clinic email address, or your own email to save and forward later",
  emailSendBtnText:       "Open email app",
  emailHint:              "Most GP clinics list their email on their NHS profile or practice website. Click View on NHS website on any clinic below to find it, then paste it here.",
  emailClinic:            "Use this email",
  emailPlaceholder:       "e.g. reception@gpclinic.nhs.uk",
  noEmailAvailable:       "No email listed",
  visitWebsite:           "Practice website",
  viewNhsProfile:         "View on NHS website",
  postcodeSearchBtn: "Search",
  postcodePlaceholder: "Enter postcode (e.g. NP7 5EE)",

  // How-to instructions panel (clinic finder screen)
  howToSendTitle:         "How to send your appointment request",
  howToStep1Title:        "Download your summary PDF",
  howToStep1Desc:         "Press the Download PDF button below to save your completed appointment request to your device.",
  howToStep2Title:        "Find your nearest GP clinic",
  howToStep2Desc:         "Use the map below to locate GP practices near you. Search by location or postcode.",
  howToStep3Title:        "Find the clinic's email address",
  howToStep3Desc:         "Click \"View on NHS website\" on any clinic card below. The email address is usually listed on their NHS profile or practice website.",
  howToStep4Title:        "Paste the email and open your email app",
  howToStep4Desc:         "Copy the clinic email address and paste it into the box below, then press \"Open email app\". An email will open with a ready-made message.",
  howToStep5Title:        "Attach the PDF and send",
  howToStep5Desc:         "Attach the PDF you downloaded in step 1 to the email, then send it. The clinic will contact you to confirm your appointment.",
};

const defaultStrings = { ...emergencyStrings, ...coreStrings };

// Service option strings
const serviceStrings = {
  svc_repeat_prescription_title: "Repeat prescription",
  svc_repeat_prescription_desc:  "Order a prescription or ask a question about your medication",
  svc_fit_note_title:            "Fit (sick) note",
  svc_fit_note_desc:             "A medical statement about your fitness to work",
  svc_routine_care_title:        "Routine care appointment",
  svc_routine_care_desc:         "Including long-term condition and medication reviews, vaccinations and screening",
  svc_test_results_title:        "Test results",
  svc_test_results_desc:         "Ask about the results of a recent test",
  svc_referral_followup_title:   "Referral follow-up",
  svc_referral_followup_desc:    "Ask about an existing referral",
  svc_doctors_letter_title:      "Doctor's letter",
  svc_doctors_letter_desc:       "Including private, insurance and educational letters",
  svc_general_appointment_title: "General appointment",
  svc_general_appointment_desc:  "Discuss your health problem with a GP",
};

// Recommendation strings
const recStrings = {
  rec_dental_title:    "Dental Care",
  rec_dental_blurb:    "Your answers mention dental or mouth issues. A dentist may be more appropriate for this.",
  rec_mental_title:    "Mental Health Support",
  rec_mental_blurb:    "Your answers suggest you may benefit from mental health support. These NHS resources can help.",
  rec_back_title:      "Back Pain and Musculoskeletal",
  rec_back_blurb:      "Back and muscle problems often benefit from physiotherapy or chiropractic care alongside GP treatment.",
  rec_physio_title:    "Physiotherapy",
  rec_physio_blurb:    "A physiotherapist may be able to help with your injury or movement problem.",
  rec_eye_title:       "Eye Care",
  rec_eye_blurb:       "Eye problems are often best handled by an optician first. NHS eye tests are free for many patients.",
  rec_skin_title:      "Skin Conditions",
  rec_skin_blurb:      "Many skin conditions can be assessed quickly using NHS online services.",
  rec_weight_title:    "Weight Management",
  rec_weight_blurb:    "The NHS offers free weight management programmes and dietary advice.",
  rec_sleep_title:     "Sleep Support",
  rec_sleep_blurb:     "Sleep problems affect many people. NHS Talking Therapies offer support for insomnia.",
  rec_diabetes_title:  "Diabetes Support",
  rec_diabetes_blurb:  "Diabetes UK and the NHS provide excellent resources for managing diabetes.",
  rec_sexual_title:    "Sexual Health",
  rec_sexual_blurb:    "Sexual health clinics offer free, confidential testing and treatment.",
  rec_addiction_title: "Addiction Support",
  rec_addiction_blurb: "Free NHS support is available to help with smoking, alcohol, or substance use.",
  rec_child_title:     "Children's Health",
  rec_child_blurb:     "NHS resources for children's health, vaccinations, and paediatric services.",
  rec_nhs_title:       "Useful NHS Resources",
  rec_nhs_blurb:       "Here are some general NHS services that may help you.",
};

window._allTranslatedStrings = {};

function getLangByCode(code) {
  return languages.find(l => l.code === code) || languages[0];
}

function whisperToNLLB(whisperCode) {
  const lang = languages.find(l => l.whisper === whisperCode);
  return lang ? lang.code : "eng_Latn";
}

console.log("DONE:    config.js");