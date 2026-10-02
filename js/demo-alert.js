/* ============================================================
   DEMO ALERTA → VIGÍA
   Teatro: toast → abre Vigía → anima log/cadena/unidades/mapa.
   Caso: INCIDENTS inc-0410 (accidente automovilístico + clips ARC/unidades).
   ============================================================ */
(function demoAlertFlow(){
  const cta = document.getElementById("demo-alert-cta");
  const toast = document.getElementById("demo-toast");
  const toastMeta = toast && toast.querySelector(".demo-toast__meta");
  const toastTitle = toast && toast.querySelector(".demo-toast__title");
  const aiPanel = document.getElementById("ai-panel");
  const logEl = document.getElementById("vigia-log");
  const liveText = document.getElementById("vigia-live-text");
  const chainEl = document.getElementById("vigia-chain");
  const dispStatus = document.getElementById("vigia-disp-status");
  const elapsedEl = document.getElementById("vigia-case-elapsed");
  const caseDesc = document.getElementById("vigia-case-desc");
  const caseId = document.getElementById("vigia-case-id");
  if(!cta || !toast || !aiPanel || !logEl || !chainEl) return;

  const DEMO_ID = "inc-0410";
  const TOAST_MS = 3200;
  const CHECK_SVG =
    `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="m5 12 5 5 9-9"/></svg>`;

  const UNIT_IDS = { robot:"demoRobot", amb:"demoAmb", drone:"demoDrone" };
  const UNIT_CODES = { demoRobot:"ZM-22", demoAmb:"HU-12", demoDrone:"DR-09" };

  const CTA_IDLE =
    `<svg class="demo-alert-cta__icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>`
    + `<i class="demo-alert-cta__dot" aria-hidden="true"></i>`;

  const setCtaIdle = () => {
    cta.classList.remove("is-busy");
    cta.disabled = false;
    cta.innerHTML = CTA_IDLE;
    cta.setAttribute("aria-label", "Simular alerta entrante");
    cta.title = "Simular alerta";
  };

  const setCtaBusy = () => {
    cta.classList.add("is-busy");
    cta.disabled = true;
    cta.innerHTML = `<i class="demo-alert-cta__dot is-pulse" aria-hidden="true"></i>`;
    cta.setAttribute("aria-label", "Simulando alerta");
    cta.title = "Simulando…";
  };

  const CHAIN_COPY = [
    { label:"Ubicación validada", time:"+0:04" },
    { label:"Accidente confirmado en arco ARC-02", time:"+0:11" },
    { label:"Óptica del arco en vivo", time:"+0:16" },
    { label:"Recursos despachados", time:"+0:22" },
    { label:"Siguiendo unidades en ruta", time:"" },
    { label:"Cierre y parte automático", time:"" }
  ];

  const unitBtns = () => [...document.querySelectorAll("#vigia-disp .unit[data-unit]")];
  const chainSteps = () => [...chainEl.querySelectorAll("[data-chain-step]")];

  let timers = [];
  let running = false;
  let gen = 0;

  const later = (ms, fn) => {
    const id = setTimeout(() => {
      if(!running) return;
      fn();
    }, ms);
    timers.push(id);
    return id;
  };

  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };

  const incident = () =>
    (typeof INCIDENTS !== "undefined" && INCIDENTS.find(i => i.id === DEMO_ID)) || null;

  const streams = () =>
    (typeof DEMO_ACCIDENT_STREAMS !== "undefined" && DEMO_ACCIDENT_STREAMS) || {
      scene:"assets/accidente-arco-carretero.mp4",
      robot:"assets/accidente-perro.mp4",
      amb:"assets/accidente-humanoide.mp4",
      drone:"assets/accidente-dron.mp4"
    };

  const setLive = html => {
    if(liveText) liveText.innerHTML = html;
  };

  const applyChainCopy = () => {
    chainSteps().forEach((step, idx) => {
      const copy = CHAIN_COPY[idx];
      if(!copy) return;
      const label = step.querySelector(".chain__label");
      if(!label) return;
      label.innerHTML = copy.time
        ? `${copy.label}<span class="chain__time">${copy.time}</span>`
        : copy.label;
    });
  };

  const setChainProgress = liveIndex => {
    chainSteps().forEach((step, idx) => {
      step.classList.remove("chain__step--done", "chain__step--live", "chain__step--wait");
      const dot = step.querySelector(".chain__dot");
      if(idx < liveIndex){
        step.classList.add("chain__step--done");
        if(dot) dot.innerHTML = CHECK_SVG;
      }else if(idx === liveIndex){
        step.classList.add("chain__step--live");
        if(dot) dot.innerHTML = "<i></i>";
      }else{
        step.classList.add("chain__step--wait");
        if(dot) dot.innerHTML = "";
      }
    });
  };

  const appendLog = ({ tone, text, time }) => {
    const item = document.createElement("div");
    item.className = "log__item is-enter";
    item.innerHTML =
      `<span class="log__dot log__dot--${tone || "info"}"></span>`
      + `<p class="log__text">${text}</p>`
      + `<span class="log__time">${time || ""}</span>`;
    logEl.appendChild(item);
    item.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  const syncUnitLabels = inc => {
    const byUnit = {
      demoRobot: (inc.units || []).find(u => u.code === "ZM-22"),
      demoAmb: (inc.units || []).find(u => u.code === "HU-12"),
      demoDrone: (inc.units || []).find(u => u.code === "DR-09")
    };
    unitBtns().forEach(btn => {
      const u = byUnit[btn.dataset.unit];
      if(!u) return;
      const code = btn.querySelector(".unit__code");
      if(code) code.textContent = u.code;
      const eta = btn.querySelector(".unit__eta");
      if(!eta) return;
      if(u.eta === "Sobrevolando" || /sitio/i.test(u.eta)){
        eta.innerHTML = `<b>${u.eta}</b>`;
      }else{
        eta.innerHTML = `llega en <b>${u.eta}</b>`;
      }
    });
  };

  const revealUnit = unitId => {
    const btn = document.querySelector(`#vigia-disp .unit[data-unit="${unitId}"]`);
    if(!btn) return;
    btn.classList.remove("is-pending");
    btn.classList.add("is-revealed");
    if(typeof window.nexusFocusUnitMarker === "function"){
      window.nexusFocusUnitMarker(unitId);
    }
  };

  const showPopcard = inc => {
    if(!inc || typeof window.nexusShowIncidentPopcard !== "function") return;
    const pack = streams();
    window.nexusShowIncidentPopcard({
      markerIndex: inc.markerIndex,
      incidentId: inc.id,
      folio: inc.folio,
      desc: `${inc.type} · ${inc.address}`,
      cam: inc.cam,
      stream: inc.stream || pack.scene,
      lng: inc.lng,
      lat: inc.lat
    });
  };

  const zoomToIncident = (inc, opts) => {
    if(!inc || typeof window.nexusFocusMapOnPoint !== "function") return;
    window.nexusFocusMapOnPoint(inc.lng, inc.lat, opts || { zoom: 16.7, duration: 1200 });
  };

  const showAllAssigned = inc => {
    if(!inc) return;
    if(typeof window.nexusShowIncidentAssignedUnits === "function"){
      window.nexusShowIncidentAssignedUnits(inc);
    }
  };

  const armDemoStreams = () => {
    const pack = streams();
    window.nexusDemoUnitStreams = {
      demoRobot: pack.robot,
      demoAmb: pack.amb,
      demoDrone: pack.drone
    };
  };

  const resetPanel = inc => {
    logEl.innerHTML = "";
    setLive("Procesando alerta entrante…");
    if(elapsedEl) elapsedEl.textContent = "00:00";
    if(caseId) caseId.textContent = inc ? `Incidente ${inc.folio}` : "Incidente —";
    if(caseDesc){
      caseDesc.textContent = inc
        ? `${inc.type} · ${inc.address}`
        : "Analizando señal…";
    }
    if(dispStatus){
      dispStatus.textContent = "En curso";
      dispStatus.className = "status status--info";
    }
    syncUnitLabels(inc);
    applyChainCopy();
    unitBtns().forEach(btn => {
      btn.classList.add("is-pending");
      btn.classList.remove("is-revealed");
      btn.setAttribute("aria-pressed", "false");
    });
    setChainProgress(0);
    armDemoStreams();
    if(typeof window.nexusCloseDevcard === "function") window.nexusCloseDevcard();
    if(typeof window.nexusClearIncidentAssignedUnits === "function"){
      window.nexusClearIncidentAssignedUnits();
    }else if(typeof window.nexusFocusUnitMarker === "function"){
      window.nexusFocusUnitMarker(null);
    }
    if(typeof window.nexusClearIncidentPopcard === "function"){
      window.nexusClearIncidentPopcard();
    }
  };

  const finishPanel = inc => {
    const pack = streams();
    setLive(`Siguiendo unidades en ruta · Incidente <b>${inc?.folio || "4300090410"}</b>`);
    if(elapsedEl) elapsedEl.textContent = inc?.elapsed || "03:40";
    if(dispStatus){
      dispStatus.textContent = "Ejecutado";
      dispStatus.className = "status status--success";
    }
    setChainProgress(4);
    unitBtns().forEach(btn => {
      btn.classList.remove("is-pending");
      btn.classList.add("is-revealed");
    });
    /* Cámara del dron sin pisar el mapa: luego se pintan las 3 rutas. */
    if(typeof window.nexusOpenDevcardUnit === "function"){
      window.nexusOpenDevcardUnit("demoDrone", {
        stream: pack.drone,
        cam: "DR-09",
        skipMapFocus: true,
        rows:[
          ["Operación","Desplegado","Accidente"],
          ["Óptica","Live arco/unidad","ARC-02"],
          ["Estado","En misión","Activo"]
        ]
      });
    }
    showAllAssigned(inc);
  };

  const hideToast = () => {
    toast.classList.remove("is-visible");
    toast.hidden = true;
  };

  const showToast = inc => {
    if(toastTitle) toastTitle.textContent = "Nueva alerta entrante";
    if(toastMeta){
      toastMeta.textContent = inc
        ? `${inc.sector} · ${inc.type} · prioridad alta`
        : "Sector 1 Norte · Accidente automovilístico · prioridad alta";
    }
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("is-visible"));
  };

  const abort = () => {
    running = false;
    clearTimers();
    hideToast();
    setCtaIdle();
  };

  const runScript = (inc, token) => {
    const pack = streams();
    const steps = [
      { wait: 800, run: () => {
        zoomToIncident(inc, { zoom: 16.2, duration: 1400 });
        appendLog({
          tone: "task",
          time: "12:01",
          text: "Detectó evento en arco <b>ARC-02</b> · Acceso Norte"
        });
      } },
      { wait: 1100, run: () => {
        appendLog({
          tone: "warn",
          time: "12:02",
          text: "Filtró ruido de cola · conserva <b>1 alerta</b> prioritaria"
        });
        setLive("Validando óptica del arco carretero…");
      } },
      { wait: 1200, run: () => {
        setChainProgress(1);
        appendLog({
          tone: "info",
          time: "12:02",
          text: "Clasificó <b>accidente automovilístico</b> · prioridad alta"
        });
        if(elapsedEl) elapsedEl.textContent = "00:18";
      } },
      { wait: 1200, run: () => {
        setChainProgress(2);
        showPopcard(inc);
        zoomToIncident(inc, { zoom: 17.05, duration: 1300 });
        setLive(`Señal en vivo · <b>${inc.cam || "ARC-02"}</b>`);
      } },
      { wait: 1600, run: () => {
        setChainProgress(3);
        appendLog({
          tone: "ok",
          time: "12:04",
          text: "Despachó <b>ZM-22</b>, <b>HU-12</b> y <b>DR-09</b>"
        });
        setLive("Despachando recursos autónomos…");
      } },
      /* Cada unidad: tiempo largo para ver asignación + cámara. */
      { wait: 2800, run: () => {
        revealUnit(UNIT_IDS.robot);
        if(typeof window.nexusOpenDevcardUnit === "function"){
          window.nexusOpenDevcardUnit("demoRobot", {
            stream: pack.robot,
            cam: UNIT_CODES.demoRobot,
            rows:[
              ["En ruta","ETA 4 min","Accidente"],
              ["Prioridad","Alta","Despacho"],
              ["Estado","Asignada","Activo"]
            ]
          });
        }
      } },
      { wait: 3200, run: () => {
        revealUnit(UNIT_IDS.amb);
        if(typeof window.nexusOpenDevcardUnit === "function"){
          window.nexusOpenDevcardUnit("demoAmb", {
            stream: pack.amb,
            cam: UNIT_CODES.demoAmb,
            rows:[
              ["En ruta","ETA 6 min","Apoyo"],
              ["Misión","Contención","Listo"],
              ["Estado","Asignada","Activo"]
            ]
          });
        }
      } },
      { wait: 3200, run: () => {
        revealUnit(UNIT_IDS.drone);
        setChainProgress(4);
        if(typeof window.nexusOpenDevcardUnit === "function"){
          window.nexusOpenDevcardUnit("demoDrone", {
            stream: pack.drone,
            cam: UNIT_CODES.demoDrone,
            rows:[
              ["Operación","Desplegado","Óptica"],
              ["Altitud","80 m AGL","Live"],
              ["Estado","En misión","Activo"]
            ]
          });
        }
      } },
      { wait: 2800, run: () => {
        appendLog({
          tone: "info",
          time: "12:05",
          text: "DR-09 en estación · streaming del punto confirmado"
        });
        zoomToIncident(inc, { zoom: 16.85, duration: 900 });
      } },
      { wait: 1200, run: () => finishPanel(inc) }
    ];

    let acc = 0;
    steps.forEach(step => {
      acc += step.wait;
      later(acc, () => {
        if(token !== gen) return;
        if(aiPanel.hidden){
          abort();
          return;
        }
        step.run();
      });
    });

    later(acc + 200, () => {
      if(token !== gen) return;
      running = false;
      setCtaIdle();
    });
  };

  const start = () => {
    const inc = incident();
    if(!inc){
      console.warn("[demo-alert] No se encontró", DEMO_ID);
      return;
    }

    gen += 1;
    const token = gen;
    clearTimers();
    running = true;
    setCtaBusy();

    showToast(inc);

    later(TOAST_MS, () => {
      if(token !== gen) return;
      hideToast();
      if(typeof window.nexusOpenMode === "function"){
        window.nexusOpenMode("vigia");
      }
      resetPanel(inc);
      runScript(inc, token);
    });
  };

  cta.addEventListener("click", e => {
    e.stopPropagation();
    if(running){
      abort();
    }
    start();
  });

  setCtaIdle();

  window.nexusStartDemoAlert = start;
  window.nexusAbortDemoAlert = abort;
})();
