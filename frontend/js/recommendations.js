console.log("LOADING: recommendations.js");

const RECOMMENDATION_RULES = [
  {
    id: "dental",
    keywords: ["teeth", "tooth", "dental", "dentist", "gum", "mouth", "jaw",
               "toothache", "cavity", "filling", "crown", "wisdom tooth", "molar", "brace"],
    title: "Dental Care", icon: "🦷", color: "#4299e1",
    blurb: "Your answers mention dental or mouth issues. A dentist may be more appropriate for this.",
    links: [
      { label: "Find an NHS Dentist",         url: "https://www.nhs.uk/service-search/find-a-dentist" },
      { label: "NHS Dental Treatment Costs",  url: "https://www.nhs.uk/nhs-services/dentists/dental-costs/what-is-included-in-each-nhs-dental-band-charge/" },
      { label: "Emergency Dental Care (NHS)", url: "https://www.nhs.uk/nhs-services/dentists/urgent-dental-care-nhs-dental-helplines/" },
    ],
  },
  {
    id: "mental_health",
    keywords: ["anxious", "anxiety", "depressed", "depression", "mental health", "stress",
               "panic", "trauma", "ptsd", "ocd", "bipolar", "suicid", "self-harm",
               "hopeless", "worthless", "lonely", "overwhelmed", "low mood", "crying"],
    title: "Mental Health Support", icon: "🧠", color: "#9f7aea",
    blurb: "Your answers suggest you may benefit from mental health support. These NHS resources can help.",
    links: [
      { label: "NHS Mental Health Services",        url: "https://www.nhs.uk/mental-health/" },
      { label: "Find NHS Talking Therapies (IAPT)", url: "https://www.nhs.uk/mental-health/talking-therapies-medicine-treatments/talking-therapies-and-counselling/nhs-talking-therapies/" },
      { label: "Mind UK",                           url: "https://www.mind.org.uk/" },
      { label: "Samaritans (24/7)",                 url: "https://www.samaritans.org/", note: "116 123" },
      { label: "Crisis Text Line",                  url: "https://giveusashout.org/", note: "Text SHOUT to 85258" },
    ],
  },
  {
    id: "back_pain",
    keywords: ["back pain", "backache", "lower back", "upper back", "spine", "sciatica",
               "slipped disc", "lumbar", "neck pain", "stiff neck", "posture"],
    title: "Back Pain & Musculoskeletal", icon: "🦴", color: "#ed8936",
    blurb: "Back and muscle problems often benefit from physiotherapy or chiropractic care alongside GP treatment.",
    links: [
      { label: "NHS Back Pain Guide",             url: "https://www.nhs.uk/conditions/back-pain/" },
      { label: "Find NHS Physiotherapy",          url: "https://www.nhs.uk/service-search/physiotherapy/location-search/1017" },
      { label: "British Chiropractic Association", url: "https://chiropractic-uk.co.uk/find-a-chiropractor/" },
    ],
  },
  {
    id: "physio",
    keywords: ["physiotherapy", "physio", "rehabilitation", "rehab", "sprain", "strain",
               "ligament", "tendon", "knee pain", "hip pain", "ankle", "frozen shoulder",
               "shoulder injury", "rotator cuff", "muscle weakness"],
    title: "Physiotherapy", icon: "🏃", color: "#48bb78",
    blurb: "A physiotherapist may be able to help with your injury or movement problem.",
    links: [
      { label: "NHS Physiotherapy",                  url: "https://www.nhs.uk/conditions/physiotherapy/" },
      { label: "Self-refer to NHS Physio",           url: "https://www.nhs.uk/service-search/physiotherapy/location-search/1017" },
      { label: "Chartered Society of Physiotherapy", url: "https://www.csp.org.uk/public-patient/find-physiotherapist" },
    ],
  },
  {
    id: "eye_care",
    keywords: ["eye", "vision", "sight", "blind", "blurry", "optician", "glasses",
               "contact lens", "glaucoma", "cataract", "floaters", "double vision"],
    title: "Eye Care", icon: "👁️", color: "#4299e1",
    blurb: "Eye problems are often best handled by an optician first. NHS eye tests are free for many patients.",
    links: [
      { label: "NHS Eye Care",           url: "https://www.nhs.uk/nhs-services/opticians/" },
      { label: "Find an NHS Optician",   url: "https://www.nhs.uk/service-search/find-an-optician" },
      { label: "NHS Free Eye Tests",     url: "https://www.nhs.uk/nhs-services/opticians/free-nhs-eye-tests-and-optical-vouchers/" },
    ],
  },
  {
    id: "skin",
    keywords: ["skin", "rash", "eczema", "psoriasis", "acne", "spot", "mole", "itchy",
               "hives", "dermatitis", "wound", "ulcer", "blister", "flaky skin"],
    title: "Skin Conditions", icon: "🩺", color: "#f6ad55",
    blurb: "Many skin conditions can be assessed quickly using NHS online photo services.",
    links: [
      { label: "NHS Skin Conditions A–Z",  url: "https://www.nhs.uk/conditions/#S" },
      { label: "NHS Skin Cancer Info",     url: "https://www.nhs.uk/conditions/skin-cancer/" },
      { label: "British Skin Foundation",  url: "https://www.britishskinfoundation.org.uk/" },
    ],
  },
  {
    id: "weight",
    keywords: ["overweight", "obese", "obesity", "weight loss", "weight gain", "bmi",
               "diet", "nutrition", "eating too much", "losing weight"],
    title: "Weight Management", icon: "⚖️", color: "#68d391",
    blurb: "The NHS offers free weight management programmes and dietary advice.",
    links: [
      { label: "NHS Weight Loss Plan",            url: "https://www.nhs.uk/better-health/lose-weight/" },
      { label: "NHS Weight Management Services",  url: "https://www.nhs.uk/live-well/healthy-weight/managing-your-weight/understanding-bmi/" },
      { label: "NHS Eat Well Guide",              url: "https://www.nhs.uk/live-well/eat-well/" },
    ],
  },
  {
    id: "sleep",
    keywords: ["insomnia", "can't sleep", "cannot sleep", "sleep problem", "tired all the time",
               "exhausted", "fatigue", "snoring", "sleep apnea", "nightmare", "restless"],
    title: "Sleep Support", icon: "😴", color: "#76e4f7",
    blurb: "Sleep problems affect many people. NHS Talking Therapies offer CBT for insomnia.",
    links: [
      { label: "NHS Sleep Advice",     url: "https://www.nhs.uk/live-well/sleep-and-tiredness/" },
      { label: "NHS CBT for Insomnia", url: "https://www.nhs.uk/mental-health/talking-therapies-medicine-treatments/talking-therapies-and-counselling/cognitive-behavioural-therapy-cbt/overview/" },
      { label: "Sleepio (free via NHS in some areas)", url: "https://www.sleepio.com/nhs/" },
    ],
  },
  {
    id: "diabetes",
    keywords: ["diabetes", "diabetic", "blood sugar", "glucose", "insulin",
               "type 1", "type 2", "prediabetes", "hyperglycaemia", "hypoglycaemia"],
    title: "Diabetes Support", icon: "💉", color: "#fc8181",
    blurb: "Diabetes UK and the NHS provide excellent resources for managing and understanding diabetes.",
    links: [
      { label: "NHS Diabetes Guide",                url: "https://www.nhs.uk/conditions/diabetes/" },
      { label: "Diabetes UK",                       url: "https://www.diabetes.org.uk/" },
      { label: "NHS Diabetes Prevention Programme", url: "https://www.england.nhs.uk/diabetes/diabetes-prevention/" },
    ],
  },
  {
    id: "sexual_health",
    keywords: ["sexual health", "sti", "std", "contraception", "contraceptive pill", "coil",
               "iud", "pregnancy test", "hiv", "herpes", "chlamydia", "unprotected sex"],
    title: "Sexual Health", icon: "💊", color: "#f687b3",
    blurb: "Sexual health clinics offer free, confidential testing and treatment.",
    links: [
      { label: "Find NHS Sexual Health Clinics", url: "https://www.nhs.uk/service-search/sexual-health/find-a-sexual-health-clinic" },
      { label: "NHS Contraception Guide",        url: "https://www.nhs.uk/conditions/contraception/" },
      { label: "Brook (under 25s)",              url: "https://www.brook.org.uk/" },
    ],
  },
  {
    id: "addiction",
    keywords: ["smoking", "cigarette", "vaping", "alcohol", "drinking too much",
               "drug", "addiction", "substance", "cannabis", "cocaine", "quit smoking"],
    title: "Addiction Support", icon: "🚭", color: "#a0aec0",
    blurb: "Free NHS support is available to help with smoking, alcohol, or substance use.",
    links: [
      { label: "NHS Stop Smoking Services", url: "https://www.nhs.uk/better-health/quit-smoking/" },
      { label: "NHS Alcohol Support",       url: "https://www.nhs.uk/live-well/alcohol-advice/" },
      { label: "FRANK Drug Helpline",       url: "https://www.talktofrank.com/", note: "0300 123 6600" },
    ],
  },
  {
    id: "child_health",
    keywords: ["my child", "my baby", "my son", "my daughter", "my infant", "my toddler",
               "paediatric", "pediatric", "childhood", "vaccination", "immunisation"],
    title: "Children's Health", icon: "👶", color: "#fbb6ce",
    blurb: "NHS resources for children's health, vaccinations, and paediatric services.",
    links: [
      { label: "NHS Children's Health",      url: "https://www.nhs.uk/conditions/baby/" },
      { label: "NHS Childhood Vaccinations", url: "https://www.nhs.uk/vaccinations/nhs-vaccinations-and-when-to-have-them/" },
      { label: "NHS 111 for Children",       url: "https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111/" },
    ],
  },
];
 
