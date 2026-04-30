console.log("LOADING: clinic-finder.js");

let _submissionResult = null;
let _clinicMap        = null;

async function showClinicFinder(submissionResult) {
  _submissionResult = submissionResult;
  showScreen(document.getElementById("clinicFinderScreen"));
  showGlobalLoading("Loading...", "Setting up your summary page");

  let src = defaultStrings;
  try {
    const fresh = await translateUIStrings(selectedLanguage);
    window._allTranslatedStrings = Object.assign(window._allTranslatedStrings || {}, fresh);
    src = fresh;
  } catch (e) {
    src = window._allTranslatedStrings || translatedStrings || defaultStrings;
  } finally {
    hideGlobalLoading();
  }

  const set = (id, key) => {
    const e = document.getElementById(id);
    if (e && src[key]) e.textContent = src[key];
  };

  set("pdfCardTitle",         "pdfCardTitle");
  set("pdfCardSubtitle",      "pdfCardSubtitle");
  set("pdfDownloadBtnText",   "pdfDownloadBtn");
  set("clinicFinderTitle",    "clinicFinderTitle");
  set("clinicFinderSubtitle", "clinicFinderSubtitle");
  set("findClinicsBtnText",   "findClinicsBtnText");
  set("clinicLoadingText",    "clinicLoadingText");
  set("emailSenderTitle",     "emailSenderTitle");
  set("emailSenderSubtitle",  "emailSenderSubtitle");
  set("emailSendBtnText",     "emailSendBtnText");
  set("emailHint",            "emailHint");
  set("howToSendTitle",       "howToSendTitle");
  set("howToStep1Title",      "howToStep1Title");
  set("howToStep1Desc",       "howToStep1Desc");
  set("howToStep2Title",      "howToStep2Title");
  set("howToStep2Desc",       "howToStep2Desc");
  set("howToStep3Title",      "howToStep3Title");
  set("howToStep3Desc",       "howToStep3Desc");
  set("howToStep4Title",      "howToStep4Title");
  set("howToStep4Desc",       "howToStep4Desc");
  set("howToStep5Title",      "howToStep5Title");
  set("howToStep5Desc",       "howToStep5Desc");
  set("postcodeSearchBtnText","postcodeSearchBtn");

  const inp = document.getElementById("clinicEmailInput");
  if (inp && src.emailPlaceholder) inp.placeholder = src.emailPlaceholder;

  const postcodeInp = document.getElementById("postcodeInput");
  if (postcodeInp && src.postcodePlaceholder) postcodeInp.placeholder = src.postcodePlaceholder;
}

document.getElementById("pdfDownloadBtn")?.addEventListener("click", async () => {
  if (!_submissionResult) return;
  const btn = document.getElementById("pdfDownloadBtn");
  const s   = window._allTranslatedStrings || defaultStrings;
  btn.disabled = true;
  btn.innerHTML = `<span>${s.pdfGenerating || "Generating PDF..."}</span>`;

  const backendUrl = (typeof BACKEND_BASE !== "undefined" ? BACKEND_BASE : "http://127.0.0.1:8001");

  console.log("📄 _submissionResult:", _submissionResult);
  console.log("📄 Fetching:", backendUrl + "/generate_pdf");

  if (!_submissionResult) {
    console.error("📄 No submission result stored — was form submitted?");
    alert("Could not generate PDF — please complete and submit the form first.");
    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg><span id="pdfDownloadBtnText">${(window._allTranslatedStrings||defaultStrings).pdfDownloadBtn||"Download PDF"}</span>`;
    return;
  }

  try {
    const payload = {
      answers_original: _submissionResult.answers_original || {},
      answers_english:  _submissionResult.answers_english  || {},
      question_labels:  _submissionResult.question_labels  || {},
      patient_language: (typeof selectedLanguage !== "undefined" ? selectedLanguage : "eng_Latn"),
      service_title: (typeof answers !== "undefined" && answers.service_type) 
      ? (answers.service_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()))
      : "General appointment",
    };
    console.log("📄 Payload keys:", Object.keys(payload));
    const isExe = (typeof BACKEND_BASE !== "undefined" && BACKEND_BASE.includes("8765"));
    const pdfEndpoint = isExe ? "/save_pdf" : "/generate_pdf";

    const res = await fetch(`${backendUrl}${pdfEndpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    });

    if (!res.ok) {
    const errText = await res.text();
    throw new Error(`PDF error ${res.status}: ${errText}`);
    }

    if (isExe) {
        const data = await res.json();
        if (data.status !== "ok") throw new Error("PDF save failed");
        btn.disabled  = false;
        btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg><span>${s.pdfDownloaded || "Downloaded!"}</span>`;
        btn.style.background = "#48bb78";
        setTimeout(() => {
            btn.style.background = "";
            btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg><span>${s.pdfDownloadBtn || "Download PDF"}</span>`;
            btn.disabled = false;
        }, 3000);
        return;
    } else {
    const blob     = await res.blob();
    const url      = URL.createObjectURL(blob);
    const filename = res.headers.get("Content-Disposition")
        ?.split("filename=")[1] || "gp_appointment.pdf";
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`PDF error ${res.status}: ${errText}`);
    }

    const blob     = await res.blob();
    const url      = URL.createObjectURL(blob);
    const filename = res.headers.get("Content-Disposition")
      ?.split("filename=")[1] || "gp_appointment.pdf";

    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    btn.disabled  = false;
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      <span>${s.pdfDownloaded || "Downloaded!"}</span>`;
    btn.style.background = "#48bb78";

    setTimeout(() => {
      btn.style.background = "";
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
        <span id="pdfDownloadBtnText">${s.pdfDownloadBtn || "Download PDF"}</span>`;
      btn.disabled = false;
    }, 3000);

  } catch (err) {
    console.error("PDF error:", err);
    btn.disabled  = false;
    btn.innerHTML = `<span>Error — try again</span>`;
  }
});

