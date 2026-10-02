/* ============================================================
   MAPA TÁCTICO — MapLibre GL
   Sustituye la traza SVG generada que tuvo el proyecto hasta el
   15/09/2026. Cartografía: OpenFreeMap (OpenMapTiles), sin API key.

   Requiere red y servidor HTTP: ya no basta abrir index.html con
   file://. Las teselas y el CDN de MapLibre viajan por la red.

   El resto del tablero no depende de este archivo: columna de
   métricas, panel de IA y tokens siguen intactos.
   ============================================================ */

/* Guadalajara — la misma ciudad que declara el encabezado. */
const CENTER = [-103.3496, 20.6597];

/* Oscuro = sala de control. Día = Bright de OpenFreeMap (vectorial,
   no satélite). Cambiar de estilo borra capas propias: hay que
   reaplicarlas en style.load. */
const STYLES = {
  dark: "https://tiles.openfreemap.org/styles/dark",
  day:  "https://tiles.openfreemap.org/styles/bright"
};

let mapStyle = "dark";

/* Los colores salen de tokens.css: el mapa no introduce paleta propia. */
const token = name => getComputedStyle(document.documentElement)
  .getPropertyValue(name).trim();

/* rem → px. Los anchos de panel viven en rem; MapLibre pide padding en px. */
const remPx = value => {
  const n = parseFloat(value);
  if(!n) return 0;
  return n * parseFloat(getComputedStyle(document.documentElement).fontSize);
};

/* La cámara se centra en el corredor libre entre paneles, no en el
   lienzo completo. Sin esto, Guadalajara y los marcadores quedarían
   debajo de las columnas flotantes. El padding derecho solo reserva
   hueco cuando hay panel derecho abierto (shell.is-right-open). */
const mapPadding = () => {
  const gap = remPx(token("--nx-panel-gap"));
  const rightOpen = document.getElementById("shell")?.classList.contains("is-right-open");
  return {
    top: gap,
    bottom: gap,
    left: remPx(token("--nx-col-left")) + gap * 2,
    right: rightOpen ? remPx(token("--nx-col-right")) + gap * 2 : gap * 2
  };
};

window.nexusRefreshMapPadding = () => {
  if(typeof map === "undefined" || !map) return;
  map.setPadding(mapPadding(), { duration: 300 });
};

const mapRoot = document.getElementById("map");

const map = new maplibregl.Map({
  container: "map-canvas",
  style: STYLES.dark,
  center: CENTER,
  zoom: 15.4,
  pitch: 60,
  bearing: -17,
  maxPitch: 85,
  padding: mapPadding(),
  attributionControl: { compact: true }
});

/* Expuesto a propósito: en una demostración conviene poder mover la
   cámara desde la consola sin tocar el archivo. */
window.nexusMap = map;

map.on("error", e => console.error("[mapa]", e && e.error ? e.error.message : e));

/* Si cambia el tamaño de fuente o la ventana, el padding en px se
   desincroniza de los rem del CSS. Reaplicar sin animar. */
window.addEventListener("resize", () => {
  map.setPadding(mapPadding(), { duration: 0 });
});

/* Extrusión + tintes de Nexus. setStyle los borra; por eso vive fuera
   del listener de load y se llama también tras cada cambio de estilo. */
function applyNexusLayers(styleId){
  if(map.getLayer("3d-buildings")) map.removeLayer("3d-buildings");

  /* Solo en oscuro: Bright ya trae su propia paleta diurna. */
  if(styleId === "dark"){
    if(map.getLayer("background")){
      map.setPaintProperty("background", "background-color", token("--nx-surface-map"));
    }
    if(map.getLayer("water")){
      map.setPaintProperty("water", "fill-color", token("--nx-map-water"));
    }
  }

  /* La huella plana de edificio estorba debajo de la extrusión. */
  if(map.getLayer("building")) map.setLayoutProperty("building", "visibility", "none");

  const buildingColor = styleId === "dark"
    ? token("--nx-map-building")
    : token("--nx-map-building-day");

  /* Altura: OpenMapTiles no siempre trae render_height. Sin respaldo,
     el mapa se vería inclinado pero sin volumen. */
  map.addLayer({
    id: "3d-buildings",
    type: "fill-extrusion",
    source: "openmaptiles",
    "source-layer": "building",
    minzoom: 14,
    paint: {
      "fill-extrusion-color": buildingColor,
      "fill-extrusion-height": [
        "case",
        ["has", "render_height"], ["to-number", ["get", "render_height"]],
        ["has", "height"],        ["to-number", ["get", "height"]],
        12
      ],
      "fill-extrusion-base": [
        "case",
        ["has", "render_min_height"], ["to-number", ["get", "render_min_height"]],
        0
      ],
      "fill-extrusion-opacity": styleId === "dark" ? 0.85 : 0.9
    }
  });

  /* Rutas de despacho / patrulla: se recrean tras cada setStyle. */
  ensureRouteLayers();
  if(activeRouteSpec){
    paintGeoRoute(activeRouteSpec);
  }
}

map.on("load", () => applyNexusLayers(mapStyle));

/* ============================================================
   ESTILO DEL MAPA — oscuro ↔ día
   ============================================================ */
