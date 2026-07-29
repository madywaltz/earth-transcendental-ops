/* ESPECTRO Earth Transcendental Ops v2.2 hardened */
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNzRjZTkzNC05M2UwLTRlNDItOWU0My1hYjk5YjFiNTNhYTMiLCJpZCI6MjU5LCJzdWIiOiJDZXNpdW1KUyIsImlzcyI6Imh0dHBzOi8vYXBpLmNlc2l1bS5jb20iLCJhdWQiOiIxLjE0MyBSZWxlYXNlIC0gRGVsZXRlIG9uIFNlcHRlbWJlciAxLCAyMDI2IiwiaWF0IjoxNzgyMzY4NzY4fQ.kDcFqK7jTTloOcBbwb-epSQGd1Lu12_hRuqk1XRE_H8";

const S = {
  L: {},
  E: { f: [], q: [], e: [], s: [], i: null },
  iso: null,
  iss: false,
  perf: false,
  gt: null,
  go: false,
  tour: false,
  booting: false,
  ready: false,
};

const LD = [
  { id: "flights", n: "ADS-B", c: "#00e5ff", m: "B", a: true },
  { id: "quakes", n: "USGS", c: "#ff2d55", m: "C", a: true },
  { id: "eonet", n: "EONET", c: "#f59e0b", m: "D", a: true },
  { id: "iss", n: "ISS", c: "#a855f7", m: "E", a: true },
  { id: "sats", n: "Sats", c: "#22c55e", m: "F", a: false },
];

let V, lf, lm, ck;

const set = (p, m) => {
  if (lf) lf.style.width = p + "%";
  if (m && lm) lm.textContent = m;
};

const toast = (m, t = 2200) => {
  const el = document.getElementById("ts");
  if (!el) return;
  el.textContent = m;
  el.classList.add("on");
  setTimeout(() => el.classList.remove("on"), t);
};

const P = (v) => (v && typeof v.getValue === "function" ? v.getValue() : v);

function clearEntities(arr) {
  if (!V || !arr) return;
  for (const e of arr) {
    try {
      V.entities.remove(e);
    } catch (_) {}
  }
  arr.length = 0;
}

async function init() {
  if (S.booting || S.ready) return;
  S.booting = true;
  lf = document.getElementById("lf");
  lm = document.getElementById("lm");
  ck = document.getElementById("ck");

  set(8, "Cesium…");
  V = new Cesium.Viewer("c", {
    animation: false,
    timeline: false,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    infoBox: false,
    selectionIndicator: true,
    terrain: Cesium.Terrain.fromWorldTerrain(),
    requestRenderMode: false,
  });

  V.scene.globe.enableLighting = true;
  V.scene.skyAtmosphere.show = true;
  V.scene.fog.enabled = true;
  V.scene.fog.density = 0.00012;
  V.scene.screenSpaceCameraController.minimumZoomDistance = 150;
  V.scene.screenSpaceCameraController.maximumZoomDistance = 4.2e7;
  V.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-40, 12, 22e6),
    orientation: {
      heading: 0.3,
      pitch: -Cesium.Math.PI_OVER_TWO + 0.5,
      roll: 0,
    },
  });

  set(25, "HUD");
  ui();
  keys();
  clock();
  fps();
  coords();

  set(45, "feeds");
  await Promise.allSettled([quakes(), eonet(), iss(), flights()]);

  set(70, "orbitals");
  sats().catch(() => {});

  set(88, "atmos");
  brief();
  setInterval(brief, 45e3);
  setInterval(() => {
    if (S.L.flights?.a) flights(true);
  }, 15e3);
  setInterval(() => {
    if (S.L.iss?.a) iss();
  }, 5e3);
  setInterval(() => {
    if (S.L.quakes?.a) quakes(true);
  }, 18e4);

  V.scene.postRender.addEventListener(() => {
    const h = V.camera.positionCartographic.height;
    const el = document.getElementById("am");
    if (el)
      el.style.bottom =
        Math.min(94, Math.max(6, (Math.log10(h + 1) / 7.6) * 100)) + "%";
  });

  set(100, "online");
  S.booting = false;
  S.ready = true;
  setTimeout(() => {
    const ld = document.getElementById("ld");
    if (ld) ld.classList.add("done");
    toast("TRANSCENDENTAL ONLINE");
    intro();
    hashR();
  }, 420);
}