document.getElementById("findClinicsBtn")?.addEventListener("click", () => {
  const loading = document.getElementById("clinicLoadingIndicator");
  const btn     = document.getElementById("findClinicsBtn");
  btn.disabled  = true;
  loading.classList.add("active");

  navigator.geolocation.getCurrentPosition(
    pos => fetchClinics(pos.coords.latitude, pos.coords.longitude),
    err => {
      loading.classList.remove("active");
      btn.disabled = false;
      alert("Location access is needed to find nearby clinics. Please allow location access and try again.");
    },
    { timeout: 10000 }
  );
});

document.getElementById("emailSendBtn")?.addEventListener("click", () => {
  const email = document.getElementById("clinicEmailInput")?.value.trim();
  if (!email) {
    document.getElementById("clinicEmailInput")?.focus();
    return;
  }

  const subject = encodeURIComponent("GP Appointment Request");
  const body    = encodeURIComponent(
    `Hello,\n\nI would like to request a GP appointment.\n\n` +
    `Please find my completed appointment summary attached as a PDF.\n` +
    `The summary was generated using the GP Appointment Assistant and contains\n` +
    `my responses in both my native language and in English.\n\nKind regards`
  );

  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
});

function prefillEmail(email) {
  const input = document.getElementById("clinicEmailInput");
  if (input && email) {
    input.value = email;
    input.closest(".email-sender-card")?.scrollIntoView({ behavior: "smooth" });
  }
}

document.getElementById("postcodeSearchBtn")?.addEventListener("click", async () => {
  const postcode = document.getElementById("postcodeInput")?.value.trim();
  if (!postcode) return;
  const loading = document.getElementById("clinicLoadingIndicator");
  const btn     = document.getElementById("postcodeSearchBtn");
  btn.disabled  = true;
  loading.classList.add("active");

  try {
    const res  = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    const data = await res.json();
    if (data.status !== 200) throw new Error("Invalid postcode");
    await fetchClinics(data.result.latitude, data.result.longitude);
  } catch (err) {
    loading.classList.remove("active");
    btn.disabled = false;
    alert("Could not find that postcode. Please check and try again.");
  }
});

document.getElementById("postcodeInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("postcodeSearchBtn")?.click();
});

async function fetchClinics(lat, lng) {
  const loading      = document.getElementById("clinicLoadingIndicator");
  const locationBtn  = document.getElementById("findClinicsBtn");
  const postcodeBtn  = document.getElementById("postcodeSearchBtn");

  const resetButtons = () => {
    loading.classList.remove("active");
    if (locationBtn) locationBtn.disabled = false;
    if (postcodeBtn) postcodeBtn.disabled = false;
  };

  try {
    const query = `[out:json][timeout:25];
      (node["amenity"="doctors"](around:8000,${lat},${lng});
       node["healthcare"="centre"](around:8000,${lat},${lng});
       way["amenity"="doctors"](around:8000,${lat},${lng});
       node["healthcare"="doctor"](around:8000,${lat},${lng});
      );out center 10;`;

    const res  = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query
    });
    const data = await res.json();
    const elements = data.elements || [];
    console.log(`Overpass returned ${elements.length} elements`);

    const clinics = elements
      .filter(el => el.lat || el.center?.lat)
      .slice(0, 10)
      .map(el => {
        const t   = el.tags || {};
        const ela = el.lat || el.center?.lat;
        const eln = el.lon || el.center?.lon;
        const pc  = t["addr:postcode"] || "";
        return {
          name:    t.name || t.operator || "GP Practice",
          address: [t["addr:housenumber"], t["addr:street"],
                    t["addr:city"] || t["addr:town"], pc].filter(Boolean).join(", "),
          phone:   t.phone || t["contact:phone"] || "",
          email:   t.email || t["contact:email"] || "",
          website: t.website || t["contact:website"] || "",
          nhsUrl:  `https://www.nhs.uk/service-search/find-a-gp/results/${pc}`,
          lat:     ela,
          lng:     eln,
        };
      });

    resetButtons();

    if (!clinics.length) {
      document.getElementById("clinicMapContainer").style.display = "block";
      document.getElementById("clinicList").innerHTML =
        `<p class="clinic-error">No clinics found. <a href="https://www.nhs.uk/service-search/find-a-gp" target="_blank" rel="noopener">Search NHS Find a GP →</a></p>`;
      return;
    }

    renderClinicMap(lat, lng, clinics);

  } catch (e) {
    console.error("Clinic finder error:", e);
    resetButtons();
    document.getElementById("clinicList").innerHTML =
      `<p class="clinic-error">Could not load clinics. Please try again.</p>`;
  }
}

