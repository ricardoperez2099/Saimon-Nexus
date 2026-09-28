/* ============================================================
   INCIDENTES VIVOS — lista → detalle + popcard/radar en mapa
   Datos: INCIDENTS (data.js). Teatro visual.
   ============================================================ */

(function incidentsPanel(){
  const listEl = document.getElementById("incidents-list");
  const listCard = document.getElementById("incidents-list-card");
  const countEl = document.getElementById("incidents-count");
  const summaryEl = document.getElementById("incidents-summary");
  const detailEl = document.getElementById("incidents-detail");
  const detailCard = document.getElementById("incidents-detail-card");
  const detailTitle = document.getElementById("incidents-detail-title");
  const detailPriority = document.getElementById("incidents-detail-priority");
  const backBtn = document.getElementById("incidents-detail-back");
  const searchEl = document.getElementById("incidents-search");
  const priorityRow = document.getElementById("incidents-filter-priority");
  const statusRow = document.getElementById("incidents-filter-status");
  if(!listEl || !listCard || typeof INCIDENTS === "undefined") return;

  const LIVE_STATUSES = new Set(["open", "dispatched", "attending"]);

  const state = {
    priority: "all",
    status: "all",
    query: "",
    selectedId: null
  };

  const setChipGroup = (row, attr, value) => {
    if(!row) return;
    row.querySelectorAll(`[${attr}]`).forEach(btn => {
      const on = btn.getAttribute(attr) === value;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  };

  const matches = inc => {
    if(state.priority !== "all" && inc.priority !== state.priority) return false;
    if(state.status !== "all" && inc.status !== state.status) return false;
    const q = state.query.trim().toLowerCase();
    if(!q) return true;
    const hay = `${inc.folio} ${inc.type} ${inc.address} ${inc.sector} ${inc.cam}`.toLowerCase();
    return hay.includes(q);
  };

  const filtered = () => {
    const list = INCIDENTS.filter(matches);
    list.sort((a, b) => {
      const pr = INCIDENT_PRIORITY_RANK[a.priority] - INCIDENT_PRIORITY_RANK[b.priority];
      if(pr !== 0) return pr;
      const sr = INCIDENT_STATUS_RANK[a.status] - INCIDENT_STATUS_RANK[b.status];
      if(sr !== 0) return sr;
      return a.folio.localeCompare(b.folio);
    });
    return list;
  };

  const chip = (label, tone) =>
    `<span class="status status--${tone}">${label}</span>`;

  const renderSummary = () => {
    if(!summaryEl) return;
    const live = INCIDENTS.filter(i => LIVE_STATUSES.has(i.status));
    const counts = {
      open: live.filter(i => i.status === "open").length,
      dispatched: live.filter(i => i.status === "dispatched").length,
      attending: live.filter(i => i.status === "attending").length
    };
    summaryEl.innerHTML =
      `<div class="fleet__stat fleet__stat--offline" role="listitem">`
      + `<span class="fleet__stat-value">${counts.open}</span>`
      + `<span class="fleet__stat-label">Abiertos</span></div>`
      + `<div class="fleet__stat fleet__stat--degraded" role="listitem">`
      + `<span class="fleet__stat-value">${counts.dispatched}</span>`
      + `<span class="fleet__stat-label">Despachados</span></div>`
      + `<div class="fleet__stat fleet__stat--online" role="listitem">`
      + `<span class="fleet__stat-value">${counts.attending}</span>`
      + `<span class="fleet__stat-label">En atención</span></div>`;
  };

  const incidentRow = inc => {
    const pr = INCIDENT_PRIORITY[inc.priority];
    const st = INCIDENT_STATUS[inc.status];
    return `<button type="button" class="incident" data-incident-id="${inc.id}">`
      + `<span class="incident__top">`
      + `<span class="incident__folio">${inc.folio}</span>`
      + `<span class="incident__chips">`
      + chip(pr.label, pr.tone)
      + chip(st.label, st.tone)
      + `</span></span>`
      + `<span class="incident__type">${inc.type}</span>`
      + `<span class="incident__meta">`
      + `<span>${inc.address}</span>`
      + `<span>·</span>`
      + `<span>${inc.elapsed}</span>`
      + `</span></button>`;
  };

  const renderList = () => {
    const list = filtered();
    if(countEl){
      countEl.textContent = list.length === INCIDENTS.length
        ? `${list.length} incidentes`
        : `${list.length} de ${INCIDENTS.length}`;
    }
    if(!list.length){
      listEl.innerHTML = `<p class="inventory__empty">Ningún incidente coincide</p>`;
      return;
    }
    listEl.innerHTML = list.map(incidentRow).join("");
  };

  const showListView = () => {
    listCard.hidden = false;
    if(detailCard) detailCard.hidden = true;
  };

  const showDetailView = () => {
    listCard.hidden = true;
    if(detailCard) detailCard.hidden = false;
  };

  const pickGround = () =>
    typeof nexusPickGroundVideo === "function" ? nexusPickGroundVideo() : "assets/perro1.mp4";
  const pickDrone = () =>
    typeof nexusPickDroneVideo === "function" ? nexusPickDroneVideo() : "assets/dron1.mp4";

  const UNIT_VISUAL = {
    "Perro robot":{ pick: pickGround, camSuffix:"óptica" },
    "Humanoide":{ pick: pickGround, camSuffix:"casco" },
    "Dron de vigilancia":{ pick: pickDrone, camSuffix:"gimbal" },
    "Apoyo vial":{ pick: pickGround, camSuffix:"móvil" }
  };

  const visualForUnit = u => {
    const meta = UNIT_VISUAL[u.kind] || { pick: pickGround, camSuffix:"cam" };
    const clip = meta.pick();
    return {
      photo: u.photo || clip,
      stream: u.stream || clip,
      camLabel: u.cam || `${u.code} · ${meta.camSuffix}`
    };
  };

  const HIST_TONES = ["ok", "info", "task", "warn"];

  const buildFeeds = inc => {
    const feeds = [];
    if(inc.stream || inc.cam){
      feeds.push({
        id:"scene",
        label: inc.cam || "Escena",
        src: inc.stream || "",
        live: Boolean(inc.stream)
      });
    }
    (inc.units || []).forEach(u => {
      const v = visualForUnit(u);
      if(!v.stream) return;
      feeds.push({
        id: u.code,
        label: v.camLabel,
        src: v.stream,
        live: true
      });
    });
    return feeds;
  };

  const bindStreamCarousel = (root, feeds) => {
    if(!root || !feeds.length) return;
    const frame = root.querySelector(".incident-stream__frame");
    const live = root.querySelector(".incident-stream__live");
    const tabs = root.querySelectorAll("[data-feed-i]");
    const setFeed = i => {
      const feed = feeds[i];
      if(!feed || !frame) return;
      const media = typeof nexusLiveMediaTag === "function"
        ? nexusLiveMediaTag(feed.src, "incident-stream__photo", "")
        : (feed.src
          ? `<img class="incident-stream__photo" src="${feed.src}" alt="" width="640" height="360" decoding="async">`
          : "");
      const badge = live
        ? live.outerHTML
        : `<span class="incident-stream__live"><i></i>EN VIVO · ${feed.label}</span>`;
      frame.innerHTML = (media || `<span class="incident-stream__placeholder">Señal · ${feed.label}</span>`)
        + badge;
      const liveNow = frame.querySelector(".incident-stream__live");
      if(liveNow){
        liveNow.innerHTML = feed.live
          ? `<i></i>EN VIVO · ${feed.label}`
          : feed.label;
      }
      tabs.forEach(tab => {
        const on = Number(tab.dataset.feedI) === i;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", String(on));
      });
    };
    tabs.forEach(tab => {
      tab.addEventListener("click", () => setFeed(Number(tab.dataset.feedI)));
    });
    setFeed(0);
  };

  const renderDetail = inc => {
    if(!detailEl || !detailCard) return;
    if(!inc){
      detailEl.innerHTML = "";
      if(detailTitle) detailTitle.textContent = "Detalle";
      if(detailPriority){
        detailPriority.innerHTML = "";
        detailPriority.hidden = true;
      }
      showListView();
      return;
    }

    showDetailView();
    const pr = INCIDENT_PRIORITY[inc.priority];
    const st = INCIDENT_STATUS[inc.status];
    if(detailTitle) detailTitle.textContent = `Incidente ${inc.folio}`;
    if(detailPriority){
      detailPriority.innerHTML = chip(pr.label, pr.tone);
      detailPriority.hidden = false;
    }

    const unitList = inc.units || [];
    const units = unitList.length
      ? unitList.map(u => {
        const v = visualForUnit(u);
        const media = typeof nexusLiveMediaTag === "function"
          ? nexusLiveMediaTag(v.photo, "incident-unit__photo", "assets/perro1.mp4")
          : `<img class="incident-unit__photo" src="${v.photo}" alt="" decoding="async">`;
        return `<li class="incident-unit">`
          + media
          + `<span class="incident-unit__meta">`
          + `<span class="incident-unit__code">${u.code}</span>`
          + `<span class="incident-unit__kind">${u.kind}</span>`
          + `</span>`
          + `<span class="incident-unit__eta">${u.eta}</span>`
          + `</li>`;
      }).join("")
      : `<li class="incident-unit incident-unit--empty">Sin unidades asignadas</li>`;

    const histItems = inc.history || [];
    const history = histItems.map((h, i) => {
      const last = i === histItems.length - 1;
      const tone = last ? "live" : HIST_TONES[i % HIST_TONES.length];
      return `<li class="incident-hist__item incident-hist__item--${tone}">`
        + `<span class="incident-hist__dot" aria-hidden="true">${last ? "<i></i>" : ""}</span>`
        + `<span class="incident-hist__body">`
        + `<span class="incident-hist__t">${h.t}</span>`
        + `<span class="incident-hist__text">${h.text}</span>`
        + `</span></li>`;
    }).join("");

    const feeds = buildFeeds(inc);
    const tabs = feeds.length > 1
      ? `<div class="incident-stream__tabs" role="tablist" aria-label="Cámaras del incidente">`
        + feeds.map((f, i) =>
          `<button type="button" class="incident-stream__tab${i === 0 ? " is-active" : ""}"`
          + ` role="tab" data-feed-i="${i}" aria-selected="${i === 0}">${f.label}</button>`
        ).join("")
        + `</div>`
      : "";

    const first = feeds[0];
    const firstMedia = first && first.src && typeof nexusLiveMediaTag === "function"
      ? nexusLiveMediaTag(first.src, "incident-stream__photo", "")
      : (first && first.src
        ? `<img class="incident-stream__photo" src="${first.src}" alt="" width="640" height="360" decoding="async">`
        : "");
    const streamFrame = first
      ? `<div class="incident-stream__frame">`
        + (firstMedia || `<span class="incident-stream__placeholder">Señal · ${first.label}</span>`)
        + `<span class="incident-stream__live"><i></i>EN VIVO · ${first.label}</span>`
        + `</div>`
      : `<div class="incident-stream__frame">`
        + `<span class="incident-stream__placeholder">Sin señal</span>`
        + `</div>`;

    detailEl.innerHTML =
      `<div class="incident-detail">`
      + `<div class="incident-stream" aria-label="Stream de cámara">`
      + streamFrame
      + tabs
      + `</div>`
      + `<p class="incident-detail__type">${inc.type}</p>`
      + `<div class="route-detail__grid">`
      + `<div class="route-detail__field"><span class="route-detail__label">Estatus</span>`
      + `<span class="route-detail__value">${chip(st.label, st.tone)}</span></div>`
      + `<div class="route-detail__field"><span class="route-detail__label">Tiempo</span>`
      + `<span class="route-detail__value">${inc.elapsed}</span></div>`
      + `<div class="route-detail__field route-detail__span"><span class="route-detail__label">Ubicación</span>`
      + `<span class="route-detail__value">${inc.address} · ${inc.sector}</span></div>`
      + `<div class="route-detail__field route-detail__span"><span class="route-detail__label">Descripción</span>`
      + `<span class="route-detail__value">${inc.description}</span></div>`
      + `</div>`
      + `<div class="incident-block">`
      + `<h3 class="incident-block__title">Unidades asignadas</h3>`
      + `<ul class="incident-units">${units}</ul>`
      + `</div>`
      + `<div class="incident-block">`
      + `<h3 class="incident-block__title">Historial</h3>`
      + `<ol class="incident-hist">${history}</ol>`
      + `</div></div>`;

    bindStreamCarousel(detailEl.querySelector(".incident-stream"), feeds);
  };

  const syncMap = inc => {
    if(typeof window.nexusFocusDeviceMarker === "function"){
      window.nexusFocusDeviceMarker(null);
    }
    if(typeof window.nexusClearIncidentAssignedUnits === "function"){
      window.nexusClearIncidentAssignedUnits();
    }else if(typeof window.nexusFocusUnitMarker === "function"){
      window.nexusFocusUnitMarker(null);
    }else if(typeof window.nexusClearMapRoute === "function"){
      window.nexusClearMapRoute();
    }
    if(!inc){
      if(typeof window.nexusClearIncidentPopcard === "function"){
        window.nexusClearIncidentPopcard();
      }else if(typeof window.nexusFocusIncidentMarker === "function"){
        window.nexusFocusIncidentMarker(null);
      }
      return;
    }
    if(typeof window.nexusShowIncidentPopcard === "function"){
      window.nexusShowIncidentPopcard({
        markerIndex: inc.markerIndex,
        incidentId: inc.id,
        folio: inc.folio,
        desc: `${inc.type} · ${inc.address}`,
        cam: inc.cam,
        stream: inc.stream,
        lng: inc.lng,
        lat: inc.lat
      });
    }else if(typeof window.nexusFocusIncidentMarker === "function"){
      window.nexusFocusIncidentMarker(inc.id);
    }
    if(typeof window.nexusShowIncidentAssignedUnits === "function"){
      window.nexusShowIncidentAssignedUnits(inc);
    }
  };

  const openIncident = id => {
    const inc = INCIDENTS.find(i => i.id === id);
    if(!inc) return;
    state.selectedId = id;
    renderDetail(inc);
    syncMap(inc);
  };

  const goBack = () => {
    state.selectedId = null;
    renderList();
    renderDetail(null);
    syncMap(null);
  };

  priorityRow?.addEventListener("click", e => {
    const btn = e.target.closest("[data-inc-priority]");
    if(!btn) return;
    state.priority = btn.dataset.incPriority;
    setChipGroup(priorityRow, "data-inc-priority", state.priority);
    renderList();
  });

  statusRow?.addEventListener("click", e => {
    const btn = e.target.closest("[data-inc-status]");
    if(!btn) return;
    state.status = btn.dataset.incStatus;
    setChipGroup(statusRow, "data-inc-status", state.status);
    renderList();
  });

  searchEl?.addEventListener("input", () => {
    state.query = searchEl.value;
    renderList();
  });

  listEl.addEventListener("click", e => {
    const row = e.target.closest(".incident[data-incident-id]");
    if(!row) return;
    openIncident(row.dataset.incidentId);
  });

  backBtn?.addEventListener("click", goBack);

  renderSummary();
  renderList();
  showListView();

  window.nexusClearIncidentSelection = goBack;
  window.nexusOpenIncidentById = openIncident;
  window.nexusOpenIncidentByMarker = markerIndex => {
    const inc = INCIDENTS.find(i => i.markerIndex === String(markerIndex));
    if(!inc) return false;
    openIncident(inc.id);
    return true;
  };
})();
