/* ============================================================
   DATOS DE DEMOSTRACIÓN — TODO PLACEHOLDER
   Cifras, calles, sectores y porcentajes son ilustrativos.
   Ninguno está verificado contra el producto real.
   Al conectar datos reales, este archivo es el único que cambia.

   MODELO B: el dominio cambia SOLO la columna izquierda.
   El mapa y el panel de IA permanecen en contexto de seguridad.
   ============================================================ */

const DOMAINS = {
  seguridad:{
    section:"Resumen operativo", label:"Total de incidentes",
    value:"132,897", unit:"", delta:"+21,504", dir:"up-bad", note:"vs. periodo anterior",
    trend:[38,42,40,47,55,58,52,60,66,63,71,74,70,78],
    catTitle:"Incidentes por categoría",
    cats:[
      {n:"Médico",v:"32,421",d:"+12%",dir:"up-bad",c:"--accent-blue",i:"M12 4v16M4 12h16"},
      {n:"Protección Civil",v:"18,320",d:"+8%",dir:"up-bad",c:"--accent-orange",i:"M12 3 5 6v6c0 4.4 3 8.3 7 9 4-.7 7-4.6 7-9V6l-7-3Z"},
      {n:"Seguridad",v:"28,911",d:"+15%",dir:"up-bad",c:"--accent-red",i:"M12 3 5 6v6c0 4.4 3 8.3 7 9 4-.7 7-4.6 7-9V6l-7-3Z"},
      {n:"Servicios públicos",v:"14,223",d:"−6%",dir:"down-good",c:"--accent-purple",i:"M4 7h16M4 12h16M4 17h10"},
      {n:"Asistencia",v:"12,043",d:"+10%",dir:"up-bad",c:"--accent-green",i:"M12 4v16M4 12h16"}
    ],
    sectTitle:"Sectores con mayor incidencia",
    sectors:[
      {n:"Sector 1 Norte",v:"1,467",u:"incidentes",p:97,c:"--accent-red",d:"+12%",dir:"up-bad"},
      {n:"Sector 2 Norte",v:"1,398",u:"incidentes",p:96,c:"--accent-red",d:"+8%",dir:"up-bad"},
      {n:"Sector 5 Sur",v:"1,223",u:"incidentes",p:95,c:"--accent-orange",d:"+6%",dir:"up-bad"}
    ],
    kpis:[
      {v:"3.8",s:"min",l:"Tiempo de respuesta",d:"−28%",dir:"down-good"},
      {v:"18",s:"",l:"Misiones activas",d:"+12%",dir:"up"},
      {v:"96",s:"%",l:"Dispositivos en línea",d:"+4%",dir:"up"},
      {v:"147",s:"",l:"Incidentes atendidos",d:"+12%",dir:"up"}
    ]
  },
  movilidad:{
    section:"Resumen de movilidad", label:"Aforo vehicular registrado",
    value:"1,284,510", unit:"", delta:"+4.2%", dir:"up", note:"vs. mismo día de la semana pasada",
    trend:[22,18,20,34,62,74,68,55,49,52,64,77,71,58],
    catTitle:"Incidencias de tránsito",
    cats:[
      {n:"Congestión severa",v:"312",d:"+18%",dir:"up-bad",c:"--accent-red",i:"M5 17h14M6.5 17V9.5L8 6h8l1.5 3.5V17"},
      {n:"Accidentes viales",v:"148",d:"−5%",dir:"down-good",c:"--accent-orange",i:"M12 4 2.5 20h19L12 4Z"},
      {n:"Semáforos fuera",v:"37",d:"+22%",dir:"up-bad",c:"--accent-purple",i:"M9 3h6v18H9z"},
      {n:"Obstrucción de vía",v:"96",d:"−11%",dir:"down-good",c:"--accent-blue",i:"M4 7h16M4 12h16M4 17h10"},
      {n:"Transporte público",v:"64",d:"+3%",dir:"up-bad",c:"--accent-green",i:"M5 17h14M6.5 17V6h11v11"}
    ],
    sectTitle:"Corredores con mayor carga",
    sectors:[
      {n:"Av. López Mateos",v:"38",u:"km/h prom.",p:88,c:"--accent-red",d:"−14%",dir:"down"},
      {n:"Periférico Norte",v:"44",u:"km/h prom.",p:74,c:"--accent-orange",d:"−6%",dir:"down"},
      {n:"Av. Vallarta",v:"51",u:"km/h prom.",p:61,c:"--accent-green",d:"+3%",dir:"up"}
    ],
    kpis:[
      {v:"41",s:"km/h",l:"Velocidad promedio",d:"−9%",dir:"down"},
      {v:"12",s:"",l:"Corredores saturados",d:"+3",dir:"up-bad"},
      {v:"88",s:"%",l:"Semáforos en línea",d:"−2%",dir:"down"},
      {v:"6.4",s:"min",l:"Tiempo de cruce",d:"+11%",dir:"up-bad"}
    ]
  },
  agua:{
    section:"Resumen hidrometeorológico", label:"Precipitación acumulada",
    value:"42.6", unit:"mm", delta:"+31.2 mm", dir:"up-bad", note:"en las últimas 24 h",
    trend:[2,3,5,4,8,14,26,38,44,41,33,28,22,18],
    catTitle:"Afectaciones por agua",
    cats:[
      {n:"Encharcamientos",v:"84",d:"+46%",dir:"up-bad",c:"--accent-blue",i:"M12 3s6 6.4 6 10a6 6 0 0 1-12 0c0-3.6 6-10 6-10Z"},
      {n:"Drenaje saturado",v:"29",d:"+18%",dir:"up-bad",c:"--accent-orange",i:"M4 12h16M8 12v6M16 12v6"},
      {n:"Nivel de cauce alto",v:"6",d:"+2",dir:"up-bad",c:"--accent-red",i:"M3 14c3-3 6 3 9 0s6 3 9 0"},
      {n:"Bombeo activo",v:"11",d:"+4",dir:"up",c:"--accent-green",i:"M12 3v18M6 9h12"},
      {n:"Vialidades cerradas",v:"7",d:"+3",dir:"up-bad",c:"--accent-purple",i:"M6 6l12 12M18 6 6 18"}
    ],
    sectTitle:"Zonas con riesgo de inundación",
    sectors:[
      {n:"Cuenca El Dean",v:"92",u:"% de capacidad",p:92,c:"--accent-red",d:"+26%",dir:"up-bad"},
      {n:"Arroyo Seco",v:"78",u:"% de capacidad",p:78,c:"--accent-orange",d:"+14%",dir:"up-bad"},
      {n:"Osario Poniente",v:"55",u:"% de capacidad",p:55,c:"--accent-green",d:"+5%",dir:"up"}
    ],
    kpis:[
      {v:"42.6",s:"mm",l:"Lluvia acumulada",d:"+31.2",dir:"up-bad"},
      {v:"11",s:"",l:"Bombas operando",d:"+4",dir:"up"},
      {v:"94",s:"%",l:"Pluviómetros en línea",d:"−1%",dir:"down"},
      {v:"7",s:"",l:"Vialidades cerradas",d:"+3",dir:"up-bad"}
    ]
  },
  residuos:{
    section:"Resumen de recolección", label:"Residuos recolectados",
    value:"1,842", unit:"t", delta:"+6.8%", dir:"up", note:"vs. periodo anterior",
    trend:[8,26,48,62,70,74,76,72,64,58,49,40,30,20],
    catTitle:"Estado del servicio",
    cats:[
      {n:"Rutas completadas",v:"128",d:"+9%",dir:"up",c:"--accent-green",i:"m5 12 5 5 9-9"},
      {n:"Rutas en curso",v:"34",d:"−2",dir:"down",c:"--accent-blue",i:"M5 17h14M6.5 17V9.5L8 6h8l1.5 3.5V17"},
      {n:"Contenedores llenos",v:"217",d:"+24%",dir:"up-bad",c:"--accent-orange",i:"M4 7h16M6 7l1 13h10l1-13"},
      {n:"Tiraderos clandestinos",v:"19",d:"+5",dir:"up-bad",c:"--accent-red",i:"M12 4 2.5 20h19L12 4Z"},
      {n:"Reportes ciudadanos",v:"143",d:"+11%",dir:"up-bad",c:"--accent-purple",i:"M4 6h16v10H8l-4 4V6Z"}
    ],
    sectTitle:"Zonas con menor cobertura",
    sectors:[
      {n:"Zona 7 Cruz del Sur",v:"68",u:"% cobertura",p:68,c:"--accent-red",d:"−12%",dir:"down"},
      {n:"Zona 4 Oblatos",v:"79",u:"% cobertura",p:79,c:"--accent-orange",d:"−4%",dir:"down"},
      {n:"Zona 2 Minerva",v:"91",u:"% cobertura",p:91,c:"--accent-green",d:"+2%",dir:"up"}
    ],
    kpis:[
      {v:"1,842",s:"t",l:"Toneladas del día",d:"+6.8%",dir:"up"},
      {v:"34",s:"",l:"Camiones en ruta",d:"−2",dir:"down"},
      {v:"79",s:"%",l:"Rutas completadas",d:"+9%",dir:"up"},
      {v:"217",s:"",l:"Contenedores llenos",d:"+24%",dir:"up-bad"}
    ]
  }
};