const NHS_GENERAL_FALLBACK = {
  id: "nhs_general",
  icon: "🏥",
  color: "#667eea",
  title: "Useful NHS Resources",
  blurb: "Here are some general NHS services that may help you.",
  links: [
    { label: "NHS 111 — urgent medical help",   url: "https://111.nhs.uk/" },
    { label: "NHS Find a GP",                   url: "https://www.nhs.uk/service-search/find-a-gp" },
    { label: "NHS Conditions A–Z",              url: "https://www.nhs.uk/conditions/" },
    { label: "NHS App",                         url: "https://www.nhs.uk/nhs-app/" },
    { label: "Patient Access",                  url: "https://www.patientaccess.com/" },
  ],
};

function getRecommendations(answers) {
  const allText = Object.values(answers).join(" ").toLowerCase();

  const matched = [];
  for (const rule of RECOMMENDATION_RULES) {
    const hit = rule.keywords.some(kw => allText.includes(kw.toLowerCase()));
    if (hit) matched.push(rule);
  }
  return matched;
}

const REC_STRING_KEYS = {
  dental:        ["rec_dental_title",   "rec_dental_blurb"],
  mental_health: ["rec_mental_title",   "rec_mental_blurb"],
  back_pain:     ["rec_back_title",     "rec_back_blurb"],
  physio:        ["rec_physio_title",   "rec_physio_blurb"],
  eye_care:      ["rec_eye_title",      "rec_eye_blurb"],
  skin:          ["rec_skin_title",     "rec_skin_blurb"],
  weight:        ["rec_weight_title",   "rec_weight_blurb"],
  sleep:         ["rec_sleep_title",    "rec_sleep_blurb"],
  diabetes:      ["rec_diabetes_title", "rec_diabetes_blurb"],
  sexual_health: ["rec_sexual_title",   "rec_sexual_blurb"],
  addiction:     ["rec_addiction_title","rec_addiction_blurb"],
  child_health:  ["rec_child_title",    "rec_child_blurb"],
  nhs_general:   ["rec_nhs_title",      "rec_nhs_blurb"],
};