(function mapStyleToggle(){
  const toggle = document.getElementById("map-style-toggle");
  if(!toggle) return;

  const label = toggle.querySelector(".mapview__label");
  const iconDay = toggle.querySelector(".mapview__icon--day");
  const iconNight = toggle.querySelector(".mapview__icon--night");

  const syncChrome = () => {
    const day = mapStyle === "day";
    toggle.setAttribute("aria-pressed", String(day));
    toggle.setAttribute("aria-label", day ? "Cambiar a vista noche" : "Cambiar a vista día");
    if(label) label.textContent = day ? "Vista noche" : "Vista día";
    if(iconDay) iconDay.hidden = day;
    if(iconNight) iconNight.hidden = !day;
    if(mapRoot) mapRoot.dataset.mapStyle = mapStyle;
  };

  syncChrome();

  toggle.addEventListener("click", () => {
    if(toggle.disabled) return;
    toggle.disabled = true;

    mapStyle = mapStyle === "dark" ? "day" : "dark";
    syncChrome();

    /* El listener va ANTES de setStyle: si Bright ya está en caché,
       style.load puede dispararse en el mismo tick y se perdería. */
    let done = false;
    const finish = () => {
      if(done) return;
      done = true;
      try{
        applyNexusLayers(mapStyle);
        map.setPadding(mapPadding(), { duration: 0 });
      }catch(err){
        console.error("[mapa] no se pudo reaplicar capas:", err);
      }
      toggle.disabled = false;
    };

    map.once("style.load", finish);
    map.setStyle(STYLES[mapStyle]);

    /* Respaldo: si el evento ya pasó, idle / timeout cierran el ciclo. */
    map.once("idle", finish);
    setTimeout(finish, 4000);
  });
})();

/* ============================================================
   MARCADORES DE DISPOSITIVO
   ============================================================ */
const ICONS={
  incidente:'<path d="M12 4 2.5 20h19L12 4Z"/><path d="M12 10v4M12 17h.01"/>',
  camara:'<path d="M3 7h11v10H3z"/><path d="m14 11 7-4v10l-7-4"/>',
  dron:'<path d="M9 9h6v6H9z"/><path d="M9 9 5 5M15 9l4-4M9 15l-4 4M15 15l4 4"/><circle cx="5" cy="5" r="1.6"/><circle cx="19" cy="5" r="1.6"/><circle cx="5" cy="19" r="1.6"/><circle cx="19" cy="19" r="1.6"/>',
  perro:'<path d="M4 14.5c0-1.8 1.2-3 3-3h1.2L9.5 9h3.2l1.4 2.5H16c1.4 0 2.5.9 2.5 2.3V17H4v-2.5Z"/><path d="M6 17v2.5M9 17v2.5M13 17v2.5M16.5 17v2.5"/><path d="M18.5 13.5 21 11.5"/><path d="M7.5 11.5V9.2"/><circle cx="8.2" cy="12.8" r=".7"/>',
  humanoide:'<circle cx="12" cy="5.5" r="2.4"/><path d="M8.5 21v-6.5a3.5 3.5 0 0 1 7 0V21"/><path d="M8.5 12.5h7"/><path d="M6.5 14.5 8.5 12.5M17.5 14.5 15.5 12.5"/>',
  arco:'<path d="M3 19V9h18v10"/><path d="M3 9h18"/><path d="M7 9v5M12 9v5M17 9v5"/><path d="M5 19h3M16 19h3"/><rect x="8" y="11" width="8" height="2.5" rx=".4"/>'
};

const LABELS={
  incidente:"Incidente",
  camara:"Cámara",
  dron:"Dron",
  perro:"Perro robot",
  humanoide:"Humanoide",
  arco:"Arco carretero"
};

const MARKERS=[
  ["camara",-103.3520,20.6726],["camara",-103.3493,20.6668],
  ["camara",-103.3419,20.6628],["camara",-103.3576,20.6592],
  ["camara",-103.3457,20.6559],
  ["dron",-103.3592,20.6630],["dron",-103.3430,20.6613],
  ["dron",-103.3510,20.6543],
  /* Dron del guion accidente (inc-0410) — no reutiliza DR-03 del caso Américas. */
  ["dron",-103.3475,20.6595],
  ["perro",-103.3536,20.6574],["perro",-103.3429,20.6643],
  ["perro",-103.3552,20.6534],
  /* Perro del guion accidente */
  ["perro",-103.3498,20.6602],
  ["humanoide",-103.3474,20.6588],["humanoide",-103.3601,20.6683],
  ["humanoide",-103.3434,20.6538],
  /* Humanoide del guion accidente */
  ["humanoide",-103.3462,20.6610],
  ["arco",-103.3466,20.6635],["arco",-103.3424,20.6675],
  ["arco",-103.3482,20.6605]
];

/* MapLibre aplica su propio position y transform al elemento que le pasas.
   Si ese elemento fuera el botón .marker, pisaría su centrado y su hover.
   Por eso el ancla es un envoltorio sin tamaño y el botón vive dentro. */
function crearElementoDeMarcador(type, index){
  const anchor = document.createElement("div");
  anchor.className = "marker-anchor";

  const button = document.createElement("button");
  button.type = "button";
  button.className = `marker marker--${type}`;
  button.setAttribute("aria-label", `${LABELS[type]} ${index}`);
  button.dataset.markerType = type;
  button.dataset.markerIndex = String(index);
  button.innerHTML = `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${ICONS[type]}</svg>`;

  anchor.appendChild(button);
  return anchor;
}

/* Incidente Américas (0172) y accidente ARC-02 (0410) — destinos de ruta. */
const INCIDENT_LL = [-103.3529, 20.6619];
const DEMO_ACCIDENT_LL = [-103.3480, 20.6628];

