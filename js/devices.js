/* ============================================================
   SALUD DE DISPOSITIVOS — panel del modo Dispositivos
   Lista + filtros + búsqueda. Datos en data.js (DEVICES).
   ============================================================ */

(function deviceHealthPanel(){
  const summaryEl = document.getElementById("fleet-summary");
  const pctEl = document.getElementById("fleet-pct");
  const listEl = document.getElementById("devices-list");
  const countEl = document.getElementById("inventory-count");
  const searchEl = document.getElementById("devices-search");
  const statusRow = document.getElementById("filter-status");
  const typeRow = document.getElementById("filter-type");
  if(!summaryEl || !listEl || typeof DEVICES === "undefined") return;

  const ICONS = {
    camara:'<path d="M3 7h11v10H3z"/><path d="m14 11 7-4v10l-7-4"/>',
    unidad:'<path d="M5 17h14M6.5 17V9.5L8 6h8l1.5 3.5V17"/><circle cx="8" cy="19" r="1.4"/><circle cx="16" cy="19" r="1.4"/>',
    robot:'<rect x="5" y="8" width="14" height="11" rx="2.5"/><path d="M12 4v4"/>',
    dron:'<path d="M9 9h6v6H9z"/><path d="M9 9 5 5M15 9l4-4M9 15l-4 4M15 15l4 4"/>',
    sensor:'<circle cx="12" cy="12" r="2.5"/><path d="M6.5 6.5a8 8 0 0 0 0 11M17.5 6.5a8 8 0 0 1 0 11"/>',
    lpr:'<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 11v2M11 11v2M15 11v2"/>'
  };

  const CRITICAL = new Set(["offline", "damaged", "degraded"]);

  const state = {
    status: "all",
    type: "all",
    query: "",
    openSector: undefined,
    selectedId: null
  };

  const countsByStatus = () => {
    const c = { online:0, degraded:0, offline:0, damaged:0 };
    DEVICES.forEach(d => { c[d.status] = (c[d.status] || 0) + 1; });
    return c;
  };

  const renderSummary = () => {
    const c = countsByStatus();
    const total = DEVICES.length || 1;
    const onlinePct = Math.round((c.online / total) * 100);
    if(pctEl) pctEl.textContent = `${onlinePct}% en línea`;

    summaryEl.innerHTML = [
      ["online", "En línea", c.online],
      ["degraded", "Degradado", c.degraded],
      ["offline", "Fuera", c.offline],
      ["damaged", "Dañado", c.damaged]
    ].map(([key, label, n]) =>
      `<div class="fleet__stat fleet__stat--${key}" role="listitem">`
      + `<span class="fleet__stat-value">${n}</span>`
      + `<span class="fleet__stat-label">${label}</span>`
      + `</div>`
    ).join("");
  };

  const matches = d => {
    if(state.type !== "all" && d.type !== state.type) return false;
    if(state.status === "critical"){
      if(!CRITICAL.has(d.status)) return false;
    }else if(state.status !== "all" && d.status !== state.status){
      return false;
    }
    const q = state.query.trim().toLowerCase();
    if(!q) return true;
    const hay = `${d.code} ${d.name} ${d.sector} ${DEVICE_TYPES[d.type]?.label || ""}`.toLowerCase();
    return hay.includes(q);
  };

  const filtered = () => {
    const list = DEVICES.filter(matches);
    list.sort((a, b) => {
      const ra = DEVICE_STATUS_RANK[a.status] - DEVICE_STATUS_RANK[b.status];
      if(ra !== 0) return ra;
      return a.code.localeCompare(b.code);
    });
    return list;
  };

  const groupBySector = list => {
    const map = new Map();
    list.forEach(d => {
      if(!map.has(d.sector)) map.set(d.sector, []);
      map.get(d.sector).push(d);
    });
    return map;
  };

  const statusChip = status => {
    const meta = DEVICE_STATUS[status];
    if(!meta) return "";
    return `<span class="status status--${meta.tone} device__status">${meta.label}</span>`;
  };

  const deviceRow = d => {
    const pressed = d.id === state.selectedId;
    const typeLabel = DEVICE_TYPES[d.type]?.label || d.type;
    const icon = ICONS[d.type] || "";
    return `<li>`
      + `<button type="button" class="device" data-device-id="${d.id}"`
      + ` aria-pressed="${pressed}"`
      + ` aria-label="${d.code}, ${typeLabel}, ${DEVICE_STATUS[d.status]?.label || ""}">`
      + `<span class="device__icon" aria-hidden="true">`
      + `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${icon}</svg>`
      + `</span>`
      + `<span class="device__meta">`
      + `<span class="device__code">${d.code}</span>`
      + `<span class="device__name">${d.name} · ${typeLabel}</span>`
      + `</span>`
      + statusChip(d.status)
      + `</button></li>`;
  };

  const renderList = () => {
    const list = filtered();
    if(countEl){
      countEl.textContent = list.length === DEVICES.length
        ? `${list.length} dispositivos`
        : `${list.length} de ${DEVICES.length}`;
    }

    if(!list.length){
      listEl.innerHTML = `<p class="inventory__empty">Ningún dispositivo coincide</p>`;
      return;
    }

    const groups = groupBySector(list);
    const sectors = [...groups.keys()];
    if(state.openSector === undefined){
      state.openSector = sectors[0];
    }else if(state.openSector !== null && !groups.has(state.openSector)){
      state.openSector = sectors[0] || null;
    }

    listEl.innerHTML = sectors.map((sector, i) => {
      const items = groups.get(sector);
      const panelId = `dsec-panel-${i}`;
      const expanded = sector === state.openSector;
      return `<div class="dsec">`
        + `<button type="button" class="dsec__toggle" aria-expanded="${expanded}"`
        + ` aria-controls="${panelId}" data-sector="${sector}">`
        + `<span>${sector}</span>`
        + `<span class="dsec__count">${items.length}</span>`
        + `<svg class="dsec__chevron" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>`
        + `</button>`
        + `<ul class="dsec__list" id="${panelId}" ${expanded ? "" : "hidden"}>`
        + items.map(deviceRow).join("")
        + `</ul></div>`;
    }).join("");
  };

  const setChipGroup = (row, attr, value) => {
    row.querySelectorAll(`[${attr}]`).forEach(btn => {
      const on = btn.getAttribute(attr) === value;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  };

  const refresh = () => {
    renderSummary();
    renderList();
  };

  statusRow?.addEventListener("click", e => {
    const btn = e.target.closest("[data-filter-status]");
    if(!btn) return;
    state.status = btn.dataset.filterStatus;
    setChipGroup(statusRow, "data-filter-status", state.status);
    refresh();
  });

  typeRow?.addEventListener("click", e => {
    const btn = e.target.closest("[data-filter-type]");
    if(!btn) return;
    state.type = btn.dataset.filterType;
    setChipGroup(typeRow, "data-filter-type", state.type);
    refresh();
  });

  searchEl?.addEventListener("input", () => {
    state.query = searchEl.value;
    refresh();
  });

  listEl.addEventListener("click", e => {
    const toggle = e.target.closest(".dsec__toggle");
    if(toggle){
      const sector = toggle.dataset.sector;
      state.openSector = state.openSector === sector ? null : sector;
      renderList();
      return;
    }

    const row = e.target.closest(".device[data-device-id]");
    if(!row) return;
    const id = row.dataset.deviceId;
    const device = DEVICES.find(d => d.id === id);
    if(!device) return;

    state.selectedId = state.selectedId === id ? null : id;
    renderList();

    if(typeof window.nexusFocusDeviceMarker === "function"){
      window.nexusFocusDeviceMarker(
        state.selectedId ? device.markerKey : null,
        state.selectedId ? device.code : null
      );
    }
  });

  refresh();
  window.nexusRefreshDevicePanel = refresh;
})();
