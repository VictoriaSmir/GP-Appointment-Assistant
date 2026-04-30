console.log("LOADING: emergency-action.js");

let _aeMap = null;

async function showEmergencyAction() {
  showScreen(document.getElementById("emergencyActionScreen"));

  let s = defaultStrings;
  try {
    const fresh = await translateUIStrings(selectedLanguage);
    window._allTranslatedStrings = Object.assign(window._allTranslatedStrings || {}, fresh);
    s = fresh;
  } catch (e) {
    s = window._allTranslatedStrings || translatedStrings || defaultStrings;
  }

  const get = key => s[key] || defaultStrings[key] || "";
  const set = (id, key) => {
    const el = document.getElementById(id);
    const val = get(key);
    if (el && val) el.textContent = val;
  };

  set("urgencyChipLabel",      "urgencyChipLabel");
  set("emergencyCallTitle",    "emergencyCallTitle");
  set("emergencyCallSubtitle", "emergencyCallSubtitle");
  set("emergency999BtnText",   "emergency999Btn");
  set("emergency111Title",     "emergency111Title");
  set("ae111Desc",             "ae111Desc");
  set("emergency111Btn",       "emergency111Btn");
  set("ae111Note",             "ae111Note");
  set("emergencyAETitle",      "emergencyAETitle");
  set("aeFinderDesc",          "aeFinderDesc");
  set("emergencyAEUseLocation","emergencyAEUseLocation");
  set("aeOrText",              "emergencyOrPostcode");
  set("emergencyAELoading",    "emergencyAELoading");

  const pcInput = document.getElementById("aePostcodeInput");
  if (pcInput) pcInput.placeholder = get("aePostcodePlaceholder");
}

document.getElementById("btnEmergencyYes")?.addEventListener("click", showEmergencyAction);

document.getElementById("findAEBtn")?.addEventListener("click", () => {
  const loading = document.getElementById("aeLoadingIndicator");
  const btn     = document.getElementById("findAEBtn");
  btn.disabled  = true;
  loading.classList.add("active");

  navigator.geolocation.getCurrentPosition(
    pos => fetchAE(pos.coords.latitude, pos.coords.longitude),
    ()  => {
      loading.classList.remove("active");
      btn.disabled = false;
      document.getElementById("aePostcodeInput")?.focus();
    },
    { timeout: 8000 }
  );
});