/* Recursos → marcador. robot/amb/drone = caso 0172; demo* = caso 0410. */
const UNIT_MARKER = {
  robot:{ type:"perro", index:1, callout:"ZM-14", lng:-103.3536, lat:20.6574 },
  amb:{ type:"humanoide", index:1, callout:"HU-07", lng:-103.3474, lat:20.6588 },
  drone:{ type:"dron", index:3, callout:"DR-03", lng:-103.3510, lat:20.6543 },
  demoRobot:{ type:"perro", index:4, callout:"ZM-22", lng:-103.3498, lat:20.6602 },
  demoAmb:{ type:"humanoide", index:4, callout:"HU-12", lng:-103.3462, lat:20.6610 },
  demoDrone:{ type:"dron", index:4, callout:"DR-09", lng:-103.3475, lat:20.6595 }
};

/* Rutas teatro hacia el incidente correspondiente. */
const UNIT_ROUTE = {
  drone:{
    kind:"air",
    colorToken:"--accent-green",
    coords:[
      [-103.3510, 20.6543],
      [-103.3529, 20.6619]
    ]
  },
  robot:{
    kind:"ground",
    colorToken:"--accent-purple",
    coords:[
      [-103.3536, 20.6574],
      [-103.3536, 20.6598],
      [-103.3529, 20.6598],
      [-103.3529, 20.6619]
    ]
  },
  amb:{
    kind:"ground",
    colorToken:"--accent-blue",
    coords:[
      [-103.3474, 20.6588],
      [-103.3474, 20.6612],
      [-103.3505, 20.6612],
      [-103.3529, 20.6612],
      [-103.3529, 20.6619]
    ]
  },
  demoDrone:{
    kind:"air",
    colorToken:"--accent-green",
    coords:[
      [-103.3475, 20.6595],
      [-103.3480, 20.6628]
    ]
  },
  demoRobot:{
    kind:"ground",
    colorToken:"--accent-purple",
    coords:[
      [-103.3498, 20.6602],
      [-103.3498, 20.6615],
      [-103.3480, 20.6615],
      [-103.3480, 20.6628]
    ]
  },
  demoAmb:{
    kind:"ground",
    colorToken:"--accent-blue",
    coords:[
      [-103.3462, 20.6610],
      [-103.3462, 20.6620],
      [-103.3480, 20.6620],
      [-103.3480, 20.6628]
    ]
  }
};

const ROUTE_SOURCE = "nexus-route";
const ROUTE_PULSE_SOURCE = "nexus-route-pulse";
const ROUTE_LAYER_GLOW = "nexus-route-glow";
const ROUTE_LAYER_LINE = "nexus-route-line";
const ROUTE_LAYER_PULSE = "nexus-route-pulse";

let activeRouteSpec = null;
let routeAnimFrame = null;
let routeDashStep = 0;
let routePulseT = 0;

function emptyLineFeature(){
  return {
    type:"Feature",
    properties:{},
    geometry:{ type:"LineString", coordinates:[] }
  };
}

function emptyPointFeature(){
  return {
    type:"Feature",
    properties:{},
    geometry:{ type:"Point", coordinates:[0, 0] }
  };
}

function ensureRouteLayers(){
  if(!map.getSource(ROUTE_SOURCE)){
    map.addSource(ROUTE_SOURCE, {
      type:"geojson",
      data:emptyLineFeature()
    });
  }
  if(!map.getSource(ROUTE_PULSE_SOURCE)){
    map.addSource(ROUTE_PULSE_SOURCE, {
      type:"geojson",
      data:emptyPointFeature()
    });
  }

  if(!map.getLayer(ROUTE_LAYER_GLOW)){
    map.addLayer({
      id:ROUTE_LAYER_GLOW,
      type:"line",
      source:ROUTE_SOURCE,
      layout:{ "line-cap":"round", "line-join":"round", visibility:"none" },
      paint:{
        "line-color":"#2d68f8",
        "line-width":10,
        "line-opacity":0.22,
        "line-blur":1.2
      }
    });
  }

  if(!map.getLayer(ROUTE_LAYER_LINE)){
    map.addLayer({
      id:ROUTE_LAYER_LINE,
      type:"line",
      source:ROUTE_SOURCE,
      layout:{ "line-cap":"round", "line-join":"round", visibility:"none" },
      paint:{
        "line-color":"#2d68f8",
        "line-width":3.5,
        "line-opacity":0.95,
        "line-dasharray":[0, 2, 2]
      }
    });
  }

  if(!map.getLayer(ROUTE_LAYER_PULSE)){
    map.addLayer({
      id:ROUTE_LAYER_PULSE,
      type:"circle",
      source:ROUTE_PULSE_SOURCE,
      layout:{ visibility:"none" },
      paint:{
        "circle-radius":5.5,
        "circle-color":"#ffffff",
        "circle-stroke-width":2.5,
        "circle-stroke-color":"#2d68f8",
        "circle-opacity":0.95
      }
    });
  }
}

function segmentLengths(coords){
  const lengths = [];
  let total = 0;
  for(let i = 1; i < coords.length; i++){
    const d = distanciaMetros(coords[i - 1], coords[i]);
    lengths.push(d);
    total += d;
  }
  return { lengths, total };
}

function pointAlongRoute(coords, t){
  if(!coords.length) return [0, 0];
  if(coords.length === 1 || t <= 0) return coords[0].slice();
  if(t >= 1) return coords[coords.length - 1].slice();

  const { lengths, total } = segmentLengths(coords);
  if(!total) return coords[0].slice();

  let remain = t * total;
  for(let i = 0; i < lengths.length; i++){
    const seg = lengths[i];
    if(remain <= seg || i === lengths.length - 1){
      const u = seg ? remain / seg : 0;
      const a = coords[i];
      const b = coords[i + 1];
      return [
        a[0] + (b[0] - a[0]) * u,
        a[1] + (b[1] - a[1]) * u
      ];
    }
    remain -= seg;
  }
  return coords[coords.length - 1].slice();
}

