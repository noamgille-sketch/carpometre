/* Carpomètre v1 — tout tourne dans le navigateur, sans serveur.
   Météo : Open-Meteo (gratuit, usage non commercial). Carte : IGN Géoplateforme. Plans d'eau : OpenStreetMap (Overpass). */
"use strict";
const $ = id => document.getElementById(id);
const store = {
  get(k, d){ try{ const v = localStorage.getItem("carpometre."+k); return v ? JSON.parse(v) : d; }catch{ return d; } },
  set(k, v){ try{ localStorage.setItem("carpometre."+k, JSON.stringify(v)); }catch{} }
};

let loc = store.get("loc", {name:"Aumale (76)", lat:49.7699, lon:1.7559});
let H = null, sun = [], day = 0, sel = 0, pondId = null, ponds = [];
let map, pondLayer, pins = {};
const DIRS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSO","SO","OSO","O","ONO","NO","NNO"];
const dirName = d => DIRS[Math.round(d / 22.5) % 16];
const cls = s => s >= 65 ? "good" : s < 45 ? "bad" : "";
const hm = x => `${Math.floor(x)} h ${String(Math.round((x % 1) * 60)).padStart(2, "0")}`;

/* ---------- Météo ---------- */
async function loadWeather(){
  $("place").textContent = `${loc.name} · chargement de la météo…`;
  const u = "https://api.open-meteo.com/v1/forecast?latitude=" + loc.lat + "&longitude=" + loc.lon +
    "&hourly=temperature_2m,pressure_msl,wind_speed_10m,wind_direction_10m,precipitation_probability,cloud_cover" +
    "&daily=sunrise,sunset&timezone=Europe%2FParis&past_days=1&forecast_days=3";
  try{
    const r = await fetch(u); if(!r.ok) throw new Error(r.status);
    const j = await r.json();
    H = j.hourly;
    sun = j.daily.time.map((t, k) => ({rise: toH(j.daily.sunrise[k]), set: toH(j.daily.sunset[k])}));
    const now = new Date(); const nowH = 24 + now.getHours();
    day = 0; sel = nowH;
    $("place").textContent = `${loc.name} · mis à jour à ${now.getHours()} h ${String(now.getMinutes()).padStart(2,"0")}`;
    renderDays(); render();
  }catch(e){
    $("place").textContent = `${loc.name} · la météo n'a pas pu être chargée. Vérifiez la connexion puis rechargez la page.`;
  }
}
const toH = s => { const t = s.split("T")[1].split(":"); return +t[0] + t[1] / 60; };