function renderClinicMap(userLat, userLng, clinics) {
  const container = document.getElementById("clinicMapContainer");
  const listEl    = document.getElementById("clinicList");
  container.style.display = "block";

  if (_clinicMap) { _clinicMap.remove(); _clinicMap = null; }

  _clinicMap = L.map("clinicMap").setView([userLat, userLng], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 18,
  }).addTo(_clinicMap);

  // User pin
  const userIcon = L.divIcon({
    html: `<div class="map-pin-user">📍</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
  L.marker([userLat, userLng], { icon: userIcon })
    .addTo(_clinicMap)
    .bindPopup("Your location")
    .openPopup();

  listEl.innerHTML = "";
  const s = window._allTranslatedStrings || defaultStrings;

  if (!clinics.length) {
    listEl.innerHTML = `<p class="clinic-error">No clinics found nearby. <a href="https://www.nhs.uk/service-search/find-a-gp" target="_blank">Search NHS website</a></p>`;
    return;
  }

  clinics.forEach((clinic, i) => {
    if (!clinic.lat || !clinic.lng) return;

    const clinicIcon = L.divIcon({
      html: `<div class="map-pin-clinic">${i + 1}</div>`,
      className: "",
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    const marker = L.marker([clinic.lat, clinic.lng], { icon: clinicIcon })
      .addTo(_clinicMap)
      .bindPopup(`<b>${clinic.name}</b><br>${clinic.address}`);

    const subject    = encodeURIComponent("GP Appointment Request");
    const mailBody   = encodeURIComponent(
      `Hello,\n\nI would like to request a GP appointment.\n` +
      `Please find my completed appointment summary attached as a PDF.\n` +
      `This was generated using the GP Appointment Assistant.\n\nKind regards`
    );

    const card = document.createElement("div");
    card.className = "clinic-card";
    card.innerHTML = `
      <div class="clinic-card-number">${i + 1}</div>
      <div class="clinic-card-body">
        <div class="clinic-name">${clinic.name}</div>
        <div class="clinic-address">${clinic.address}</div>
        <div class="clinic-contacts">

          ${clinic.phone ? `
            <a class="clinic-contact-link" href="tel:${clinic.phone}">
              <svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
              ${clinic.phone}
            </a>` : ""}

          ${clinic.email ? `
            <a class="clinic-contact-link clinic-email-link"
               href="#"
               onclick="event.preventDefault(); prefillEmail('${clinic.email}')">
              <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              ${s.emailClinic || "Use this email"} — ${clinic.email}
            </a>` : ""}

          <a class="clinic-contact-link clinic-nhs-link" href="${clinic.nhsUrl}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M10 6v2H5v11h11v-5h2v7H3V6h7zm11-3v8l-3.1-3.1-7 7-1.4-1.4 7-7L13 3h8z"/></svg>
            ${s.viewNhsProfile || "View on NHS website — book online or get contact details"}
          </a>

          ${clinic.website && clinic.website !== clinic.nhsUrl ? `
            <a class="clinic-contact-link" href="${clinic.website}" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24"><path d="M10 6v2H5v11h11v-5h2v7H3V6h7zm11-3v8l-3.1-3.1-7 7-1.4-1.4 7-7L13 3h8z"/></svg>
              ${s.visitWebsite || "Practice website"}
            </a>` : ""}

        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      _clinicMap.setView([clinic.lat, clinic.lng], 15);
      marker.openPopup();
    });

    listEl.appendChild(card);
  });
}

console.log("DONE:    clinic-finder.js");