function stopRouteAnimation(){
  if(routeAnimFrame){
    cancelAnimationFrame(routeAnimFrame);
    routeAnimFrame = null;
  }
}

function clearUnitRoute(){
  stopRouteAnimation();
  activeRouteSpec = null;
  routeDashStep = 0;
  routePulseT = 0;

  if(!map.getSource(ROUTE_SOURCE)) return;

  map.getSource(ROUTE_SOURCE).setData(emptyLineFeature());
  map.getSource(ROUTE_PULSE_SOURCE).setData(emptyPointFeature());

  [ROUTE_LAYER_GLOW, ROUTE_LAYER_LINE, ROUTE_LAYER_PULSE].forEach(id => {
    if(map.getLayer(id)) map.setLayoutProperty(id, "visibility", "none");
  });
}

function startRouteAnimation(coords, kind){
  stopRouteAnimation();
  const speed = kind === "air" ? 0.012 : 0.007;

  const tick = () => {
    if(!activeRouteSpec || !map.getLayer(ROUTE_LAYER_LINE)) return;

    routeDashStep = (routeDashStep + 1) % 32;
    const phase = routeDashStep / 8;
    map.setPaintProperty(ROUTE_LAYER_LINE, "line-dasharray", [
      phase,
      2,
      1.25,
      2
    ]);

    routePulseT = (routePulseT + speed) % 1;
    const pt = pointAlongRoute(coords, routePulseT);
    map.getSource(ROUTE_PULSE_SOURCE).setData({
      type:"Feature",
      properties:{},
      geometry:{ type:"Point", coordinates:pt }
    });

    routeAnimFrame = requestAnimationFrame(tick);
  };

  routeAnimFrame = requestAnimationFrame(tick);
}

function paintGeoRoute(spec){
  ensureRouteLayers();
  const color = token(spec.colorToken) || "#2d68f8";
  const coords = spec.coords;
  const kind = spec.kind || "ground";

  map.getSource(ROUTE_SOURCE).setData({
    type:"Feature",
    properties:{ kind },
    geometry:{ type:"LineString", coordinates:coords }
  });

  map.setPaintProperty(ROUTE_LAYER_GLOW, "line-color", color);
  map.setPaintProperty(ROUTE_LAYER_LINE, "line-color", color);
  map.setPaintProperty(ROUTE_LAYER_PULSE, "circle-stroke-color", color);
  map.setPaintProperty(ROUTE_LAYER_LINE, "line-width", kind === "air" ? 2.75 : 3.5);
  map.setPaintProperty(ROUTE_LAYER_LINE, "line-opacity", kind === "air" ? 0.85 : 0.95);

  [ROUTE_LAYER_GLOW, ROUTE_LAYER_LINE, ROUTE_LAYER_PULSE].forEach(id => {
    map.setLayoutProperty(id, "visibility", "visible");
  });

  routePulseT = 0;
  startRouteAnimation(coords, kind);
}

function paintMultiGeoRoutes(specs){
  ensureRouteLayers();
  if(!specs || !specs.length){
    clearUnitRoute();
    return;
  }

  const features = specs.map(spec => ({
    type:"Feature",
    properties:{
      kind: spec.kind || "ground",
      color: token(spec.colorToken) || "#2d68f8"
    },
    geometry:{ type:"LineString", coordinates:spec.coords }
  }));

  map.getSource(ROUTE_SOURCE).setData({
    type:"FeatureCollection",
    features
  });

  const primary = specs[0];
  const color = token(primary.colorToken) || "#2d68f8";
  const kind = primary.kind || "ground";

  map.setPaintProperty(ROUTE_LAYER_GLOW, "line-color", [
    "coalesce", ["get", "color"], color
  ]);
  map.setPaintProperty(ROUTE_LAYER_LINE, "line-color", [
    "coalesce", ["get", "color"], color
  ]);
  map.setPaintProperty(ROUTE_LAYER_PULSE, "circle-stroke-color", color);
  map.setPaintProperty(ROUTE_LAYER_LINE, "line-width", 3.25);
  map.setPaintProperty(ROUTE_LAYER_LINE, "line-opacity", 0.92);

  [ROUTE_LAYER_GLOW, ROUTE_LAYER_LINE, ROUTE_LAYER_PULSE].forEach(id => {
    map.setLayoutProperty(id, "visibility", "visible");
  });

  activeRouteSpec = { coords: primary.coords, kind, colorToken: primary.colorToken, key: "multi" };
  routePulseT = 0;
  startRouteAnimation(primary.coords, kind);
}

function showGeoRoute(coords, { kind = "ground", colorToken = "--accent-blue", key = "route" } = {}){
  if(!coords || coords.length < 2){
    clearUnitRoute();
    return;
  }
  activeRouteSpec = { coords, kind, colorToken, key };
  paintGeoRoute(activeRouteSpec);
}

function showUnitRoute(unitId){
  const route = UNIT_ROUTE[unitId];
  if(!route){
    clearUnitRoute();
    return;
  }
  showGeoRoute(route.coords, {
    kind:route.kind,
    colorToken:route.colorToken,
    key:"unit:"+unitId
  });
}

function mockRouteCoords(from, to, kind){
  if(kind === "air") return [from.slice(), to.slice()];
  const midA = [from[0], from[1] + (to[1] - from[1]) * 0.55];
  const midB = [to[0], midA[1]];
  return [from.slice(), midA, midB, to.slice()];
}