document.getElementById("aePostcodeBtn")?.addEventListener("click", async () => {
  const pc  = document.getElementById("aePostcodeInput")?.value.trim();
  if (!pc) return;
  const loading = document.getElementById("aeLoadingIndicator");
  const btn     = document.getElementById("aePostcodeBtn");
  btn.disabled  = true;
  loading.classList.add("active");
  try {
    const res  = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(pc)}`);
    const data = await res.json();
    if (data.status !== 200) throw new Error("Invalid postcode");
    fetchAE(data.result.latitude, data.result.longitude);
  } catch {
    loading.classList.remove("active");
    btn.disabled = false;
  }
});

document.getElementById("aePostcodeInput")?.addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("aePostcodeBtn")?.click();
});

async function fetchAE(lat, lng) {
  const loading = document.getElementById("aeLoadingIndicator");
  const findBtn = document.getElementById("findAEBtn");
  const pcBtn   = document.getElementById("aePostcodeBtn");

  try {
    const query = `[out:json][timeout:15];
      (node["amenity"="hospital"]["emergency"="yes"](around:20000,${lat},${lng});
       way["amenity"="hospital"]["emergency"="yes"](around:20000,${lat},${lng});
       node["amenity"="hospital"](around:15000,${lat},${lng});
       way["amenity"="hospital"](around:15000,${lat},${lng});
      );out center 10;`;

    const res  = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: query });
    const data = await res.json();

    const hospitals = (data.elements || [])
      .filter(el => el.tags?.name)
      .slice(0, 8)
      .map(el => ({
        name:    el.tags.name,
        address: [el.tags["addr:street"], el.tags["addr:city"] || el.tags["addr:town"],
                  el.tags["addr:postcode"]].filter(Boolean).join(", "),
        phone:   el.tags.phone || el.tags["contact:phone"] || "",
        hasAE:   el.tags.emergency === "yes",
        lat:     el.lat  || el.center?.lat,
        lng:     el.lon  || el.center?.lon,
      }))
      .filter(h => h.lat && h.lng)
      .sort((a, b) => (b.hasAE ? 1 : 0) - (a.hasAE ? 1 : 0));

    loading.classList.remove("active");
    if (findBtn) findBtn.disabled = false;
    if (pcBtn)   pcBtn.disabled   = false;
    renderAEMap(lat, lng, hospitals);

  } catch (err) {
    console.error("A&E fetch error:", err);
    loading.classList.remove("active");
    if (findBtn) findBtn.disabled = false;
    if (pcBtn)   pcBtn.disabled   = false;
    document.getElementById("aeMapContainer").style.display = "block";
    const s = window._allTranslatedStrings || defaultStrings;
    document.getElementById("aeList").innerHTML =
      `<p class="clinic-error">${s.emergencyNoAE}<br>
       <a href="https://www.nhs.uk/service-search/find-a-hospital" target="_blank" rel="noopener">
         Search NHS website →
       </a></p>`;
  }
}

function renderAEMap(userLat, userLng, hospitals) {
  const container = document.getElementById("aeMapContainer");
  const listEl    = document.getElementById("aeList");
  container.style.display = "block";

  if (_aeMap) { _aeMap.remove(); _aeMap = null; }

  _aeMap = L.map("aeMap").setView([userLat, userLng], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors", maxZoom: 18,
  }).addTo(_aeMap);

  L.marker([userLat, userLng], {
    icon: L.divIcon({ html: `<div class="map-pin-user">📍</div>`, className: "", iconSize: [32,32], iconAnchor: [16,32] })
  }).addTo(_aeMap).bindPopup("Your location").openPopup();

  listEl.innerHTML = "";
  const s = window._allTranslatedStrings || defaultStrings;

  if (!hospitals.length) {
    listEl.innerHTML = `<p class="clinic-error">${s.emergencyNoAE}</p>`;
    return;
  }

  hospitals.forEach((h, i) => {
    const color = h.hasAE ? "#c53030" : "#667eea";

    const icon = L.divIcon({
      html: `<div class="map-pin-ae" style="background:${color}">${i+1}</div>`,
      className: "", iconSize: [28,28], iconAnchor: [14,28],
    });

    const marker = L.marker([h.lat, h.lng], { icon })
      .addTo(_aeMap)
      .bindPopup(`<b>${h.name}</b>${h.hasAE ? `<br><b style="color:#c53030">${s.aeBadge || "A&E"}</b>` : ""}`);

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`;

    const card = document.createElement("div");
    card.className = `clinic-card${h.hasAE ? " ae-urgent-card" : ""}`;
    card.innerHTML = `
      <div class="clinic-card-number" style="background:${color}">${i+1}</div>
      <div class="clinic-card-body">
        <div class="clinic-name">
          ${h.hasAE ? `<span class="ae-badge">${s.aeBadge || "A&E"}</span>` : ""}
          ${h.name}
        </div>
        ${h.address ? `<div class="clinic-address">${h.address}</div>` : ""}
        <div class="clinic-contacts">
          ${h.phone ? `
            <a class="clinic-contact-link" href="tel:${h.phone}">
              <svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
              ${s.emergencyCallHospital} — ${h.phone}
            </a>` : ""}
          <a class="clinic-contact-link clinic-nhs-link" href="${mapsUrl}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            ${s.emergencyDirections}
          </a>
        </div>
      </div>`;

    card.addEventListener("click", () => {
      _aeMap.setView([h.lat, h.lng], 15);
      marker.openPopup();
    });

    listEl.appendChild(card);
  });
}

console.log("DONE:    emergency-action.js");