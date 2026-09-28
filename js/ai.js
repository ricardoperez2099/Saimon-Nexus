/* ============================================================
   PANEL DE IA — comportamiento de la columna derecha
   Vigía → IA. Dispositivos → salud. Rutas → patrullaje.
   Incidentes → cola viva. Pausar / Tomar control sin cablear.
   ============================================================ */

/* Menú del orb: abre el panel que corresponde al modo. */
(function saimonModes(){
  const shell = document.getElementById("shell");
  const aiPanel = document.getElementById("ai-panel");
  const devicesPanel = document.getElementById("devices-panel");
  const routesPanel = document.getElementById("routes-panel");
  const incidentsPanel = document.getElementById("incidents-panel");
  const orb = document.querySelector(".agent-orb");
  const nameEl = orb && orb.querySelector(".agent-orb__name");
  const actions = orb && orb.querySelectorAll(".agent-orb__action[data-mode]");
  if(!shell || !aiPanel || !devicesPanel || !routesPanel || !incidentsPanel || !orb || !actions.length) return;

  const LABELS = {
    vigia: "Saimon VIGIA",
    patrol: "Saimon RUTAS",
    devices: "Saimon DISPOSITIVOS",
    incidents: "Saimon INCIDENTES"
  };

  const PANEL_BY_MODE = {
    vigia: aiPanel,
    devices: devicesPanel,
    patrol: routesPanel,
    incidents: incidentsPanel
  };

  const setPanelVisible = (panel, open) => {
    panel.hidden = !open;
    if(open) panel.removeAttribute("inert");
    else panel.setAttribute("inert", "");
  };

  const setRightOpen = open => {
    shell.classList.toggle("is-right-open", open);
    if(typeof window.nexusRefreshMapPadding === "function"){
      window.nexusRefreshMapPadding();
    }
  };

  const closeAllPanels = () => {
    setPanelVisible(aiPanel, false);
    setPanelVisible(devicesPanel, false);
    setPanelVisible(routesPanel, false);
    setPanelVisible(incidentsPanel, false);
    setRightOpen(false);
    if(typeof window.nexusFocusDeviceMarker === "function"){
      window.nexusFocusDeviceMarker(null);
    }
    if(typeof window.nexusFocusUnitMarker === "function"){
      window.nexusFocusUnitMarker(null);
    }
    if(typeof window.nexusClearPatrolSelection === "function"){
      window.nexusClearPatrolSelection();
    }else if(typeof window.nexusClearMapRoute === "function"){
      window.nexusClearMapRoute();
    }
    if(typeof window.nexusClearIncidentSelection === "function"){
      window.nexusClearIncidentSelection();
    }else if(typeof window.nexusClearIncidentPopcard === "function"){
      window.nexusClearIncidentPopcard();
    }
  };

  const clearModeButtons = () => {
    actions.forEach(btn => {
      btn.classList.remove("is-active");
      btn.setAttribute("aria-pressed", "false");
    });
    if(nameEl) nameEl.textContent = "Saimon";
    orb.setAttribute("aria-label", "Saimon");
  };

  const activateMode = mode => {
    actions.forEach(btn => {
      const on = btn.dataset.mode === mode;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
    if(nameEl) nameEl.textContent = LABELS[mode] || "Saimon";
    orb.setAttribute("aria-label", LABELS[mode] || "Saimon");
  };

  const openModePanel = mode => {
    const target = PANEL_BY_MODE[mode];
    setPanelVisible(aiPanel, target === aiPanel);
    setPanelVisible(devicesPanel, target === devicesPanel);
    setPanelVisible(routesPanel, target === routesPanel);
    setPanelVisible(incidentsPanel, target === incidentsPanel);
    setRightOpen(Boolean(target));
    activateMode(mode);
  };

  const isModeOpen = mode => {
    const panel = PANEL_BY_MODE[mode];
    return panel && !panel.hidden
      && shell.classList.contains("is-right-open")
      && actions.length
      && [...actions].some(b => b.dataset.mode === mode && b.getAttribute("aria-pressed") === "true");
  };

  actions.forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;

      if(PANEL_BY_MODE[mode]){
        if(isModeOpen(mode)){
          closeAllPanels();
          clearModeButtons();
          return;
        }
        openModePanel(mode);
        return;
      }

      closeAllPanels();
      activateMode(mode);
    });
  });

  /* Abre un modo desde el mapa u otros módulos (p. ej. marcador → Incidentes). */
  window.nexusOpenMode = mode => {
    if(!PANEL_BY_MODE[mode]) return false;
    openModePanel(mode);
    return true;
  };
})();

