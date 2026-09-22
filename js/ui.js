/* ============================================================
   PANEL DE MÉTRICAS — render de la columna izquierda
   Lee de DOMAINS (data.js) y repinta cifra, gráfica, categorías,
   sectores e indicadores al cambiar de dominio.
   ============================================================ */

const $ = s => document.querySelector(s);
const arrow = dir => (dir==="up"||dir==="up-bad") ? "↑" : "↓";
const deltaClass = dir => "delta--"+dir;

function sparkline(data){
  const W=320,H=52,max=Math.max(...data),min=Math.min(...data),span=(max-min)||1;
  const pts = data.map((v,i)=>[ i*(W/(data.length-1)), H-4-((v-min)/span)*(H-10) ]);
  $("#spark-line").setAttribute("points", pts.map(p=>p.join(",")).join(" "));
  $("#spark-area").setAttribute("d", `M${pts[0][0]},${H} `+pts.map(p=>`L${p[0]},${p[1]}`).join(" ")+` L${W},${H} Z`);
  $("#spark-dots").innerHTML = pts.filter((_,i)=>i%2===0)
    .map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="2"/>`).join("");
}

function render(key){
  const d = DOMAINS[key];
  $("#sum-title").textContent = d.section;
  $("#hl-label").textContent  = d.label;
  $("#hl-value").textContent  = d.value;
  $("#hl-unit").textContent   = d.unit;
  $("#hl-delta").className    = "delta "+deltaClass(d.dir);
  $("#hl-delta").innerHTML    = `${arrow(d.dir)} ${d.delta} <span>${d.note}</span>`;
  sparkline(d.trend);

  $("#cat-title").textContent = d.catTitle;
  $("#cats").innerHTML = d.cats.map(c=>`
    <button class="row" type="button">
      <span class="row__chip" style="background:color-mix(in srgb, var(${c.c}) 16%, transparent);color:var(${c.c})">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" width="14" height="14"><path d="${c.i}"/></svg>
      </span>
      <span class="row__name">${c.n}</span>
      <span class="row__value">${c.v}</span>
      <span class="row__delta ${deltaClass(c.dir)}">${arrow(c.dir)} ${c.d}</span>
    </button>`).join("");

  $("#sect-title").textContent = d.sectTitle;
  $("#sectors").innerHTML = d.sectors.map(s=>{
    const c=2*Math.PI*20, off=c-(s.p/100)*c;
    return `<div class="sector">
      <div class="donut">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="4"/>
          <circle cx="24" cy="24" r="20" fill="none" stroke="var(${s.c})" stroke-width="4"
                  stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"/>
        </svg>
        <span class="donut__pct">${s.p}%</span>
      </div>
      <p class="sector__name">${s.n}</p>
      <div class="sector__value">${s.v}<small>${s.u}</small></div>
      <span class="sector__delta ${deltaClass(s.dir)}">${arrow(s.dir)} ${s.d}</span>
    </div>`;
  }).join("");

  $("#kpis").innerHTML = d.kpis.map(k=>`
    <div class="kpi">
      <div class="kpi__value">${k.v}<small>${k.s}</small></div>
      <div class="kpi__label">${k.l}</div>
      <div class="kpi__delta ${deltaClass(k.dir)}">${arrow(k.dir)} ${k.d}</div>
    </div>`).join("");
}

document.querySelectorAll(".domain").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".domain").forEach(b=>{
      b.classList.remove("is-active"); b.setAttribute("aria-selected","false");
    });
    btn.classList.add("is-active"); btn.setAttribute("aria-selected","true");
    render(btn.dataset.domain);
  });
});

/* Reloj de la maqueta: avanza desde la hora escenificada, no desde la del equipo,
   para que no contradiga la fecha del encabezado durante la demo. */
(function clock(){
  let t = 11*60+24;
  const el = $("#clock");
  if(!el) return;
  setInterval(()=>{
    t=(t+1)%1440;
    el.textContent = String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0");
  },60000);
})();

/* Arranque */
render("seguridad");