/* Códigos de unidad del detalle de incidente → marcador / estilo de ruta. */
const UNIT_BY_CODE = {
  "ZM-14":{ unitId:"robot", markerKey:"perro-1", callout:"ZM-14", colorToken:"--accent-purple", kind:"ground" },
  "HU-07":{ unitId:"amb", markerKey:"humanoide-1", callout:"HU-07", colorToken:"--accent-blue", kind:"ground" },
  "DR-03":{ unitId:"drone", markerKey:"dron-3", callout:"DR-03", colorToken:"--accent-green", kind:"air" },
  "ZM-22":{ unitId:"demoRobot", markerKey:"perro-4", callout:"ZM-22", colorToken:"--accent-purple", kind:"ground" },
  "HU-12":{ unitId:"demoAmb", markerKey:"humanoide-4", callout:"HU-12", colorToken:"--accent-blue", kind:"ground" },
  "DR-09":{ unitId:"demoDrone", markerKey:"dron-4", callout:"DR-09", colorToken:"--accent-green", kind:"air" },
  "ZM-21":{ markerKey:"perro-2", callout:"ZM-21", colorToken:"--accent-purple", kind:"ground" },
  "ZM-08":{ markerKey:"perro-3", callout:"ZM-08", colorToken:"--accent-purple", kind:"ground" },
  "B-04":{ markerKey:"humanoide-2", callout:"B-04", colorToken:"--accent-blue", kind:"ground" }
};

function clearAssignedUnitFocus(){
  document.querySelectorAll(".marker-anchor.is-assigned").forEach(anchor => {
    anchor.classList.remove("is-assigned", "is-focus");
    anchor.querySelector(".marker-ping")?.remove();
    anchor.querySelector(".marker-callout")?.remove();
  });
}

function focusAssignedUnitMarker(markerKey, calloutName, targetLL){
  const btn = document.querySelector(`.marker[data-device="${markerKey}"]`);
  if(!btn) return null;

  const lng = Number(btn.dataset.lng);
  const lat = Number(btn.dataset.lat);
  if(Number.isNaN(lng) || Number.isNaN(lat)) return null;

  const anchor = btn.closest(".marker-anchor");
  if(!anchor) return null;

  btn.hidden = false;
  anchor.classList.add("is-assigned", "is-focus");

  if(!anchor.querySelector(".marker-ping")){
    const ping = document.createElement("div");
    ping.className = "marker-ping";
    ping.setAttribute("aria-hidden", "true");
    anchor.prepend(ping);
  }

  anchor.querySelector(".marker-callout")?.remove();
  const meters = distanciaMetros([lng, lat], targetLL);
  const callout = document.createElement("div");
  callout.className = "marker-callout";
  callout.innerHTML =
    `<span class="marker-callout__name">${calloutName}</span>`
    + `<span class="marker-callout__dist">${formatearDistancia(meters)} del incidente</span>`;
  anchor.appendChild(callout);

  return { lng, lat, btn };
}

/* Al abrir un incidente: marca unidades asignadas + rutas hacia el punto. */
window.nexusShowIncidentAssignedUnits = function nexusShowIncidentAssignedUnits(inc){
  clearAssignedUnitFocus();

  if(!inc || inc.lng == null || inc.lat == null){
    clearUnitRoute();
    return;
  }

  const target = [Number(inc.lng), Number(inc.lat)];
  const units = inc.units || [];
  const routeSpecs = [];

  units.forEach(u => {
    const link = UNIT_BY_CODE[u.code];
    if(!link) return;

    /* Ruta teatro fija si el destino coincide con el incidente de esa unidad. */
    let coords = null;
    if(link.unitId && UNIT_ROUTE[link.unitId]){
      const route = UNIT_ROUTE[link.unitId];
      const end = route.coords[route.coords.length - 1];
      if(Math.abs(target[0] - end[0]) < 1e-4 && Math.abs(target[1] - end[1]) < 1e-4){
        coords = route.coords;
      }
    }

    const placed = focusAssignedUnitMarker(link.markerKey, link.callout || u.code, target);
    if(!placed) return;

    if(!coords){
      coords = mockRouteCoords([placed.lng, placed.lat], target, link.kind);
    }

    routeSpecs.push({
      coords,
      kind: link.kind,
      colorToken: link.colorToken
    });
  });

  if(routeSpecs.length){
    paintMultiGeoRoutes(routeSpecs);
  }else{
    clearUnitRoute();
  }
};

window.nexusClearIncidentAssignedUnits = function nexusClearIncidentAssignedUnits(){
  clearAssignedUnitFocus();
  clearUnitRoute();
};

window.nexusShowPatrolRoute = function nexusShowPatrolRoute(coords, opts){
  showGeoRoute(coords, {
    kind:(opts && opts.kind) || "ground",
    colorToken:(opts && opts.colorToken) || "--accent-orange",
    key:(opts && opts.key) || "patrol"
  });
  /* Patrulla: más grosor/opacidad para contrastar sobre el mapa. */
  if(map.getLayer(ROUTE_LAYER_GLOW)){
    map.setPaintProperty(ROUTE_LAYER_GLOW, "line-width", 14);
    map.setPaintProperty(ROUTE_LAYER_GLOW, "line-opacity", 0.35);
  }
  if(map.getLayer(ROUTE_LAYER_LINE)){
    map.setPaintProperty(ROUTE_LAYER_LINE, "line-width", 4.5);
    map.setPaintProperty(ROUTE_LAYER_LINE, "line-opacity", 1);
  }
};

window.nexusClearMapRoute = clearUnitRoute;