function ui() {
  const list = document.getElementById("ll");
  if (!list) return;
  list.innerHTML = "";
  LD.forEach((x) => {
    S.L[x.id] = { ...x };
    const row = document.createElement("div");
    row.className = "lr" + (x.a ? " on" : "");
    row.dataset.id = x.id;
    row.innerHTML = `<div class="sw" style="background:${x.c}"></div><span>${x.n}</span><span class="lm">${x.m}</span><div class="tg"></div>`;
    row.onclick = () => tog(x.id);
    list.appendChild(row);
  });
  cnt();
}

function tog(id) {
  const L = S.L[id];
  if (!L) return;
  L.a = !L.a;
  const row = document.querySelector(`.lr[data-id="${id}"]`);
  if (row) row.classList.toggle("on", L.a);
  const show = !!L.a;
  if (id === "flights") S.E.f.forEach((e) => (e.show = show));
  if (id === "quakes") S.E.q.forEach((e) => (e.show = show));
  if (id === "eonet") S.E.e.forEach((e) => (e.show = show));
  if (id === "iss" && S.E.i) S.E.i.show = show;
  if (id === "sats") S.E.s.forEach((e) => (e.show = show));
  cnt();
  toast(L.n + " " + (show ? "ON" : "OFF"));
  hashS();
}

function cnt() {
  const lc = document.getElementById("lc");
  const ec = document.getElementById("ec");
  if (lc)
    lc.textContent =
      Object.values(S.L).filter((l) => l.a).length + "L";
  if (ec)
    ec.textContent =
      S.E.f.length +
      S.E.q.length +
      S.E.e.length +
      S.E.s.length +
      (S.E.i ? 1 : 0) +
      "E";
}

async function quakes(quiet) {
  try {
    const r = await fetch(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
      { signal: AbortSignal.timeout(12000) }
    );
    if (!r.ok) return;
    const d = await r.json();
    clearEntities(S.E.q);
    (d.features || []).slice(0, 140).forEach((f) => {
      const [lon, lat, dep] = f.geometry.coordinates;
      const mag = f.properties.mag || 0;
      const e = V.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          lon,
          lat,
          Math.max(0, -dep * 1e3)
        ),
        point: {
          pixelSize: 3.5 + mag * 2.4,
          color: Cesium.Color.fromCssColorString(
            mag >= 5 ? "#ff2d55" : mag >= 4 ? "#f59e0b" : "#fbbf24"
          ).withAlpha(0.9),
          outlineColor: Cesium.Color.WHITE.withAlpha(0.2),
          outlineWidth: 1,
          scaleByDistance: new Cesium.NearFarScalar(1e3, 1.2, 8e6, 0.3),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: mag >= 4.5 ? `M${mag.toFixed(1)}` : "",
          font: "9px JetBrains Mono",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -9),
          scaleByDistance: new Cesium.NearFarScalar(1e3, 1, 4e6, 0),
        },
        properties: {
          type: "quake",
          mag,
          place: f.properties.place || "",
        },
      });
      e.show = S.L.quakes?.a !== false;
      S.E.q.push(e);
    });
    if (!quiet) toast("USGS " + S.E.q.length);
    cnt();
  } catch (_) {}
}