/* ---------- Note carpe ---------- */
function score(i, pid = pondId){
  const h = i % 24, d = Math.floor(i / 24);
  const p = Math.round(H.pressure_msl[i]), tr = i >= 6 ? H.pressure_msl[i] - H.pressure_msl[i - 6] : 0;
  const w = Math.round(H.wind_speed_10m[i]), wd = H.wind_direction_10m[i], dn = dirName(wd);
  const r = H.precipitation_probability[i] ?? 0, t = Math.round(H.temperature_2m[i]), c = H.cloud_cover[i] ?? 0;
  const S = sun[d] || sun[1];
  const f = [];
  if(p < 1005) f.push(["Pression très basse", `${p} hPa`, 0]);
  else if(p <= 1015) f.push(["Pression idéale", `${p} hPa, zone 1005–1015`, 15]);
  else if(p <= 1020) f.push(["Pression moyenne", `${p} hPa`, 5]);
  else if(p <= 1025) f.push(["Pression haute", `${p} hPa`, -5]);
  else f.push(["Haute pression installée", `${p} hPa, carpes calées au fond`, -15]);
  if(tr <= -1 && tr >= -6) f.push(["Baisse lente", "Avant une dépression, les carpes s'activent", 10]);
  else if(tr < -6) f.push(["Chute brutale", `${tr.toFixed(0)} hPa sur 6 h`, -5]);
  else if(Math.abs(tr) < 1) f.push(["Pression stable", "Pas de variation sur 6 h", 5]);
  else if(tr <= 4) f.push(["Légère hausse", `+${tr.toFixed(0)} hPa sur 6 h`, -5]);
  else f.push(["Forte hausse", `+${tr.toFixed(0)} hPa sur 6 h, retour du beau temps`, -15]);
  const warm = wd >= 157.5 && wd <= 292.5, cold = wd >= 315 || wd <= 112.5;
  if(w < 5) f.push(["Vent quasi nul", `${w} km/h, eau figée`, -5]);
  else if(warm && w <= 25) f.push(["Vent chaud porteur", `${dn} ${w} km/h, pêchez la berge au vent`, 10]);
  else if(cold) f.push(["Vent froid", `${dn} ${w} km/h`, -10]);
  else if(w > 30) f.push(["Vent fort", `${w} km/h`, -5]);
  if(r >= 25 && r <= 85) f.push(["Pluie probable", `${r} %, eau oxygénée`, 5]);
  else if(c >= 70 && r < 25) f.push(["Ciel couvert", "Lumière douce, carpes moins méfiantes", 5]);
  const ds = Math.abs(h + .5 - S.set), dr = Math.abs(h + .5 - S.rise);
  if(ds <= 1.5) f.push(["Coucher du soleil", `à ${hm(S.set)}, pic d'activité`, 15]);
  else if(dr <= 1.5) f.push(["Lever du jour", `à ${hm(S.rise)}`, 10]);
  else if(h >= 11 && h <= 14 && t <= 18) f.push(["Milieu de journée", "Eau la plus chaude en saison fraîche", 5]);
  else if(h >= 1 && h <= 5) f.push(["Creux de la nuit", "Heures les plus froides", -10]);
  if(t < 8) f.push(["Air froid", `${t} °C, l'eau refroidit`, -5]);
  if(t > 28) f.push(["Forte chaleur", `${t} °C, oxygène en baisse`, -5]);
  const pd = ponds.find(x => x.id === pid);
  if(pd){
    const night = h >= 20 || h < 7;
    if(pd.depth != null && pd.depth >= 3 && night) f.push(["Étang profond", `${pd.depth} m, garde la chaleur la nuit`, 5]);
    if(pd.depth != null && pd.depth <= 1.8 && h >= 11 && h <= 15) f.push(["Étang peu profond", "Se réchauffe vite en journée", 5]);
    if(pd.depth != null && pd.depth <= 1.8 && night) f.push(["Étang peu profond", "Refroidit vite la nuit", -5]);
    if(pd.open === true && w >= 8) f.push(["Grand plan d'eau ouvert", "Vagues et oxygène sur la berge exposée", 5]);
  }
  const s = Math.max(0, Math.min(100, 50 + f.reduce((a, x) => a + x[2], 0)));
  return {i, h, s, f, p, tr, w, dn, t};
}