window.nexusFocusMapOnPoint = function nexusFocusMapOnPoint(lng, lat, opts){
  if(lng == null || lat == null || Number.isNaN(Number(lng)) || Number.isNaN(Number(lat))) return;
  const zoom = (opts && opts.zoom != null) ? opts.zoom : 16.55;
  const duration = (opts && opts.duration != null) ? opts.duration : 1100;
  map.easeTo({
    center:[Number(lng), Number(lat)],
    zoom,
    duration,
    padding: mapPadding(),
    essential:true
  });
};

function distanciaMetros(a, b){
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function formatearDistancia(m){
  if(m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

const seenByType = {};
MARKERS.forEach(([type, lng, lat]) => {
  seenByType[type] = (seenByType[type] || 0) + 1;
  const index = seenByType[type];
  const el = crearElementoDeMarcador(type, index);

  const unitId = Object.keys(UNIT_MARKER).find(id => {
    const link = UNIT_MARKER[id];
    return link.type === type && link.index === index;
  });
  if(unitId){
    const btn = el.querySelector(".marker");
    btn.dataset.unit = unitId;
  }

  el.querySelector(".marker").dataset.device = `${type}-${index}`;

  const btn = el.querySelector(".marker");
  btn.dataset.lng = String(lng);
  btn.dataset.lat = String(lat);

  if(type === "dron" && typeof DEVICES !== "undefined"){
    const device = DEVICES.find(d => d.markerKey === `${type}-${index}`);
    if(device && device.ops){
      btn.classList.add(`marker--ops-${device.ops}`);
      btn.dataset.ops = device.ops;
    }
  }

  new maplibregl.Marker({ element: el })
    .setLngLat([lng, lat])
    .addTo(map);
});

/* Incidentes del módulo: un marcador por fila de INCIDENTS (data.js). */
(function placeIncidentMarkers(){
  if(typeof INCIDENTS === "undefined" || !Array.isArray(INCIDENTS)) return;
  INCIDENTS.forEach((inc, i) => {
    if(inc.lng == null || inc.lat == null) return;
    const index = Number(inc.markerIndex) || i + 1;
    const el = crearElementoDeMarcador("incidente", index);
    const btn = el.querySelector(".marker");
    btn.dataset.device = `incidente-${index}`;
    btn.dataset.incidentId = inc.id;
    btn.dataset.priority = inc.priority || "high";
    btn.dataset.lng = String(inc.lng);
    btn.dataset.lat = String(inc.lat);
    btn.classList.add(`marker--prio-${inc.priority || "high"}`);
    btn.setAttribute("aria-label", `Incidente ${inc.folio}`);
    new maplibregl.Marker({ element: el })
      .setLngLat([inc.lng, inc.lat])
      .addTo(map);
  });
})();

/* Resalta el marcador ligado a un recurso despachado (ondas + callout). */
window.nexusFocusUnitMarker = function nexusFocusUnitMarker(unitId){
  clearAssignedUnitFocus();
  document.querySelectorAll(".marker-anchor.is-focus").forEach(anchor => {
    anchor.classList.remove("is-focus");
    anchor.querySelector(".marker-ping")?.remove();
    anchor.querySelector(".marker-callout")?.remove();
  });

  if(!unitId){
    clearUnitRoute();
    return;
  }

  const btn = document.querySelector(`.marker[data-unit="${unitId}"]`);
  if(!btn){
    clearUnitRoute();
    return;
  }

  const link = UNIT_MARKER[unitId];
  const anchor = btn.closest(".marker-anchor");
  if(!anchor || !link){
    clearUnitRoute();
    return;
  }

  btn.hidden = false;
  anchor.classList.add("is-focus");

  const ping = document.createElement("div");
  ping.className = "marker-ping";
  ping.setAttribute("aria-hidden", "true");

  const meters = distanciaMetros(INCIDENT_LL, [link.lng, link.lat]);
  const callout = document.createElement("div");
  callout.className = "marker-callout";
  callout.innerHTML =
    `<span class="marker-callout__name">${link.callout}</span>`
    + `<span class="marker-callout__dist">${formatearDistancia(meters)} del incidente</span>`;

  anchor.prepend(ping);
  anchor.appendChild(callout);

  showUnitRoute(unitId);
};

/* Resalta un dispositivo del inventario de salud (callout con código). */
window.nexusFocusDeviceMarker = function nexusFocusDeviceMarker(markerKey, label){
  clearUnitRoute();

  document.querySelectorAll(".marker-anchor.is-focus").forEach(anchor => {
    anchor.classList.remove("is-focus");
    anchor.querySelector(".marker-ping")?.remove();
    anchor.querySelector(".marker-callout")?.remove();
  });

  if(!markerKey) return;

  const btn = document.querySelector(`.marker[data-device="${markerKey}"]`);
  if(!btn) return;

  const anchor = btn.closest(".marker-anchor");
  if(!anchor) return;

  btn.hidden = false;
  anchor.classList.add("is-focus");

  const ping = document.createElement("div");
  ping.className = "marker-ping";
  ping.setAttribute("aria-hidden", "true");

  const callout = document.createElement("div");
  callout.className = "marker-callout";
  callout.innerHTML =
    `<span class="marker-callout__name">${label || markerKey}</span>`;

  anchor.prepend(ping);
  anchor.appendChild(callout);
};
/* ============================================================
   TARJETAS ANCLADAS A LA CIUDAD
   Popcard, radar y tarjetas de contexto declaran su punto en el
   marcado con data-lng / data-lat. Con el mapa arrastrable, una
   posición en porcentaje se quedaría quieta mientras la ciudad se
   mueve debajo.
   ============================================================ */
const geoMarkers = {};
/* Solo popcard/radar (u otros anclajes de UI). Los .marker llevan
   data-lng/lat para distancias; si MapLibre los re-registra aquí,
   saca el botón del .marker-anchor y rompe focus/callout/rutas. */
document.querySelectorAll("#map .popcard[data-lng][data-lat], #map .radar[data-lng][data-lat]").forEach(el => {
  const marker = new maplibregl.Marker({
    element: el,
    anchor: el.dataset.anchor || "center",
    offset: el.dataset.anchor === "bottom" ? [0, -28] : [0, 0]
  })
    .setLngLat([Number(el.dataset.lng), Number(el.dataset.lat)])
    .addTo(map);
  if(el.classList.contains("radar")) geoMarkers.radar = marker;
  if(el.classList.contains("popcard")) geoMarkers.popcard = marker;
});

/* Fichas desde INCIDENTS (misma fuente que el panel). */
const INCIDENT_CARDS = (() => {
  const cards = {};
  if(typeof INCIDENTS === "undefined") return cards;
  INCIDENTS.forEach(inc => {
    if(!inc.markerIndex) return;
    cards[String(inc.markerIndex)] = {
      id: inc.folio,
      desc: `${inc.type} · ${inc.address}`,
      cam: inc.cam,
      stream: inc.stream || "",
      incidentId: inc.id
    };
  });
  return cards;
})();

const clearMarkerFocus = () => {
  document.querySelectorAll(".marker-anchor.is-focus, .marker-anchor.is-assigned").forEach(anchor => {
    anchor.classList.remove("is-focus", "is-assigned");
    anchor.querySelector(".marker-ping")?.remove();
    anchor.querySelector(".marker-callout")?.remove();
  });
};

/* Resalta el marcador del incidente seleccionado en lista/mapa. */
window.nexusFocusIncidentMarker = function nexusFocusIncidentMarker(incidentId){
  clearMarkerFocus();
  if(!incidentId) return;

  const btn = document.querySelector(`.marker--incidente[data-incident-id="${incidentId}"]`);
  if(!btn) return;

  const anchor = btn.closest(".marker-anchor");
  if(!anchor) return;

  btn.hidden = false;
  anchor.classList.add("is-focus");

  const ping = document.createElement("div");
  ping.className = "marker-ping";
  ping.setAttribute("aria-hidden", "true");

  const folio = (typeof INCIDENTS !== "undefined"
    && INCIDENTS.find(i => i.id === incidentId)?.folio) || incidentId;
  const callout = document.createElement("div");
  callout.className = "marker-callout";
  callout.innerHTML =
    `<span class="marker-callout__name">${folio}</span>`
    + `<span class="marker-callout__dist">Incidente</span>`;

  anchor.prepend(ping);
  anchor.appendChild(callout);
};

/* Popcard + radar: API pública para Incidentes y clic en marcador. */
(function incidentPopcard(){
  const card = document.querySelector(".popcard");
  const radar = document.querySelector(".radar");
  const idEl = card && card.querySelector(".popcard__id");
  const descEl = card && card.querySelector(".popcard__desc");
  const liveEl = card && card.querySelector(".popcard__live");
  const shotEl = card && card.querySelector(".popcard__shot");
  const buttons = document.querySelectorAll(".marker--incidente");
  if(!card || !radar || !geoMarkers.popcard || !geoMarkers.radar || !buttons.length) return;

  let openKey = null;

  const place = (lng, lat) => {
    geoMarkers.popcard.setLngLat([lng, lat]);
    geoMarkers.radar.setLngLat([lng, lat]);
  };

  const close = () => {
    card.hidden = true;
    radar.hidden = true;
    openKey = null;
    if(typeof window.nexusFocusIncidentMarker === "function"){
      window.nexusFocusIncidentMarker(null);
    }
    if(typeof window.nexusClearIncidentAssignedUnits === "function"){
      window.nexusClearIncidentAssignedUnits();
    }
  };

  const show = ({ markerIndex, incidentId, folio, desc, cam, stream, lng, lat }) => {
    const index = markerIndex != null ? String(markerIndex) : null;
    const key = incidentId || index;
    let useLng = lng;
    let useLat = lat;

    if((useLng == null || useLat == null) && incidentId){
      const btn = document.querySelector(`.marker--incidente[data-incident-id="${incidentId}"]`);
      if(btn){
        useLng = Number(btn.dataset.lng);
        useLat = Number(btn.dataset.lat);
      }
    }
    if((useLng == null || useLat == null) && index){
      const btn = document.querySelector(`.marker--incidente[data-marker-index="${index}"]`);
      if(btn){
        useLng = Number(btn.dataset.lng);
        useLat = Number(btn.dataset.lat);
      }
    }

    if(useLng == null || useLat == null || Number.isNaN(Number(useLng)) || Number.isNaN(Number(useLat))){
      close();
      return;
    }

    const info = (index && INCIDENT_CARDS[index]) || {};
    const feed = stream || info.stream || "";
    if(idEl) idEl.textContent = `Incidente ${folio || info.id || ""}`.trim();
    if(descEl) descEl.textContent = desc || info.desc || "";
    const camLabel = cam || info.cam || "";
    const feedBox = card.querySelector(".popcard__feed");
    if(feedBox){
      const liveBadge = `<span class="popcard__live"><i></i>EN VIVO · ${camLabel}</span>`;
      if(feed){
        const media = typeof nexusLiveMediaTag === "function"
          ? nexusLiveMediaTag(feed, "popcard__shot", "assets/arco2.mp4")
          : `<video class="popcard__shot" src="${feed}" autoplay muted loop playsinline></video>`;
        feedBox.innerHTML = media + liveBadge;
      }else{
        feedBox.innerHTML = liveBadge;
      }
    }else{
      if(liveEl) liveEl.innerHTML = `<i></i>EN VIVO · ${camLabel}`;
      if(shotEl){
        if(feed){
          shotEl.src = feed;
          shotEl.hidden = false;
        }else{
          shotEl.removeAttribute("src");
          shotEl.hidden = true;
        }
      }
    }
    place(Number(useLng), Number(useLat));
    card.hidden = false;
    radar.hidden = false;
    openKey = key;

    if(incidentId || info.incidentId){
      window.nexusFocusIncidentMarker(incidentId || info.incidentId);
    }

    map.easeTo({ center:[Number(useLng), Number(useLat)], duration:600, padding: mapPadding() });
  };

  window.nexusShowIncidentPopcard = show;
  window.nexusClearIncidentPopcard = close;

  buttons.forEach(btn => {
    btn.addEventListener("click", event => {
      event.stopPropagation();
      const incidentId = btn.dataset.incidentId;
      const index = btn.dataset.markerIndex;
      const key = incidentId || index;

      if(openKey === key){
        close();
        if(typeof window.nexusClearIncidentSelection === "function"){
          const panel = document.getElementById("incidents-panel");
          if(panel && !panel.hidden) window.nexusClearIncidentSelection();
        }
        return;
      }

      /* Siempre abre el módulo Incidentes en detalle (stream + info). */
      if(typeof window.nexusOpenMode === "function"){
        window.nexusOpenMode("incidents");
      }
      if(incidentId && typeof window.nexusOpenIncidentById === "function"){
        window.nexusOpenIncidentById(incidentId);
        return;
      }
      if(typeof window.nexusOpenIncidentByMarker === "function" && window.nexusOpenIncidentByMarker(index)){
        return;
      }

      const info = INCIDENT_CARDS[index] || {};
      const lng = Number(btn.dataset.lng);
      const lat = Number(btn.dataset.lat);
      if(Number.isNaN(lng) || Number.isNaN(lat)) return;
      show({
        markerIndex: index,
        incidentId,
        folio: info.id,
        desc: info.desc,
        cam: info.cam,
        stream: info.stream,
        lng,
        lat
      });
    });
  });
})();

/* ============================================================
   CAPAS — encendido/apagado de marcadores
   Misma lógica que la versión SVG: los botones siguen buscando
   .marker--{tipo}, que el marcador conserva dentro del ancla.
   ============================================================ */
document.querySelectorAll(".layer").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const on = btn.getAttribute("aria-pressed")==="true";
    btn.setAttribute("aria-pressed", String(!on));
    document.querySelectorAll(`.marker--${btn.dataset.layer}`).forEach(m=>{ m.hidden = on; });
  });
});