/* ============================================================
   FLOTA DE DISPOSITIVOS — salud (modo Dispositivos)
   markerKey = tipo-índice alineado a MARKERS en map.js.
   ============================================================ */
const DEVICE_STATUS = {
  online:   { label:"En línea",       tone:"success" },
  degraded: { label:"Degradado",      tone:"warning" },
  offline:  { label:"Fuera de línea", tone:"danger" },
  damaged:  { label:"Dañado",         tone:"danger" }
};

/* Operación de drones: verde en mapa = desplegado; gris = en hangar. */
const DRONE_OPS = {
  deployed: { label:"Desplegado", tone:"success" },
  hangar:   { label:"En hangar",  tone:"muted" }
};

const DEVICE_TYPES = {
  dron:      { label:"Dron",          short:"Dron" },
  perro:     { label:"Perro robot",   short:"Perro" },
  humanoide: { label:"Humanoide",     short:"Humanoide" },
  camara:    { label:"Cámara",        short:"Cámara" },
  arco:      { label:"Arco carretero", short:"Arco" }
};

const DEVICE_STATUS_RANK = { offline:0, damaged:1, degraded:2, online:3 };

const DEVICES = [
  { id:"cam-0412", code:"CAM-0412", name:"Av. Américas / López Mateos", type:"camara", sector:"Sector 1 Norte", status:"online",   markerKey:"camara-1" },
  { id:"cam-0418", code:"CAM-0418", name:"Plaza del Sol — acceso N",     type:"camara", sector:"Sector 1 Norte", status:"degraded", markerKey:"camara-2" },
  { id:"cam-0501", code:"CAM-0501", name:"Periférico — nodo 12",         type:"camara", sector:"Sector 2 Norte", status:"online",   markerKey:"camara-3" },
  { id:"cam-0522", code:"CAM-0522", name:"Av. Vallarta — cruce 8",       type:"camara", sector:"Sector 2 Norte", status:"offline",  markerKey:"camara-4" },
  { id:"cam-0603", code:"CAM-0603", name:"Sector 5 — torre sur",         type:"camara", sector:"Sector 5 Sur",   status:"damaged",  markerKey:"camara-5" },

  { id:"dr-03", code:"DR-03", name:"Óptica incidente", type:"dron", sector:"Sector 1 Norte", status:"online",
    ops:"deployed", model:"max", modelImg:"assets/dron-max.jpg", stream:"assets/cam-0412.png", markerKey:"dron-3" },
  { id:"dr-07", code:"DR-07", name:"Patrulla aérea N", type:"dron", sector:"Sector 2 Norte", status:"online",
    ops:"hangar", model:"compact", modelImg:"assets/dron-compact.jpg", markerKey:"dron-1" },
  { id:"dr-11", code:"DR-11", name:"Cobertura Sur", type:"dron", sector:"Sector 5 Sur", status:"degraded",
    ops:"hangar", model:"max", modelImg:"assets/dron-max.jpg", markerKey:"dron-2" },

  { id:"pr-zm14", code:"ZM-14", name:"Perro robot — Sector 1", type:"perro", sector:"Sector 1 Norte", status:"online",  markerKey:"perro-1" },
  { id:"pr-zm19", code:"ZM-19", name:"Perro robot — Sector 2", type:"perro", sector:"Sector 2 Norte", status:"damaged", markerKey:"perro-2" },
  { id:"pr-zm08", code:"ZM-08", name:"Perro robot — Sur",      type:"perro", sector:"Sector 5 Sur",   status:"online",  markerKey:"perro-3" },

  { id:"hu-a07",  code:"HU-07", name:"Humanoide apoyo médico", type:"humanoide", sector:"Sector 1 Norte", status:"online",
    modelImg:"assets/humanoide.jpg", markerKey:"humanoide-1" },
  { id:"hu-21",   code:"HU-21", name:"Humanoide patrulla N",   type:"humanoide", sector:"Sector 2 Norte", status:"degraded",
    modelImg:"assets/humanoide.jpg", markerKey:"humanoide-2" },
  { id:"hu-05",   code:"HU-05", name:"Humanoide disuasión S",  type:"humanoide", sector:"Sector 5 Sur",   status:"offline",
    modelImg:"assets/humanoide.jpg", markerKey:"humanoide-3" },

  { id:"arco-02", code:"ARC-02", name:"Arco Acceso Norte",  type:"arco", sector:"Sector 1 Norte", status:"online",
    stream:"assets/arco-01.png", markerKey:"arco-1" },
  { id:"arco-05", code:"ARC-05", name:"Arco Periférico",    type:"arco", sector:"Sector 2 Norte", status:"online",
    stream:"assets/arco-02.png", markerKey:"arco-2" },
  { id:"arco-08", code:"ARC-08", name:"Arco Salida Sur",    type:"arco", sector:"Sector 5 Sur",   status:"offline",
    stream:"assets/arco-01.png", markerKey:"arco-3" }
];