/* ---------- Affichage ---------- */
function renderDays(){
  const names = ["Aujourd'hui", "Demain", "Après-demain"];
  $("days").innerHTML = names.map((n, k) => `<button role="tab" aria-selected="${k === day}" data-d="${k}">${n}</button>`).join("");
}
function render(){
  if(!H) return;
  const base = 24 * (day + 1), rows = [];
  for(let i = base; i < base + 24; i++) rows.push(score(i));
  const nowI = 24 + new Date().getHours();
  const caught = catchHours();
  $("bars").innerHTML = rows.map(r => `<button class="bar ${cls(r.s)} ${r.i === sel ? "sel" : ""} ${r.i < nowI ? "past" : ""} ${caught.has(r.i) ? "catch" : ""}" data-i="${r.i}" aria-label="${r.h} h, note ${r.s}"><i style="height:${Math.max(6, r.s)}%"></i></button>`).join("");
  $("hours").innerHTML = rows.map(r => `<span>${r.h % 3 === 0 ? r.h + "h" : ""}</span>`).join("");
  // créneaux : suites d'heures à 60+ (heures à venir seulement)
  const fut = rows.filter(r => r.i >= nowI), wins = [];
  let a = null;
  fut.forEach((r, k) => { if(r.s >= 60 && a === null) a = k; if((r.s < 60 || k === fut.length - 1) && a !== null){ wins.push(fut.slice(a, r.s >= 60 ? k + 1 : k)); a = null; } });
  const ranked = wins.map(w => ({w, avg: Math.round(w.reduce((q, z) => q + z.s, 0) / w.length)})).sort((x, y) => y.avg - x.avg).slice(0, 3);
  $("windows").innerHTML = ranked.length ? ranked.map(({w, avg}) => {
    const best = w.reduce((q, z) => z.s > q.s ? z : q);
    const why = best.f.filter(x => x[2] > 0).sort((x, y) => y[2] - x[2]).slice(0, 2).map(x => x[0].toLowerCase()).join(", ");
    const end = w[w.length - 1].h + 1;
    return `<li><span class="t">${w[0].h} h – ${end === 24 ? "minuit" : end + " h"}</span><span class="s">${avg}</span><span class="why">${why ? why[0].toUpperCase() + why.slice(1) : "Conditions correctes"}</span></li>`;
  }).join("") : `<li><span class="t">Aucun créneau à 60+</span><span></span><span class="why">Journée difficile : pêchez fin et visez l'heure la mieux notée de la frise.</span></li>`;
  if(sel < base || sel >= base + 24) sel = day === 0 ? nowI : base + 7;
  renderSel();
}
function renderSel(){
  const r = score(sel);
  document.querySelectorAll(".bar").forEach(b => b.classList.toggle("sel", +b.dataset.i === sel));
  const R = 110, ang = Math.PI * (1 - r.s / 100), ex = 150 + R * Math.cos(ang), ey = 150 - R * Math.sin(ang);
  const col = r.s >= 65 ? "var(--good)" : r.s < 45 ? "var(--bad)" : "var(--mid)";
  let ticks = "";
  for(let k = 0; k <= 10; k++){ const t = Math.PI * (1 - k / 10); ticks += `<line x1="${150 + 122 * Math.cos(t)}" y1="${150 - 122 * Math.sin(t)}" x2="${150 + 130 * Math.cos(t)}" y2="${150 - 130 * Math.sin(t)}" stroke="var(--muted)" stroke-width="${k % 5 ? 1 : 2}"/>`; }
  $("arc").innerHTML = `<path d="M40 150 A110 110 0 0 1 260 150" fill="none" stroke="var(--track)" stroke-width="16" stroke-linecap="round"/>` +
    (r.s > 0 ? `<path d="M40 150 A110 110 0 0 1 ${ex.toFixed(1)} ${ey.toFixed(1)}" fill="none" stroke="${col}" stroke-width="16" stroke-linecap="round"/>` : "") + ticks;
  $("score").textContent = r.s;
  const pd = ponds.find(x => x.id === pondId);
  $("selhour").textContent = `${["Aujourd'hui","Demain","Après-demain"][Math.floor(sel / 24) - 1] || ""} · ${r.h} h – ${(r.h + 1) % 24} h${pd ? " · " + pd.name : ""}`;
  $("headline").textContent = r.s >= 65 ? "Bon créneau, lignes à l'eau" : r.s >= 45 ? "Touche possible, restez discret" : "Créneau difficile, pêchez fin";
  $("summary").textContent = r.s >= 65 ? "Amorçage modéré sur le poste, privilégiez la berge qui reçoit le vent."
    : r.s >= 45 ? "Quelques billes autour de l'esche suffisent. Gardez une ligne là où elles ont déjà mangé."
    : "Amorçage très léger, pop-up visible, et n'hésitez pas à changer de poste.";
  $("cP").textContent = `${r.p} hPa`;
  $("cT").textContent = (r.tr > 0 ? "+" : "") + r.tr.toFixed(0) + " hPa";
  $("cW").textContent = `${r.dn} ${r.w} km/h`;
  $("cA").textContent = `${r.t} °C`;
  $("factors").innerHTML = `<div class="head"><span class="label">Base 50</span><b>${r.s}</b></div>` +
    r.f.map(x => `<div class="f"><div>${x[0]}<small>${x[1]}</small></div><span class="v ${x[2] > 0 ? "p" : x[2] < 0 ? "n" : ""}">${x[2] > 0 ? "+" : ""}${x[2]}</span></div>`).join("");
  renderPins(); renderPondCard();
}

