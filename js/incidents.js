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
      attending: live.filter(i => i.status === "attending").length,
      high: live.filter(i => i.priority === "high").length
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
      + `<span class="fleet__stat-label">En atención</span></div>`
      + `<div class="fleet__pct" role="listitem">`
      + `<span class="fleet__stat-value">${counts.high}</span>`
      + `<span class="fleet__stat-label">Prioridad alta</span></div>`;
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

  const renderDetail = inc => {
    if(!detailEl || !detailCard) return;
    if(!inc){
      detailEl.innerHTML = "";
      showListView();
      return;
    }

    showDetailView();
    if(detailTitle) detailTitle.textContent = `Incidente ${inc.folio}`;

    const pr = INCIDENT_PRIORITY[inc.priority];
    const st = INCIDENT_STATUS[inc.status];

    const units = (inc.units || []).length
      ? (inc.units || []).map(u =>
        `<li class="incident-unit">`
        + `<span class="incident-unit__code">${u.code}</span>`
        + `<span class="incident-unit__kind">${u.kind}</span>`
        + `<span class="incident-unit__eta">${u.eta}</span>`
        + `</li>`
      ).join("")
      : `<li class="incident-unit incident-unit--empty">Sin unidades asignadas</li>`;

    const history = (inc.history || []).map(h =>
      `<li class="incident-hist__item">`
      + `<span class="incident-hist__t">${h.t}</span>`
      + `<span class="incident-hist__text">${h.text}</span>`
      + `</li>`
    ).join("");

    detailEl.innerHTML =
      `<div class="incident-detail">`
      + `<div class="incident-stream" aria-label="Stream de cámara">`
      + `<div class="incident-stream__frame">`
      + `<span class="incident-stream__live"><i></i>EN VIVO · ${inc.cam}</span>`
      + `<span class="incident-stream__placeholder">Señal · ${inc.cam}</span>`
      + `</div></div>`
      + `<div class="route-detail__grid">`
      + `<div class="route-detail__field"><span class="route-detail__label">Prioridad</span>`
      + `<span class="route-detail__value">${chip(pr.label, pr.tone)}</span></div>`
      + `<div class="route-detail__field"><span class="route-detail__label">Estatus</span>`
      + `<span class="route-detail__value">${chip(st.label, st.tone)}</span></div>`
      + `<div class="route-detail__field"><span class="route-detail__label">Tipo</span>`
      + `<span class="route-detail__value">${inc.type}</span></div>`
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
  };

  const syncMap = inc => {
    if(typeof window.nexusFocusDeviceMarker === "function"){
      window.nexusFocusDeviceMarker(null);
    }
    if(typeof window.nexusFocusUnitMarker === "function"){
      window.nexusFocusUnitMarker(null);
    }
    if(typeof window.nexusClearMapRoute === "function"){
      window.nexusClearMapRoute();
    }
    if(!inc){
      if(typeof window.nexusClearIncidentPopcard === "function"){
        window.nexusClearIncidentPopcard();
      }
      return;
    }
    if(typeof window.nexusShowIncidentPopcard === "function"){
      window.nexusShowIncidentPopcard({
        markerIndex: inc.markerIndex,
        folio: inc.folio,
        desc: `${inc.type} · ${inc.address}`,
        cam: inc.cam,
        lng: inc.lng,
        lat: inc.lat
      });
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
  window.nexusOpenIncidentByMarker = markerIndex => {
    const inc = INCIDENTS.find(i => i.markerIndex === String(markerIndex));
    if(!inc) return false;
    openIncident(inc.id);
    return true;
  };
})();
