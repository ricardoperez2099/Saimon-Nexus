/* ============================================================
   RUTAS DE PATRULLAJE — navegación lista → detalle + trazo
   Datos: PATROL_ROUTES (data.js). Teatro visual.
   ============================================================ */

(function patrolRoutesPanel(){
  const listEl = document.getElementById("routes-list");
  const listCard = document.getElementById("routes-list-card");
  const countEl = document.getElementById("routes-count");
  const detailEl = document.getElementById("routes-detail");
  const detailCard = document.getElementById("routes-detail-card");
  const detailTitle = document.getElementById("routes-detail-title");
  const backBtn = document.getElementById("routes-detail-back");
  const searchEl = document.getElementById("routes-search");
  const statusRow = document.getElementById("routes-filter-status");
  const originRow = document.getElementById("routes-filter-origin");
  if(!listEl || !listCard || typeof PATROL_ROUTES === "undefined") return;

  const state = {
    status: "all",
    origin: "all",
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

  const matches = r => {
    if(state.status !== "all" && r.status !== state.status) return false;
    if(state.origin !== "all" && r.origin !== state.origin) return false;
    const q = state.query.trim().toLowerCase();
    if(!q) return true;
    const hay = `${r.name} ${r.sector} ${r.unit} ${r.author} ${r.start} ${r.end}`.toLowerCase();
    return hay.includes(q);
  };

  const filtered = () => {
    const list = PATROL_ROUTES.filter(matches);
    list.sort((a, b) => {
      const ra = ROUTE_STATUS_RANK[a.status] - ROUTE_STATUS_RANK[b.status];
      if(ra !== 0) return ra;
      return a.name.localeCompare(b.name);
    });
    return list;
  };

  const chip = (label, tone) =>
    `<span class="status status--${tone}">${label}</span>`;

  const routeRow = r => {
    const st = ROUTE_STATUS[r.status];
    const or = ROUTE_ORIGIN[r.origin];
    return `<button type="button" class="route" data-route-id="${r.id}">`
      + `<span class="route__top">`
      + `<span class="route__name">${r.name}</span>`
      + `<span class="route__chips">`
      + chip(or.label, or.tone)
      + chip(st.label, st.tone)
      + `</span></span>`
      + `<span class="route__meta">`
      + `<span>${r.sector}</span>`
      + `<span>·</span>`
      + `<span>${r.unit}</span>`
      + `<span>·</span>`
      + `<span>${r.progress}</span>`
      + `</span></button>`;
  };

  const renderList = () => {
    const list = filtered();
    if(countEl){
      countEl.textContent = list.length === PATROL_ROUTES.length
        ? `${list.length} rutas`
        : `${list.length} de ${PATROL_ROUTES.length}`;
    }
    if(!list.length){
      listEl.innerHTML = `<p class="inventory__empty">Ninguna ruta coincide</p>`;
      return;
    }
    listEl.innerHTML = list.map(routeRow).join("");
  };

  const stepClass = dir => dir === "arrive" ? " route-step--arrive" : "";

  const showListView = () => {
    listCard.hidden = false;
    if(detailCard) detailCard.hidden = true;
  };

  const showDetailView = () => {
    listCard.hidden = true;
    if(detailCard) detailCard.hidden = false;
  };

  const renderDetail = route => {
    if(!detailEl || !detailCard) return;
    if(!route){
      detailEl.innerHTML = "";
      showListView();
      return;
    }

    showDetailView();
    if(detailTitle) detailTitle.textContent = route.name;

    const st = ROUTE_STATUS[route.status];
    const or = ROUTE_ORIGIN[route.origin];
    const corps = (route.corps || []).map(c => `<span class="route-tag">${c}</span>`).join("");

    detailEl.innerHTML =
      `<div class="route-detail">`
      + `<div class="route-detail__grid">`
      + `<div class="route-detail__field"><span class="route-detail__label">Estado</span>`
      + `<span class="route-detail__value">${chip(st.label, st.tone)} ${chip(or.label, or.tone)}</span></div>`
      + `<div class="route-detail__field"><span class="route-detail__label">Unidad</span>`
      + `<span class="route-detail__value">${route.unit}</span></div>`
      + `<div class="route-detail__field"><span class="route-detail__label">Tipo</span>`
      + `<span class="route-detail__value">${route.type}</span></div>`
      + `<div class="route-detail__field"><span class="route-detail__label">Periodo</span>`
      + `<span class="route-detail__value">${route.period}</span></div>`
      + `<div class="route-detail__field"><span class="route-detail__label">Nivel</span>`
      + `<span class="route-detail__value">${route.level}</span></div>`
      + `<div class="route-detail__field"><span class="route-detail__label">Cumplimiento</span>`
      + `<span class="route-detail__value">${route.compliance}% · ${route.progress}</span></div>`
      + `<div class="route-detail__field route-detail__span"><span class="route-detail__label">Corporaciones</span>`
      + `<span class="route-detail__tags">${corps}</span></div>`
      + `<div class="route-detail__field route-detail__span"><span class="route-detail__label">Incidentes que cubre</span>`
      + `<span class="route-detail__value">${(route.incidents || []).join(", ")}</span></div>`
      + `<div class="route-detail__field route-detail__span"><span class="route-detail__label">Origen de emergencias</span>`
      + `<span class="route-detail__value">${(route.origins || []).join(", ")}</span></div>`
      + `<div class="route-detail__field route-detail__span"><span class="route-detail__label">Autoría</span>`
      + `<span class="route-detail__value">${route.author}</span></div>`
      + `</div>`
      + `<div class="route-itin">`
      + `<div class="route-itin__head"><h3 class="route-itin__title">Itinerario</h3></div>`
      + `<div class="route-itin__ends">`
      + `<div class="route-itin__end"><span class="route-itin__mark">A</span>`
      + `<span>Inicio: <b>${route.start}</b></span></div>`
      + `<div class="route-itin__end"><span class="route-itin__mark">B</span>`
      + `<span>Fin: <b>${route.end}</b></span></div>`
      + `</div>`
      + `<ol class="route-steps">`
      + (route.steps || []).map((s, i) =>
        `<li class="route-step${stepClass(s.dir)}">`
        + `<span class="route-step__n">${s.dir === "arrive" ? "✓" : i + 1}</span>`
        + `<span class="route-step__text">${s.text}</span>`
        + `<span class="route-step__dist">${s.dist || ""}</span>`
        + `</li>`
      ).join("")
      + `</ol></div></div>`;
  };

  const syncMap = route => {
    if(typeof window.nexusFocusUnitMarker === "function"){
      window.nexusFocusUnitMarker(null);
    }
    if(!route){
      if(typeof window.nexusClearMapRoute === "function"){
        window.nexusClearMapRoute();
      }
      return;
    }
    if(typeof window.nexusShowPatrolRoute === "function"){
      window.nexusShowPatrolRoute(route.coords, {
        kind: route.kind || "ground",
        colorToken: "--accent-orange",
        key: "patrol:" + route.id
      });
    }
  };

  const openRoute = id => {
    const route = PATROL_ROUTES.find(r => r.id === id);
    if(!route) return;
    state.selectedId = id;
    renderDetail(route);
    syncMap(route);
  };

  const goBack = () => {
    state.selectedId = null;
    renderList();
    renderDetail(null);
    syncMap(null);
  };

  statusRow?.addEventListener("click", e => {
    const btn = e.target.closest("[data-route-status]");
    if(!btn) return;
    state.status = btn.dataset.routeStatus;
    setChipGroup(statusRow, "data-route-status", state.status);
    renderList();
  });

  originRow?.addEventListener("click", e => {
    const btn = e.target.closest("[data-route-origin]");
    if(!btn) return;
    state.origin = btn.dataset.routeOrigin;
    setChipGroup(originRow, "data-route-origin", state.origin);
    renderList();
  });

  searchEl?.addEventListener("input", () => {
    state.query = searchEl.value;
    renderList();
  });

  listEl.addEventListener("click", e => {
    const row = e.target.closest(".route[data-route-id]");
    if(!row) return;
    openRoute(row.dataset.routeId);
  });

  backBtn?.addEventListener("click", goBack);

  renderList();
  showListView();
  window.nexusClearPatrolSelection = goBack;
})();