/* ---------- Carte ---------- */
function initMap(){
  const ign = (layer, fmt) => `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=normal&TILEMATRIXSET=PM&FORMAT=${fmt}&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`;
  const sat = L.tileLayer(ign("ORTHOIMAGERY.ORTHOPHOTOS", "image/jpeg"), {maxZoom: 19, attribution: "IGN-F/Géoportail"});
  const plan = L.tileLayer(ign("GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2", "image/png"), {maxZoom: 19, attribution: "IGN-F/Géoportail"});
  const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom: 19, attribution: "© OpenStreetMap"});
  map = L.map("map", {layers: [sat], scrollWheelZoom: true});
  L.control.layers({"Satellite": sat, "Plan IGN": plan, "OpenStreetMap": osm}, null, {position: "topright"}).addTo(map);
  pondLayer = L.layerGroup().addTo(map);
  map.setView([loc.lat, loc.lon], 11);
}
async function loadPonds(){
  ponds = window.PONDS_CURATED.map(p => ({...p, curated: true}));
  map.setView([loc.lat, loc.lon], 11);
  drawPins();
  $("pondnote").textContent = "Recherche des plans d'eau autour…";
  const q = `[out:json][timeout:25];(way["natural"="water"]["name"](around:15000,${loc.lat},${loc.lon});relation["natural"="water"]["name"](around:15000,${loc.lat},${loc.lon});nwr["leisure"="fishing"](around:15000,${loc.lat},${loc.lon}););out center tags 80;`;
  try{
    const j = await overpass(q);
    const skip = new Set(["river", "canal", "stream", "ditch", "wastewater", "moat", "fountain"]);
    j.elements.forEach(e => {
      const t = e.tags || {}; if(skip.has(t.water)) return;
      const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon; if(lat == null) return;
      if(ponds.some(p => Math.hypot((p.lat - lat) * 111, (p.lon - lon) * 72) < 0.5)) return;
      ponds.push({id: "osm" + e.id, name: t.name || "Coin de pêche", near: "", lat, lon, depth: null, open: null, curated: false,
        specs: [["Type", t.leisure === "fishing" ? "Coin de pêche" : ({pond: "Étang", lake: "Lac", reservoir: "Retenue"}[t.water] || "Plan d'eau")], ["Fiche", "À compléter"]]});
    });
    $("pondnote").textContent = `${ponds.length} plans d'eau : fiches détaillées (gros ronds) et plans d'eau OpenStreetMap dans un rayon de 15 km.`;
  }catch{
    $("pondnote").textContent = "Les plans d'eau OpenStreetMap n'ont pas pu être chargés ; seuls les étangs détaillés sont affichés.";
  }
  reports().forEach(r => ponds.push({...r, curated: false, reported: true}));
  drawPins();
  const near = ponds.filter(p => Math.hypot((p.lat - loc.lat) * 111, (p.lon - loc.lon) * 72) < 20).map(p => [p.lat, p.lon]);
  if(near.length) map.fitBounds([[loc.lat, loc.lon], ...near], {padding: [30, 30], maxZoom: 13});
}
/* Overpass : serveur principal puis miroir, 15 s chacun */
async function overpass(q){
  for(const url of ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]){
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 15000);
    try{
      const r = await fetch(url, {method: "POST", signal: ctl.signal, body: "data=" + encodeURIComponent(q), headers: {"Content-Type": "application/x-www-form-urlencoded"}});
      if(r.ok) return await r.json();
    }catch{} finally{ clearTimeout(t); }
  }
  throw new Error("overpass");
}
function drawPins(){
  pondLayer.clearLayers(); pins = {};
  ponds.forEach(p => {
    const m = L.marker([p.lat, p.lon], {title: p.name, icon: L.divIcon({className: "", html: `<div class="pin ${p.curated ? "" : "osm"}${p.reported ? " rep" : ""}"></div>`, iconSize: p.curated ? [30, 30] : [22, 22]})});
    m.bindTooltip(p.name, {direction: "top", offset: [0, -14]});
    m.on("click", () => { pondId = pondId === p.id ? null : p.id; render(); });
    m.addTo(pondLayer); pins[p.id] = m;
  });
  renderPins();
}
function renderPins(){
  if(!H) return;
  ponds.forEach(p => {
    const el = pins[p.id]?.getElement(); if(!el) return;
    const s = score(sel, p.id).s, d = el.querySelector(".pin");
    d.textContent = s; d.className = `pin ${p.curated ? "" : "osm"} ${p.reported ? "rep" : ""} ${cls(s)} ${p.id === pondId ? "on" : ""}`;
    pins[p.id].setZIndexOffset(p.id === pondId ? 1000 : p.curated ? 500 : 0);
  });
}
function renderPondCard(){
  const p = ponds.find(x => x.id === pondId);
  if(!p){ $("pondcard").innerHTML = `<p class="muted">Touchez un étang sur la carte pour voir sa fiche et adapter la note à ce plan d'eau.</p>`; return; }
  const r = score(sel, p.id);
  $("pondcard").innerHTML = `<div class="label">${esc(p.near || "")}${p.approx ? " · position approximative" : ""}${p.reported ? " · signalé par vous, en attente" : ""}</div><h4>${esc(p.name)}</h4>
    <dl class="specs">${p.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}<div><dt>Note à ${r.h} h</dt><dd>${r.s} / 100</dd></div></dl>
    <div class="links">
      <a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}" target="_blank" rel="noopener">Itinéraire</a>
      ${p.site ? `<a href="${p.site}" target="_blank" rel="noopener">Site de l'étang</a>` : ""}
      <button class="ghost" type="button" id="useInCatch">Noter une prise ici</button>
    </div>`;
  $("useInCatch").onclick = () => { $("cPond").value = p.name; $("cWeight").focus(); };
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));

/* ---------- Carnet de prises ---------- */
function catches(){ return store.get("catches", []); }
function catchHours(){
  const s = new Set(); if(!H) return s;
  catches().forEach(c => { const k = H.time.indexOf(c.date.slice(0, 13) + ":00"); if(k >= 0) s.add(k); });
  return s;
}
function renderCatches(){
  const list = catches().slice().sort((a, b) => b.date.localeCompare(a.date));
  $("catches").innerHTML = list.length ? list.map(c => {
    const d = new Date(c.date);
    const meteo = c.p ? `${c.p} hPa (${c.tr > 0 ? "+" : ""}${c.tr}), vent ${c.wind}, note ${c.score}` : "météo non disponible pour cette date";
    return `<li><span><b>${d.toLocaleDateString("fr-FR", {day: "numeric", month: "short"})} ${d.getHours()} h ${String(d.getMinutes()).padStart(2, "0")}</b> · ${esc(c.pond)}${c.weight ? ` · ${c.weight} kg` : ""}${c.bait ? ` · ${esc(c.bait)}` : ""}</span>
      <button type="button" data-del="${c.id}" aria-label="Supprimer cette prise">Supprimer</button><small>${meteo}</small></li>`;
  }).join("") : `<li><span class="muted">Aucune prise pour l'instant. Notez la prochaine : au fil des sorties, vous verrez quelles conditions marchent sur votre étang.</span></li>`;
}
$("catchForm").addEventListener("submit", e => {
  e.preventDefault();
  const date = $("cDate").value; if(!date) return;
  const c = {id: Date.now(), date, pond: $("cPond").value.trim(), weight: $("cWeight").value, bait: $("cBait").value.trim()};
  const k = H ? H.time.indexOf(date.slice(0, 13) + ":00") : -1;
  if(k >= 6){ const r = score(k); Object.assign(c, {p: r.p, tr: Math.round(r.tr), wind: `${r.dn} ${r.w} km/h`, score: r.s}); }
  store.set("catches", [...catches(), c]);
  $("cWeight").value = ""; $("cBait").value = "";
  renderCatches(); render();
});
$("catches").addEventListener("click", e => {
  const id = e.target.dataset?.del; if(!id) return;
  store.set("catches", catches().filter(c => String(c.id) !== id)); renderCatches(); render();
});

