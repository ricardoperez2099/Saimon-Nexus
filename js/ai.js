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

/* Ficha de recurso en el mapa: se abre al elegir una unidad despachada.
   Teatro visual — no telemetría real. */
(function unitDevcard(){
  const card = document.getElementById("devcard");
  const title = document.getElementById("devcard-title");
  const sched = document.getElementById("devcard-sched");
  const media = document.getElementById("devcard-media");
  const closeBtn = card && card.querySelector(".devcard__close");
  const units = document.querySelectorAll(".unit[data-unit]");
  if(!card || !title || !sched || !media || !units.length) return;

  const PROFILES = {
    robot:{
      title:"ZM-14 · Unidad robótica",
      media:"robot",
      rows:[
        ["En ruta","ETA 3 min","Sector 1"],
        ["Prioridad","Alta","Despacho"],
        ["Estado","Asignada","Activo"]
      ]
    },
    amb:{
      title:"A-07 · Ambulancia",
      media:"robot",
      rows:[
        ["En ruta","ETA 5 min","Médico"],
        ["Tripulación","2 paramédicos","Listo"],
        ["Estado","Asignada","Activo"]
      ]
    },
    drone:{
      title:"DR-03 · Dron de vigilancia",
      media:"live",
      rows:[
        ["En estación","Sobrevolando","Óptica"],
        ["Altitud","80 m AGL","Live"],
        ["Estado","En misión","Activo"]
      ]
    }
  };

  const setPressed = id => {
    units.forEach(u => {
      u.setAttribute("aria-pressed", String(u.dataset.unit === id));
    });
  };

  const syncMap = id => {
    if(typeof window.nexusFocusUnitMarker === "function"){
      window.nexusFocusUnitMarker(id || null);
    }
  };

  const renderMedia = kind => {
    if(kind === "live"){
      media.innerHTML =
        `<img class="devcard__photo" src="assets/cam-0412.png" alt="" width="480" height="270" decoding="async">`
        + `<span class="popcard__live"><i></i>EN VIVO · CAM-0412</span>`;
      return;
    }
    media.innerHTML =
      `<img class="devcard__photo" src="assets/saimon-robot.jpg" alt="" width="320" height="200" decoding="async">`;
  };

  const close = () => {
    card.hidden = true;
    setPressed(null);
    syncMap(null);
  };

  const open = id => {
    const profile = PROFILES[id];
    if(!profile) return;
    title.textContent = profile.title;
    sched.innerHTML = profile.rows.map(([a,b,c]) =>
      `<li><span>${a}</span><span>${b}</span><span class="devcard__tag">${c}</span></li>`
    ).join("");
    renderMedia(profile.media);
    card.hidden = false;
    setPressed(id);
    syncMap(id);
  };

  units.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.unit;
      if(!card.hidden && btn.getAttribute("aria-pressed") === "true"){
        close();
        return;
      }
      open(id);
    });
  });

  if(closeBtn) closeBtn.addEventListener("click", close);
})();