async function renderRecommendations(recommendations) {
  showGlobalLoading();
  const translatedRec = await translateRecStrings(selectedLanguage);
  hideGlobalLoading();
  window._allTranslatedStrings = Object.assign(window._allTranslatedStrings || {}, translatedRec);

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
  disclaimer.textContent = s.recommendationsDisclaimer ||
    "These suggestions are informational only and do not replace clinical advice from your GP.";
  wrapper.appendChild(disclaimer);

  const fallbackKeys  = REC_STRING_KEYS["nhs_general"];
  const fallbackTitle = (fallbackKeys[0] && s[fallbackKeys[0]]) ? s[fallbackKeys[0]] : NHS_GENERAL_FALLBACK.title;
  const fallbackBlurb = (fallbackKeys[1] && s[fallbackKeys[1]]) ? s[fallbackKeys[1]] : NHS_GENERAL_FALLBACK.blurb;
  const fallbackCard  = document.createElement("div");
  fallbackCard.className = "rec-card";
  fallbackCard.style.animationDelay = `${recommendations.length * 80}ms`;
  fallbackCard.style.setProperty("--rec-color", NHS_GENERAL_FALLBACK.color);
  fallbackCard.innerHTML = `
    <div class="rec-card-header">
      <span class="rec-icon">${NHS_GENERAL_FALLBACK.icon}</span>
      <span class="rec-title">${fallbackTitle}</span>
    </div>
    <p class="rec-blurb">${fallbackBlurb}</p>
    <div class="rec-links">${NHS_GENERAL_FALLBACK.links.map(link => `
      <a class="rec-link" href="${link.url}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 6v2H5v11h11v-5h2v7H3V6h7zm11-3v8l-3.103-3.103-7.01 7.01-1.414-1.414 7.01-7.01L13 3h8z"/>
        </svg>
        ${link.label}
      </a>`).join("")}
    </div>
  `;
  wrapper.appendChild(fallbackCard);

  elements.chatContainer.appendChild(wrapper);
  elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
}

console.log("DONE:    recommendations.js");