document.querySelectorAll('.layer[aria-pressed="false"]').forEach(btn=>{
  document.querySelectorAll(`.marker--${btn.dataset.layer}`).forEach(m=>m.hidden=true);
});

/* ============================================================
   CONTROLES DEL MAPA — zoom, 3D, pantalla completa, norte, centro
   Capas base queda disabled: no hay proveedor satelital.
   ============================================================ */
(function mapControls(){
  const root = document.querySelector(".mapctl");
  if(!root) return;

  const PITCH_3D = 60;
  const HOME = { center: CENTER, zoom: 15.4, pitch: PITCH_3D, bearing: -17 };

  const btn = action => root.querySelector(`[data-mapctl="${action}"]`);
  const fullscreenBtn = btn("fullscreen");
  const pitchBtn = btn("pitch");
  const compassBtn = btn("north");
  const needle = compassBtn && compassBtn.querySelector("span");

  const syncPitchChrome = () => {
    if(!pitchBtn) return;
    const on = map.getPitch() >= 20;
    pitchBtn.setAttribute("aria-pressed", String(on));
    pitchBtn.setAttribute("aria-label", on ? "Pasar a vista 2D" : "Pasar a vista 3D");
  };

  const syncCompass = () => {
    if(!needle) return;
    needle.style.transform = `rotate(${-map.getBearing()}deg)`;
  };

  const syncFullscreenChrome = () => {
    if(!fullscreenBtn) return;
    const on = Boolean(document.fullscreenElement);
    fullscreenBtn.setAttribute("aria-pressed", String(on));
    fullscreenBtn.setAttribute(
      "aria-label",
      on ? "Salir de pantalla completa" : "Pantalla completa"
    );
  };

  map.on("pitch", syncPitchChrome);
  map.on("rotate", syncCompass);
  map.on("pitchend", syncPitchChrome);
  map.on("rotateend", syncCompass);
  document.addEventListener("fullscreenchange", syncFullscreenChrome);

  syncPitchChrome();
  syncCompass();
  syncFullscreenChrome();

  root.addEventListener("click", e => {
    const target = e.target.closest("[data-mapctl]");
    if(!target || target.disabled) return;

    switch(target.dataset.mapctl){
      case "zoom-in":
        map.zoomIn({ duration: 300 });
        break;
      case "zoom-out":
        map.zoomOut({ duration: 300 });
        break;
      case "pitch":{
        const next = map.getPitch() >= 20 ? 0 : PITCH_3D;
        map.easeTo({ pitch: next, duration: 500 });
        break;
      }
      case "recenter":
        map.easeTo({ ...HOME, duration: 800 });
        break;
      case "north":
        map.easeTo({ bearing: 0, duration: 500 });
        break;
      case "fullscreen":{
        const host = mapRoot || document.getElementById("map");
        if(!host) return;
        if(document.fullscreenElement){
          document.exitFullscreen().catch(() => {});
        }else{
          host.requestFullscreen().catch(() => {});
        }
        break;
      }
      default:
        break;
    }
  });
})();