async function eonet(quiet) {
  try {
    const r = await fetch(
      "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=40",
      { signal: AbortSignal.timeout(12000) }
    );
    if (!r.ok) return;
    const d = await r.json();
    clearEntities(S.E.e);
    (d.events || []).forEach((ev) => {
      const g = ev.geometry?.[ev.geometry.length - 1];
      if (!g || !g.coordinates) return;
      let lon, lat;
      if (g.type === "Point") {
        lon = g.coordinates[0];
        lat = g.coordinates[1];
      } else if (Array.isArray(g.coordinates[0])) {
        lon = g.coordinates[0][0];
        lat = g.coordinates[0][1];
      } else return;
      const cat = ev.categories?.[0]?.title || "E";
      const col = /fire/i.test(cat)
        ? "#ff2d55"
        : /storm/i.test(cat)
          ? "#38bdf8"
          : /volcano/i.test(cat)
            ? "#f59e0b"
            : "#a855f7";
      const e = V.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        point: {
          pixelSize: 7,
          color: Cesium.Color.fromCssColorString(col).withAlpha(0.9),
          outlineColor: Cesium.Color.WHITE.withAlpha(0.3),
          outlineWidth: 1,
          scaleByDistance: new Cesium.NearFarScalar(1e3, 1.1, 6e6, 0.25),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: cat,
          font: "8px JetBrains Mono",
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -11),
          scaleByDistance: new Cesium.NearFarScalar(1e3, 1, 3e6, 0),
        },
        properties: { type: "eonet", title: ev.title || "", cat },
      });
      e.show = S.L.eonet?.a !== false;
      S.E.e.push(e);
    });
    if (!quiet) toast("EONET " + S.E.e.length);
    cnt();
  } catch (_) {}
}

async function iss() {
  try {
    const r = await fetch(
      "https://api.wheretheiss.at/v1/satellites/25544",
      { signal: AbortSignal.timeout(8000) }
    );
    if (!r.ok) return;
    const d = await r.json();
    const pos = Cesium.Cartesian3.fromDegrees(
      d.longitude,
      d.latitude,
      (d.altitude || 420) * 1e3
    );
    if (!S.E.i) {
      S.E.i = V.entities.add({
        id: "ISS",
        position: pos,
        point: {
          pixelSize: 11,
          color: Cesium.Color.fromCssColorString("#a855f7"),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: "ISS",
          font: "bold 11px Orbitron",
          fillColor: Cesium.Color.fromCssColorString("#e9d5ff"),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -16),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        properties: { type: "iss", alt: d.altitude },
      });
    } else {
      S.E.i.position = pos;
      if (S.E.i.properties) S.E.i.properties.alt = d.altitude;
    }
    S.E.i.show = S.L.iss?.a !== false;
    if (S.iss)
      V.camera.lookAt(pos, new Cesium.HeadingPitchRange(0, -0.48, 1.4e6));
    cnt();
  } catch (_) {}
}

async function flights(quiet) {
  try {
    let st = [];
    try {
      const r = await fetch("https://opensky-network.org/api/states/all", {
        signal: AbortSignal.timeout(9000),
      });
      if (r.ok) {
        const j = await r.json();
        st = (j.states || [])
          .filter((s) => s[5] != null && s[6] != null)
          .slice(0, 450);
      }
    } catch (_) {}
    clearEntities(S.E.f);
    st.forEach((s) => {
      const lon = s[5],
        lat = s[6],
        alt = s[13] || s[7] || 0;
      if (alt < 0) return;
      const call = (s[1] || s[0] || "").trim();
      const e = V.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          lon,
          lat,
          Math.max(alt, 25)
        ),
        point: {
          pixelSize: 3.5,
          color: Cesium.Color.fromCssColorString("#00e5ff").withAlpha(0.85),
          outlineColor: Cesium.Color.WHITE.withAlpha(0.15),
          outlineWidth: 1,
          scaleByDistance: new Cesium.NearFarScalar(1e3, 1.2, 5e6, 0.22),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: call.length > 1 && alt > 1200 ? call : "",
          font: "8px JetBrains Mono",
          fillColor: Cesium.Color.CYAN,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -7),
          scaleByDistance: new Cesium.NearFarScalar(400, 1, 1e6, 0),
        },
        properties: { type: "flight", call, alt },
      });
      e.show = S.L.flights?.a !== false;
      S.E.f.push(e);
    });
    if (!quiet && st.length) toast("ADS-B " + S.E.f.length);
    cnt();
  } catch (_) {}
}