/* ============================================================
   RUTAS DE PATRULLAJE — modo Rutas (IA + humano)
   coords = LineString mock cerca del encuadre de Guadalajara.
   ============================================================ */
const ROUTE_STATUS = {
  active:    { label:"En curso",    tone:"info" },
  scheduled: { label:"Programada",  tone:"success" },
  paused:    { label:"Pausada",     tone:"warning" },
  breached:  { label:"Incumplida",  tone:"danger" }
};

const ROUTE_ORIGIN = {
  ai:     { label:"IA",     tone:"info" },
  human:  { label:"Humano", tone:"success" }
};

const ROUTE_STATUS_RANK = { breached:0, active:1, paused:2, scheduled:3 };

const PATROL_ROUTES = [
  {
    id:"rt-s1-am",
    name:"Sector 1 Norte — circuito matutino",
    sector:"Sector 1 Norte",
    origin:"ai",
    status:"active",
    type:"cíclica",
    period:"mañana",
    level:"Municipal",
    corps:["Policía municipal", "Vialidad"],
    unit:"ZM-12",
    progress:"Tramo 3 de 6",
    compliance:62,
    start:"Av. Américas / López Mateos",
    end:"Plaza del Sol — acceso N",
    incidents:["Colisión vehicular", "Abuso de autoridad", "Accidente de motocicleta"],
    origins:["Radio", "Llamada telefónica", "Botón de pánico"],
    author:"Simon Core",
    steps:[
      { dir:"south", text:"Hacia el sur en Av. Américas", dist:"320 m" },
      { dir:"right", text:"Girar a la derecha en López Mateos", dist:"480 m" },
      { dir:"straight", text:"Continuar por corredor Norte", dist:"650 m" },
      { dir:"right", text:"Girar a la derecha hacia Plaza del Sol", dist:"210 m" },
      { dir:"arrive", text:"Arribo a destino", dist:"" }
    ],
    coords:[
      [-103.3520, 20.6610],
      [-103.3510, 20.6585],
      [-103.3485, 20.6585],
      [-103.3485, 20.6640],
      [-103.3493, 20.6668]
    ]
  },
  {
    id:"rt-s2-pm",
    name:"Sector 2 Norte — patrulla vespertina",
    sector:"Sector 2 Norte",
    origin:"human",
    status:"scheduled",
    type:"cíclica",
    period:"tarde",
    level:"Estatal",
    corps:["Policía estatal", "Policía municipal"],
    unit:"ZM-21",
    progress:"Inicio 16:00",
    compliance:0,
    start:"Periférico — nodo 12",
    end:"Av. Vallarta — cruce 8",
    incidents:["Abandono de persona", "Accidente de motocicleta con lesionados"],
    origins:["Radio", "Llamada telefónica"],
    author:"VC",
    steps:[
      { dir:"south", text:"Hacia el sur en Periférico Norte", dist:"400 m" },
      { dir:"right", text:"Girar a la derecha a Av. Vallarta", dist:"550 m" },
      { dir:"straight", text:"Continuar por Vallarta", dist:"700 m" },
      { dir:"arrive", text:"Arribo a destino", dist:"" }
    ],
    coords:[
      [-103.3419, 20.6628],
      [-103.3435, 20.6600],
      [-103.3500, 20.6600],
      [-103.3576, 20.6592]
    ]
  },
  {
    id:"rt-s1-air",
    name:"Cobertura aérea — Américas",
    sector:"Sector 1 Norte",
    origin:"ai",
    status:"active",
    type:"puntual",
    period:"continuo",
    level:"Municipal",
    corps:["Vigilancia aérea"],
    unit:"DR-03",
    progress:"Sobre tramo 2 de 3",
    compliance:70,
    start:"Óptica incidente",
    end:"Estación norte",
    incidents:["Colisión vehicular", "Congestión severa"],
    origins:["Cámara", "Radio"],
    author:"Simon Core",
    steps:[
      { dir:"straight", text:"Vuelo directo sobre Av. Américas", dist:"780 m" },
      { dir:"straight", text:"Barrido norte del sector", dist:"420 m" },
      { dir:"arrive", text:"Regreso a estación", dist:"" }
    ],
    coords:[
      [-103.3510, 20.6543],
      [-103.3529, 20.6619],
      [-103.3493, 20.6668]
    ],
    kind:"air"
  },
  {
    id:"rt-s5-night",
    name:"Sector 5 Sur — ronda nocturna",
    sector:"Sector 5 Sur",
    origin:"human",
    status:"paused",
    type:"cíclica",
    period:"noche",
    level:"Municipal",
    corps:["Policía municipal"],
    unit:"ZM-08",
    progress:"Pausada por operador",
    compliance:35,
    start:"Sector 5 — torre sur",
    end:"Salida Sur LPR",
    incidents:["Abandono de persona", "Obstrucción de vía"],
    origins:["Botón de pánico", "Radio"],
    author:"VC",
    steps:[
      { dir:"south", text:"Hacia el sur desde torre sur", dist:"300 m" },
      { dir:"right", text:"Girar a la derecha en corredor Sur", dist:"500 m" },
      { dir:"straight", text:"Continuar a salida Sur", dist:"350 m" },
      { dir:"arrive", text:"Arribo a destino", dist:"" }
    ],
    coords:[
      [-103.3457, 20.6559],
      [-103.3480, 20.6540],
      [-103.3520, 20.6530],
      [-103.3552, 20.6534]
    ]
  },
  {
    id:"rt-s2-breach",
    name:"Sector 2 — refuerzo Periférico",
    sector:"Sector 2 Norte",
    origin:"ai",
    status:"breached",
    type:"puntual",
    period:"tarde",
    level:"Estatal",
    corps:["Policía estatal"],
    unit:"Sin asignar",
    progress:"Atraso +18 min",
    compliance:12,
    start:"Av. Vallarta — cruce 8",
    end:"Periférico — nodo 12",
    incidents:["Accidente de motocicleta", "Congestión severa"],
    origins:["Llamada telefónica", "Cámara"],
    author:"Simon Core",
    steps:[
      { dir:"north", text:"Hacia el norte en Vallarta", dist:"280 m" },
      { dir:"right", text:"Incorporación a Periférico", dist:"610 m" },
      { dir:"arrive", text:"Arribo a nodo 12", dist:"" }
    ],
    coords:[
      [-103.3576, 20.6592],
      [-103.3550, 20.6615],
      [-103.3419, 20.6628]
    ]
  },
  {
    id:"rt-s1-robot",
    name:"Unidad robótica — inspección S1",
    sector:"Sector 1 Norte",
    origin:"ai",
    status:"scheduled",
    type:"cíclica",
    period:"mañana",
    level:"Municipal",
    corps:["Fuerza robótica"],
    unit:"ZM-14",
    progress:"Inicio 07:30",
    compliance:0,
    start:"Base robótica S1",
    end:"Av. Américas 1420",
    incidents:["Colisión vehicular", "Servicios públicos"],
    origins:["Radio", "Sensor"],
    author:"Simon Core",
    steps:[
      { dir:"north", text:"Salida de base hacia Américas", dist:"220 m" },
      { dir:"right", text:"Girar a la derecha en Américas", dist:"390 m" },
      { dir:"arrive", text:"Arribo a punto de inspección", dist:"" }
    ],
    coords:[
      [-103.3536, 20.6574],
      [-103.3536, 20.6598],
      [-103.3529, 20.6598],
      [-103.3529, 20.6619]
    ]
  }
];