/* ---------- Recherche de lieu ---------- */
$("searchForm").addEventListener("submit", async e => {
  e.preventDefault();
  const q = $("q").value.trim(); if(!q) return;
  const ul = $("results");
  try{
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=fr&countryCode=FR`);
    const j = await r.json();
    const res = j.results || [];
    ul.innerHTML = res.length ? res.map((x, k) => `<li><button type="button" data-k="${k}">${esc(x.name)}${x.admin2 ? ", " + esc(x.admin2) : ""}</button></li>`).join("") : `<li class="muted" style="padding:8px">Aucun lieu trouvé.</li>`;
    ul.hidden = false;
    ul.onclick = ev => { const b = ev.target.closest("button"); if(!b) return; const x = res[+b.dataset.k];
      setLoc({name: x.name + (x.admin2 ? ` (${x.admin2})` : ""), lat: x.latitude, lon: x.longitude}); ul.hidden = true; $("q").value = ""; };
  }catch{ ul.innerHTML = `<li class="muted" style="padding:8px">Recherche indisponible pour le moment.</li>`; ul.hidden = false; }
});
$("geo").addEventListener("click", () => {
  if(!navigator.geolocation){ $("place").textContent = "La géolocalisation n'est pas disponible sur cet appareil."; return; }
  navigator.geolocation.getCurrentPosition(
    pos => setLoc({name: "Ma position", lat: +pos.coords.latitude.toFixed(4), lon: +pos.coords.longitude.toFixed(4)}),
    () => { $("place").textContent = "Position refusée. Cherchez votre ville à la place."; },
    {enableHighAccuracy: false, timeout: 10000});
});
function setLoc(l){ loc = l; store.set("loc", l); pondId = null; loadWeather(); loadPonds(); }

/* ---------- Signaler un étang ---------- */
const REPO = "noamgille-sketch/carpometre";
function reports(){ return store.get("reports", []); }
let tempMarker = null;
$("reportBtn").addEventListener("click", () => {
  if(!map) return;
  pondId = null; renderPins();
  $("pondcard").innerHTML = `<div class="label">Signaler un étang · étape 1 sur 2</div><h4>Touchez la carte à l'endroit de l'étang</h4>
    <p class="muted">Zoomez avec la molette ou deux doigts pour placer le point précisément.</p>
    <div class="links"><button type="button" class="ghost" id="rCancel">Annuler</button></div>`;
  $("rCancel").onclick = cancelReport;
  $("map").classList.add("placing");
  $("map").scrollIntoView({behavior: "smooth", block: "center"});
  map.once("click", e => { $("map").classList.remove("placing"); reportForm(e.latlng); });
});
function cancelReport(){
  map.off("click"); $("map").classList.remove("placing");
  if(tempMarker){ tempMarker.remove(); tempMarker = null; }
  renderPondCard();
}
function reportForm(ll){
  if(tempMarker) tempMarker.remove();
  tempMarker = L.marker(ll, {draggable: true, icon: L.divIcon({className: "", html: `<div class="pin rep">+</div>`, iconSize: [30, 30]})}).addTo(map);
  $("pondcard").innerHTML = `<div class="label">Signaler un étang · étape 2 sur 2</div><h4>Les infos que vous connaissez</h4>
    <form class="rform" id="rForm">
      <div><label for="rName">Nom de l'étang</label><input id="rName" required maxlength="80" placeholder="Étang des Saules"></div>
      <div><label for="rType">Type</label><select id="rType"><option>Privé</option><option>Public / AAPPMA</option><option>Carpodrome</option><option>Je ne sais pas</option></select></div>
      <div><label for="rDepth">Profondeur moyenne (m)</label><input id="rDepth" type="number" step="0.5" min="0" max="40"></div>
      <div><label for="rNight">Pêche de nuit</label><select id="rNight"><option>Je ne sais pas</option><option>Autorisée</option><option>Interdite</option></select></div>
      <div class="full"><label for="rPrice">Tarifs</label><input id="rPrice" maxlength="80" placeholder="15 € la journée"></div>
      <div class="full"><label for="rNote">Remarques</label><textarea id="rNote" rows="2" maxlength="300" placeholder="Accès, postes, poissons…"></textarea></div>
      <div class="full links"><button type="submit">Ajouter l'étang</button><button type="button" class="ghost" id="rCancel">Annuler</button></div>
    </form><p class="note">Vous pouvez faire glisser le point pour l'ajuster.</p>`;
  $("rCancel").onclick = cancelReport;
  $("rName").focus();
  $("rForm").onsubmit = e => {
    e.preventDefault();
    const pos = tempMarker.getLatLng(), depth = parseFloat($("rDepth").value);
    const r = {id: "rep" + Date.now(), name: $("rName").value.trim(), near: "", lat: +pos.lat.toFixed(5), lon: +pos.lng.toFixed(5),
      depth: isNaN(depth) ? null : depth, open: null,
      specs: [["Type", $("rType").value], ["Profondeur", isNaN(depth) ? "Non renseignée" : depth + " m"], ["Pêche de nuit", $("rNight").value], ["Tarifs", $("rPrice").value.trim() || "Non renseignés"]],
      note: $("rNote").value.trim()};
    store.set("reports", [...reports(), r]);
    tempMarker.remove(); tempMarker = null;
    ponds.push({...r, curated: false, reported: true}); drawPins();
    pondId = r.id; render();
    shareReport(r);
  };
}
function shareReport(r){
  const body = `**${r.name}**\n\nPosition : ${r.lat}, ${r.lon}\nhttps://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lon}#map=16/${r.lat}/${r.lon}\n\n` +
    r.specs.map(([k, v]) => `- ${k} : ${v}`).join("\n") + (r.note ? `\n\nRemarques : ${r.note}` : "");
  const url = `https://github.com/${REPO}/issues/new?title=${encodeURIComponent("Nouvel étang : " + r.name)}&labels=etang&body=${encodeURIComponent(body)}`;
  const box = document.createElement("div");
  box.className = "lock";
  box.innerHTML = `<b>Ajouté sur votre carte.</b> Pour qu'il apparaisse chez tout le monde, envoyez-le :
    <div class="links" style="margin-top:8px"><a href="${url}" target="_blank" rel="noopener">Envoyer via GitHub</a><button type="button" class="ghost" id="rCopy">Copier les infos</button></div>`;
  $("pondcard").appendChild(box);
  $("rCopy").onclick = async () => { try{ await navigator.clipboard.writeText(body); $("rCopy").textContent = "Copié"; }catch{ $("rCopy").textContent = "Copie impossible"; } };
}

/* ---------- Appli installable ---------- */
let installEvt = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; $("install").hidden = false; });
$("install").addEventListener("click", async () => { if(!installEvt) return; installEvt.prompt(); await installEvt.userChoice; installEvt = null; $("install").hidden = true; });
if("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));

/* ---------- Événements ---------- */
$("bars").addEventListener("click", e => { const b = e.target.closest(".bar"); if(b){ sel = +b.dataset.i; renderSel(); } });
$("days").addEventListener("click", e => { const b = e.target.closest("button"); if(!b) return; day = +b.dataset.d; renderDays(); sel = -1; render(); });

/* ---------- Démarrage ---------- */
(function start(){
  const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  $("cDate").value = now.toISOString().slice(0, 16);
  renderCatches();
  if(window.L) initMap(); else $("map").innerHTML = `<p class="muted" style="padding:16px">La carte n'a pas pu se charger.</p>`;
  loadWeather();
  if(map) loadPonds();
})();