async function sats() {
  try {
    const r = await fetch(
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=json",
      { signal: AbortSignal.timeout(10000) }
    );
    if (!r.ok) return;
    const a = await r.json();
    clearEntities(S.E.s);
    a.slice(0, 20).forEach((sat) => {
      const e = V.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          (Math.random() - 0.5) * 360,
          (Math.random() - 0.5) * 70,
          4e5 + Math.random() * 5e5
        ),
        point: {
          pixelSize: 2,
          color: Cesium.Color.fromCssColorString("#22c55e").withAlpha(0.7),
          scaleByDistance: new Cesium.NearFarScalar(1e4, 1, 2e7, 0.12),
        },
        label: {
          text: sat.OBJECT_NAME || "",
          font: "7px JetBrains Mono",
          fillColor: Cesium.Color.LAWNGREEN.withAlpha(0.65),
          scaleByDistance: new Cesium.NearFarScalar(1e4, 1, 3e6, 0),
          pixelOffset: new Cesium.Cartesian2(0, -5),
        },
        properties: { type: "sat", name: sat.OBJECT_NAME },
      });
      e.show = S.L.sats?.a === true;
      S.E.s.push(e);
    });
    cnt();
  } catch (_) {}
}

function brief() {
  const it = [];
  S.E.q
    .map((e) => e.properties)
    .filter((p) => p && (P(p.mag) || 0) >= 4.5)
    .sort((a, b) => (P(b.mag) || 0) - (P(a.mag) || 0))
    .slice(0, 3)
    .forEach((p) => {
      const m = P(p.mag);
      it.push({
        t: `M${m.toFixed(1)}`,
        s: P(p.place) || "—",
        l: m >= 6 ? "c" : "w",
      });
    });
  S.E.e.slice(0, 3).forEach((e) => {
    const p = e.properties;
    if (p) it.push({ t: P(p.title) || "E", s: P(p.cat) || "", l: "w" });
  });
  if (S.E.i) it.unshift({ t: "ISS", s: "live", l: "" });
  it.push({ t: S.E.f.length + " voos", s: "ADS-B", l: "" });
  const bl = document.getElementById("bl");
  if (bl)
    bl.innerHTML =
      it
        .map(
          (i) =>
            `<div class="bi ${i.l}"><div class="t">${i.t}</div><div class="s">${i.s}</div></div>`
        )
        .join("") || '<div class="bi"><div class="s">…</div></div>';
}

function intro() {
  V.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-46.63, -23.55, 2.4e6),
    orientation: { heading: 0.12, pitch: -0.48, roll: 0 },
    duration: 3.5,
    easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
  });
}

function hero() {
  V.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(0, 18, 16e6),
    orientation: {
      heading: 0,
      pitch: -Cesium.Math.PI_OVER_TWO + 0.32,
      roll: 0,
    },
    duration: 2.5,
  });
  toast("HERO");
}

function tour() {
  if (S.tour) return;
  S.tour = true;
  const st = [
    { lon: -74, lat: 40.7, h: 1e6, n: "NYC" },
    { lon: 139.7, lat: 35.7, h: 0.75e6, n: "TYO" },
    { lon: 2.35, lat: 48.85, h: 0.65e6, n: "PAR" },
    { lon: -46.63, lat: -23.55, h: 0.9e6, n: "SAO" },
    { lon: 31.2, lat: 30, h: 0.8e6, n: "CAI" },
    { lon: 151.2, lat: -33.87, h: 0.85e6, n: "SYD" },
  ];
  let i = 0;
  const next = () => {
    if (!S.tour || i >= st.length) {
      S.tour = false;
      toast("TOUR OK");
      return;
    }
    const s = st[i++];
    toast(s.n);
    V.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(s.lon, s.lat, s.h),
      orientation: {
        heading: Math.random() * 0.25 - 0.12,
        pitch: -0.48,
        roll: 0,
      },
      duration: 3.5,
      complete: () => setTimeout(next, 1200),
    });
  };
  next();
}

function fISS() {
  S.iss = !S.iss;
  const b = document.getElementById("bI");
  if (b) b.textContent = S.iss ? "STOP" : "ISS";
  toast(S.iss ? "TRACK ISS" : "FREE");
  hashS();
}

async function google() {
  if (S.go && S.gt) {
    V.scene.primitives.remove(S.gt);
    S.gt = null;
    S.go = false;
    V.scene.globe.show = true;
    toast("G3D OFF");
    document.querySelector('.mod[data-m="G"]')?.classList.remove("on");
    return;
  }
  toast("G3D…");
  try {
    const t = await Cesium.createGooglePhotorealistic3DTileset({
      onlyUsingWithGoogleGeocoder: true,
    });
    V.scene.primitives.add(t);
    S.gt = t;
    S.go = true;
    V.scene.globe.show = false;
    document.querySelector('.mod[data-m="G"]')?.classList.add("on");
    toast("G ON");
  } catch (_) {
    toast("G needs key");
  }
}