/* Tira de agentes: acordeón colapsado por defecto. */
(function agentsDisclosure(){
  const toggle = document.getElementById("agents-toggle");
  if(!toggle) return;

  const panel = document.getElementById(toggle.getAttribute("aria-controls"));
  if(!panel) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
  });
})();

/* Ficha de recurso en el mapa: unidades del plan + clic en marcador de dispositivo.
   Teatro visual — no telemetría real. */
(function unitDevcard(){
  const card = document.getElementById("devcard");
  const title = document.getElementById("devcard-title");
  const sched = document.getElementById("devcard-sched");
  const media = document.getElementById("devcard-media");
  const closeBtn = card && card.querySelector(".devcard__close");
  const units = document.querySelectorAll(".unit[data-unit]");
  if(!card || !title || !sched || !media) return;

  const UNIT_PROFILES = {
    robot:{
      title:"ZM-14 · Perro robot",
      media:"robot",
      rows:[
        ["En ruta","ETA 3 min","Sector 1"],
        ["Prioridad","Alta","Despacho"],
        ["Estado","Asignada","Activo"]
      ]
    },
    amb:{
      title:"HU-07 · Humanoide",
      media:"humanoide",
      rows:[
        ["En ruta","ETA 5 min","Apoyo"],
        ["Misión","Disuasión","Listo"],
        ["Estado","Asignada","Activo"]
      ]
    },
    drone:{
      title:"DR-03 · Dron de vigilancia",
      media:"live",
      stream:"assets/cam-0412.png",
      cam:"DR-03",
      rows:[
        ["Operación","Desplegado","Óptica"],
        ["Altitud","80 m AGL","Live"],
        ["Estado","En misión","Activo"]
      ]
    }
  };

  const STREAM_BY_DEVICE = {
    "cam-0412":"assets/cam-0412.png",
    "cam-0501":"assets/cam-0501.jpg",
    "cam-0522":"assets/cam-0522.jpg",
    "cam-0603":"assets/cam-0603.jpg",
    "arco-02":"assets/arco-01.png",
    "arco-05":"assets/arco-02.png",
    "arco-08":"assets/arco-01.png"
  };

  let openKey = null;

  const setPressed = id => {
    units.forEach(u => {
      u.setAttribute("aria-pressed", String(u.dataset.unit === id));
    });
  };

  const renderMedia = (kind, streamSrc, camLabel) => {
    if(kind === "photo"){
      const src = streamSrc || "assets/dron-compact.jpg";
      media.innerHTML =
        `<img class="devcard__photo" src="${src}" alt="" width="480" height="270" decoding="async">`;
      return;
    }
    if(kind === "live" || streamSrc){
      const src = streamSrc || "assets/cam-0412.png";
      const label = camLabel || "CAM-0412";
      media.innerHTML =
        `<img class="devcard__photo" src="${src}" alt="" width="480" height="270" decoding="async">`
        + `<span class="popcard__live"><i></i>EN VIVO · ${label}</span>`;
      return;
    }
    if(kind === "robot"){
      media.innerHTML =
        `<img class="devcard__photo" src="assets/saimon-robot.jpg" alt="" width="320" height="200" decoding="async">`;
      return;
    }
    if(kind === "humanoide"){
      media.innerHTML =
        `<img class="devcard__photo" src="assets/humanoide.jpg" alt="" width="320" height="200" decoding="async">`;
      return;
    }
    media.innerHTML =
      `<img class="devcard__photo" src="assets/saimon-robot.jpg" alt="" width="320" height="200" decoding="async">`;
  };

  const applyProfile = (profile, key) => {
    title.textContent = profile.title;
    sched.innerHTML = profile.rows.map(([a,b,c]) =>
      `<li><span>${a}</span><span>${b}</span><span class="devcard__tag">${c}</span></li>`
    ).join("");
    renderMedia(profile.media, profile.stream, profile.cam);
    card.hidden = false;
    openKey = key;
  };

  const close = () => {
    card.hidden = true;
    openKey = null;
    setPressed(null);
    if(typeof window.nexusFocusUnitMarker === "function"){
      window.nexusFocusUnitMarker(null);
    }
    if(typeof window.nexusFocusDeviceMarker === "function"){
      window.nexusFocusDeviceMarker(null);
    }
  };

  const openUnit = id => {
    const profile = UNIT_PROFILES[id];
    if(!profile) return false;
    if(typeof window.nexusFocusDeviceMarker === "function"){
      window.nexusFocusDeviceMarker(null);
    }
    applyProfile(profile, "unit:" + id);
    setPressed(id);
    if(typeof window.nexusFocusUnitMarker === "function"){
      window.nexusFocusUnitMarker(id);
    }
    return true;
  };

  const openDevice = markerKey => {
    if(typeof DEVICES === "undefined") return false;
    const device = DEVICES.find(d => d.markerKey === markerKey);
    if(!device) return false;

    const typeMeta = (typeof DEVICE_TYPES !== "undefined" && DEVICE_TYPES[device.type]) || { label:device.type };
    const statusMeta = (typeof DEVICE_STATUS !== "undefined" && DEVICE_STATUS[device.status]) || { label:device.status };
    const opsMeta = device.ops && typeof DRONE_OPS !== "undefined" ? DRONE_OPS[device.ops] : null;

    let mediaKind = "robot";
    let stream = device.stream || STREAM_BY_DEVICE[device.id] || "";
    let cam = device.code;
    let rows = [
      ["Tipo", typeMeta.label, device.sector],
      ["Estado", statusMeta.label, device.status === "online" ? "OK" : "Alerta"],
      ["Cobertura", device.sector, device.code]
    ];

    if(device.type === "dron"){
      if(device.ops === "hangar"){
        mediaKind = "photo";
        stream = device.modelImg || "assets/dron-compact.jpg";
        rows = [
          ["Operación", opsMeta?.label || "En hangar", device.model === "max" ? "Max Tactical" : "Compact"],
          ["Estado", statusMeta.label, "Hangar"],
          ["Sector", device.sector, device.code]
        ];
      }else{
        mediaKind = "live";
        stream = device.stream || stream || "assets/cam-0412.png";
        rows = [
          ["Operación", opsMeta?.label || "Desplegado", "Óptica"],
          ["Estado", statusMeta.label, "Live"],
          ["Sector", device.sector, device.code]
        ];
      }
    }else if(device.type === "humanoide"){
      mediaKind = "photo";
      stream = device.modelImg || "assets/humanoide.jpg";
    }else if(device.type === "arco"){
      mediaKind = "live";
      stream = device.stream || STREAM_BY_DEVICE[device.id] || "assets/arco-01.png";
      rows = [
        ["Tipo", typeMeta.label, "Transmitiendo"],
        ["Estado", statusMeta.label, device.status === "online" ? "OK" : "Alerta"],
        ["Sector", device.sector, device.code]
      ];
    }else if(device.type === "camara"){
      mediaKind = stream ? "live" : "photo";
    }else if(device.type === "perro"){
      mediaKind = "robot";
    }

    applyProfile({
      title:`${device.code} · ${device.name}`,
      media: mediaKind,
      stream,
      cam,
      rows
    }, "device:" + markerKey);

    setPressed(null);
    if(typeof window.nexusFocusUnitMarker === "function"){
      window.nexusFocusUnitMarker(null);
    }
    if(typeof window.nexusFocusDeviceMarker === "function"){
      window.nexusFocusDeviceMarker(markerKey, device.code);
    }
    return true;
  };

  units.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.unit;
      if(!card.hidden && openKey === "unit:" + id){
        close();
        return;
      }
      openUnit(id);
    });
  });

  document.querySelectorAll(".marker[data-device]:not(.marker--incidente)").forEach(btn => {
    btn.addEventListener("click", event => {
      event.stopPropagation();
      const unitId = btn.dataset.unit;
      const markerKey = btn.dataset.device;

      if(unitId){
        if(!card.hidden && openKey === "unit:" + unitId){
          close();
          return;
        }
        openUnit(unitId);
        return;
      }

      if(!markerKey) return;
      if(!card.hidden && openKey === "device:" + markerKey){
        close();
        return;
      }
      openDevice(markerKey);
    });
  });

  if(closeBtn) closeBtn.addEventListener("click", close);

  window.nexusOpenDevcardUnit = openUnit;
  window.nexusOpenDevcardDevice = openDevice;
  window.nexusCloseDevcard = close;
})();