/* ============================================================
   INCIDENTES VIVOS — modo Incidentes (cola operativa)
   markerIndex / lng / lat: un marcador por incidente en el mapa.
   ============================================================ */
const INCIDENT_PRIORITY = {
  high:   { label:"Alta",  tone:"danger" },
  medium: { label:"Media", tone:"warning" },
  low:    { label:"Baja",  tone:"info" }
};

const INCIDENT_STATUS = {
  open:       { label:"Abierto",     tone:"danger" },
  dispatched: { label:"Despachado",  tone:"warning" },
  attending:  { label:"En atención", tone:"info" },
  closed:     { label:"Cerrado",     tone:"success" }
};

const INCIDENT_PRIORITY_RANK = { high:0, medium:1, low:2 };
const INCIDENT_STATUS_RANK = { open:0, dispatched:1, attending:2, closed:3 };

const INCIDENTS = [
  {
    id:"inc-0172",
    folio:"4300090172",
    type:"Colisión vehicular",
    priority:"high",
    status:"attending",
    sector:"Sector 1 Norte",
    address:"Av. Américas 1420",
    elapsed:"06:12",
    cam:"CAM-0412",
    stream:"assets/cam-0412.png",
    description:"Colisión entre vehículo particular y motocicleta. Dos adultos involucrados; vía parcialmente obstruida. Confirmado por 4 cámaras y despacho autónomo en curso.",
    units:[
      { code:"ZM-14", kind:"Perro robot", eta:"3 min" },
      { code:"HU-07", kind:"Humanoide", eta:"5 min" },
      { code:"DR-03", kind:"Dron de vigilancia", eta:"Sobrevolando" }
    ],
    history:[
      { t:"11:08", text:"Clasificado como prioridad alta por Simon Core" },
      { t:"11:11", text:"Validación en cámaras CAM-0412 / CAM-0418" },
      { t:"11:12", text:"Despacho de ZM-14, HU-07 y DR-03" },
      { t:"11:14", text:"DR-03 en estación sobre el punto" }
    ],
    markerIndex:"1",
    lng:-103.3529,
    lat:20.6619
  },
  {
    id:"inc-0214",
    folio:"4300090214",
    type:"Alteración del orden",
    priority:"medium",
    status:"dispatched",
    sector:"Sector 2 Norte",
    address:"Av. López Mateos · cruce 8",
    elapsed:"14:40",
    cam:"CAM-0501",
    stream:"assets/cam-0501.jpg",
    description:"Reporte de alteración en vía pública. Dos unidades en ruta. Sin lesionados reportados hasta el momento.",
    units:[
      { code:"ZM-21", kind:"Perro robot", eta:"8 min" }
    ],
    history:[
      { t:"11:00", text:"Ingreso por llamada telefónica" },
      { t:"11:02", text:"Prioridad media asignada" },
      { t:"11:05", text:"ZM-21 despachada" }
    ],
    markerIndex:"2",
    lng:-103.3439,
    lat:20.6650
  },
  {
    id:"inc-0188",
    folio:"4300090188",
    type:"Accidente de motocicleta",
    priority:"high",
    status:"open",
    sector:"Sector 5 Sur",
    address:"Corredor Sur · torre 3",
    elapsed:"02:18",
    cam:"CAM-0603",
    stream:"assets/cam-0603.jpg",
    description:"Accidente de motocicleta con posible lesionado. Pendiente de despacho; cámara CAM-0603 con señal degradada.",
    units:[],
    history:[
      { t:"11:20", text:"Detección automática por cámara" },
      { t:"11:21", text:"Clasificado prioridad alta — sin recursos aún" }
    ],
    markerIndex:"3",
    lng:-103.3556,
    lat:20.6562
  },
  {
    id:"inc-0301",
    folio:"4300090301",
    type:"Obstrucción de vía",
    priority:"low",
    status:"dispatched",
    sector:"Sector 2 Norte",
    address:"Periférico Norte · nodo 12",
    elapsed:"22:05",
    cam:"CAM-0522",
    stream:"assets/cam-0522.jpg",
    description:"Derrumbe parcial con vía bloqueada. Maquinaria y apoyo vial en sitio. Flujo detenido en ambos sentidos.",
    units:[
      { code:"B-04", kind:"Apoyo vial", eta:"12 min" }
    ],
    history:[
      { t:"10:50", text:"Reporte ciudadano" },
      { t:"10:55", text:"Prioridad baja confirmada" },
      { t:"11:00", text:"B-04 asignada" }
    ],
    markerIndex:"4",
    lng:-103.3411,
    lat:20.6601
  },
  {
    id:"inc-0333",
    folio:"4300090333",
    type:"Vandalismo en vía pública",
    priority:"medium",
    status:"attending",
    sector:"Sector 5 Sur",
    address:"Salida Sur · ARC-08",
    elapsed:"09:50",
    cam:"ARC-08",
    stream:"assets/cam-lpr-08.jpg",
    description:"Grupo realizando grafiti en muro peatonal. Unidad en sitio realizando valoración y disuasión.",
    units:[
      { code:"ZM-08", kind:"Perro robot", eta:"En sitio" }
    ],
    history:[
      { t:"11:05", text:"Ingreso por botón de pánico peatonal" },
      { t:"11:08", text:"ZM-08 despachada por vandalismo" },
      { t:"11:15", text:"Unidad en sitio" }
    ],
    markerIndex:"5",
    lng:-103.3546,
    lat:20.6540
  }
];