function keys() {
  const bind = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.onclick = fn;
  };
  bind("bH", hero);
  bind("bT", tour);
  bind("bI", fISS);
  bind("bHo", () => {
    S.iss = false;
    V.camera.flyHome(2);
  });
  bind("bS", () => {
    V.render();
    const a = document.createElement("a");
    a.href = V.scene.canvas.toDataURL("image/png");
    a.download = "ops-" + Date.now() + ".png";
    a.click();
    toast("PNG");
  });
  bind("bIso", () => {
    const ids = Object.keys(S.L);
    const c = S.iso ? ids.indexOf(S.iso) : -1;
    const n = ids[(c + 1) % ids.length];
    ids.forEach((id) => {
      if (S.L[id].a !== (id === n)) tog(id);
    });
    S.iso = n;
    toast("ISO " + S.L[n].n);
  });
  bind("bP", () => {
    S.perf = !S.perf;
    V.scene.requestRenderMode = S.perf;
    toast(S.perf ? "PERF" : "HQ");
  });
  bind("bSb", () =>
    document.getElementById("sb")?.classList.toggle("hide")
  );
  bind("bG", google);
  bind("bC", cmd);
  bind("bO", () =>
    window.open(
      "https://maw-vitrine-plaza.vercel.app/earth-ops.html",
      "_blank"
    )
  );

  document.querySelectorAll(".mod").forEach((m) => {
    m.onclick = () => {
      const id = m.dataset.m;
      document
        .querySelectorAll(".mod")
        .forEach((x) => x.classList.remove("on"));
      m.classList.add("on");
      if (id === "A") hero();
      if (id === "B" && !S.L.flights.a) tog("flights");
      if (id === "C" && !S.L.quakes.a) tog("quakes");
      if (id === "D" && !S.L.eonet.a) tog("eonet");
      if (id === "E") fISS();
      if (id === "F" && !S.L.sats.a) tog("sats");
      if (id === "G") google();
    };
  });

  const h = new Cesium.ScreenSpaceEventHandler(V.scene.canvas);
  h.setInputAction((c) => {
    const p = V.scene.pick(c.position);
    if (Cesium.defined(p) && p.id && p.id.properties) show(p.id);
    else document.getElementById("op")?.classList.remove("on");
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;
    const k = e.key.toLowerCase();
    if (k === "h") hero();
    if (k === "t") tour();
    if (k === "i") fISS();
    if (k === "g") google();
    if ((e.metaKey || e.ctrlKey) && k === "k") {
      e.preventDefault();
      cmd();
    }
    if (k === "escape")
      document.getElementById("cm")?.classList.remove("on");
  });
}

function show(ent) {
  const p = ent.properties;
  const b = document.getElementById("ob");
  if (!b) return;
  let h = `<div class="ot">${ent.label?.text || ent.id || "?"}</div>`;
  if (p) {
    const t = P(p.type);
    h += `<div class="or"><span>type</span><span>${t}</span></div>`;
    if (t === "quake")
      h += `<div class="or"><span>M</span><span>${(P(p.mag) || 0).toFixed?.(1) || P(p.mag)}</span></div><div class="or"><span>loc</span><span>${P(p.place) || "—"}</span></div>`;
    if (t === "flight")
      h += `<div class="or"><span>call</span><span>${P(p.call)}</span></div><div class="or"><span>alt</span><span>${Math.round(P(p.alt) || 0)}m</span></div>`;
    if (t === "iss")
      h += `<div class="or"><span>alt</span><span>${Math.round(P(p.alt) || 0)}km</span></div>`;
    if (t === "eonet")
      h += `<div class="or"><span>ev</span><span>${P(p.title)}</span></div>`;
  }
  b.innerHTML = h;
  document.getElementById("op")?.classList.add("on");
}

function cmd() {
  const cm = document.getElementById("cm");
  const i = document.getElementById("ci");
  if (!cm || !i) return;
  cm.classList.add("on");
  i.value = "";
  i.focus();
  const cs = [
    { k: "hero", d: "Hero", r: hero },
    { k: "tour", d: "Tour", r: tour },
    { k: "iss", d: "ISS", r: fISS },
    { k: "google", d: "G3D", r: google },
    { k: "flights", d: "ADS-B", r: () => tog("flights") },
    { k: "quakes", d: "USGS", r: () => tog("quakes") },
    { k: "sp", d: "São Paulo", r: () => fly(-46.63, -23.55, 8e5) },
    { k: "tyo", d: "Tokyo", r: () => fly(139.7, 35.7, 8e5) },
    { k: "nyc", d: "NYC", r: () => fly(-74, 40.7, 8e5) },
    {
      k: "origem",
      d: "Origin",
      r: () =>
        window.open(
          "https://maw-vitrine-plaza.vercel.app/earth-ops.html",
          "_blank"
        ),
    },
  ];
  const ren = (q) => {
    const f = q
      ? cs.filter(
          (c) => c.k.includes(q) || c.d.toLowerCase().includes(q)
        )
      : cs;
    const cr = document.getElementById("cr");
    if (!cr) return;
    cr.innerHTML = f
      .map(
        (c) =>
          `<div class="ci" data-k="${c.k}"><span>${c.d}</span><kbd>${c.k}</kbd></div>`
      )
      .join("");
    document.querySelectorAll(".ci").forEach((el) => {
      el.onclick = () => {
        const c = cs.find((x) => x.k === el.dataset.k);
        if (c) c.r();
        cm.classList.remove("on");
      };
    });
  };
  ren("");
  i.oninput = () => ren(i.value.toLowerCase());
  i.onkeydown = (e) => {
    if (e.key === "Escape") cm.classList.remove("on");
    if (e.key === "Enter") {
      const q = i.value.trim().toLowerCase();
      const c = cs.find(
        (x) => x.k.includes(q) || x.d.toLowerCase().includes(q)
      );
      if (c) c.r();
      cm.classList.remove("on");
    }
  };
}

function fly(lon, lat, h) {
  V.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, h),
    orientation: { heading: 0, pitch: -0.48, roll: 0 },
    duration: 2.5,
  });
}

function clock() {
  const t = () => {
    if (ck)
      ck.textContent =
        new Date().toISOString().replace("T", " ").slice(0, 19) + "Z";
  };
  t();
  setInterval(t, 1000);
}

function fps() {
  let f = 0,
    l = performance.now();
  V.scene.postRender.addEventListener(() => {
    f++;
    const n = performance.now();
    if (n - l >= 1000) {
      const el = document.getElementById("fp");
      if (el) el.textContent = f + "f";
      f = 0;
      l = n;
    }
  });
}

function coords() {
  const el = document.getElementById("cd");
  if (!el) return;
  const h = new Cesium.ScreenSpaceEventHandler(V.scene.canvas);
  h.setInputAction((m) => {
    const c = V.camera.pickEllipsoid(
      m.endPosition,
      V.scene.globe.ellipsoid
    );
    if (c) {
      const o = Cesium.Cartographic.fromCartesian(c);
      el.textContent = `${Cesium.Math.toDegrees(o.latitude).toFixed(3)} ${Cesium.Math.toDegrees(o.longitude).toFixed(3)} · ${Math.round(V.camera.positionCartographic.height / 1e3)}km`;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

function hashS() {
  const a = Object.entries(S.L)
    .filter(([, l]) => l.a)
    .map(([id]) => id)
    .join(",");
  const h = `l=${a}${S.iss ? "&i=1" : ""}`;
  if (location.hash.slice(1) !== h) history.replaceState(null, "", "#" + h);
}

function hashR() {
  const h = location.hash.slice(1);
  if (!h) return;
  const p = new URLSearchParams(h);
  const ls = (p.get("l") || "").split(",").filter(Boolean);
  if (ls.length)
    Object.keys(S.L).forEach((id) => {
      const w = ls.includes(id);
      if (S.L[id].a !== w) tog(id);
    });
  if (p.get("i") === "1" && !S.iss) fISS();
}

init().catch((e) => {
  console.error(e);
  if (lm) lm.textContent = "ERR";
});
