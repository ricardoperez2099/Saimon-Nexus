# Saimon Nexus — maqueta de tablero de comando

Primer *approach* visual del tablero operativo de Saimon Nexus para centros de
mando tipo C5. Es una **maqueta**, no un sistema: sirve para aprobar dirección
visual y arquitectura de pantalla, no como especificación para construir.

Instantánea: 14 de septiembre de 2026.

---

## Cómo correrlo

Hace falta **servidor HTTP y conexión a internet**. No hay build ni
dependencias que instalar, pero el mapa descarga MapLibre desde un CDN y las
teselas desde OpenFreeMap; con `file://` el mapa se queda en negro.

En Cursor o VS Code, la extensión **Live Server** recarga en cada guardado:
clic derecho sobre `index.html` → *Open with Live Server*. A mano:
`python3 -m http.server 8777` y abrir `http://localhost:8777`.

Está calibrado para **1920 × 1080** a pantalla completa. Por debajo de 1300 px
de ancho aparece scroll horizontal; es deliberado, no es un bug de responsive.

Los scripts son clásicos, no módulos ES.

---

## Estructura

```
saimon-nexus/
├── index.html              Marcado de las tres columnas
├── css/
│   ├── tokens.css          Variables. Se edita aquí antes que en ningún otro lado
│   ├── base.css            Reinicio, foco, scrollbars
│   ├── layout.css          Shell de 3 columnas y encabezado — DÓNDE va cada cosa
│   └── components.css      Botones, status, marcadores, KPIs… — CÓMO se ve
└── js/
    ├── data.js             DOMAINS: todos los datos de demostración
    ├── ui.js               Render de la columna izquierda
    ├── shell.js            Encabezado plegable
    └── map.js              Mapa MapLibre, marcadores y capas
```

El orden de carga importa: `tokens` → `base` → `layout` → `components`, y
`data` → `ui` → `shell` → `map` → `ai`.

---

## Decisiones de diseño que conviene no deshacer sin discutirlo

**La tríada de columnas.** Izquierda = cuánto (contexto cuantitativo). Centro =
dónde (contexto espacial). Derecha = qué se está haciendo (contexto de
decisión). Que nada migre de columna: es lo que hace la pantalla legible sin
manual.

**Modelo B.** El selector de dominio (Seguridad · Movilidad · Agua · Residuos)
cambia **solo la columna izquierda**. El mapa y el panel de IA permanecen en
contexto de seguridad. Es una decisión provisional: si el cliente pide que el
dominio cambie las tres columnas, el trabajo crece bastante.

**IA autónoma.** El panel derecho no aprueba nada. Donde una versión anterior
tenía "Ejecutar recomendación", ahora hay modo autónomo declarado, cadena de
decisión con el despacho ya cumplido, y un botón primario **Tomar control**. La
acción del operador es frenar a la IA, no autorizarla.

**El neón vive solo en el mapa.** Los paneles laterales son planos y
disciplinados a propósito. Es lo que hace que la cifra grande y el radar rojo
pesen.

**Tipografía un escalón por encima de CAD Lite.** Base de 14 px en lugar de
13 px, porque en sala de control se lee de más lejos.

---

## Herencia de CAD Lite

De `MASTER.md` se tomaron paleta, familia (Poppins), espaciado, radios, sombras,
foco, motion y el contrato de `.btn` y `.status`.

Todo token nuevo lleva prefijo `--nx-*`, así que de un vistazo se distingue lo
heredado de lo inventado para Nexus.

Diferencias respecto a CAD Lite, todas deliberadas:

| Punto | CAD Lite | Nexus | Por qué |
|---|---|---|---|
| Base tipográfica | 13 px | 14 px | Distancia de lectura en sala |
| Breakpoint máximo | 1400 px | Diseñado a 1920 | Monitor de operador HD |
| Tema claro | Soportado | No implementado | Sala de control opera en oscuro |

El tema claro es una **deuda consciente**, no un olvido. Si se necesita, hay que
remapear superficies y bordes en `tokens.css`.

---

## Todo el contenido es placeholder

Cifras, nombres de calles, sectores, ETAs, porcentajes, códigos de unidad: nada
está verificado contra el producto. Vive completo en `js/data.js` — al conectar
datos reales, ese es el único archivo que cambia.

La marca de agua al pie del tablero lo dice explícitamente. No quitarla hasta
que los datos sean reales.

---

## El mapa

Desde el 15 de septiembre de 2026 el mapa es real: **MapLibre GL 4.7.1** sobre
teselas de **OpenFreeMap** (OpenMapTiles), centrado en Guadalajara con la cámara
inclinada y los edificios extruidos. La traza SVG generada que ocupaba este
lugar desapareció, igual que estaba previsto: `js/map.js` se reemplazó completo
y ningún otro archivo cambió de responsabilidad.

Lo que hay que saber antes de tocarlo:

- **Es demostración, no integración.** OpenFreeMap no pide llave ni registro y
  no ofrece garantía de servicio. Para un piloto con cliente hace falta decidir
  proveedor de teselas — y, si el cliente exige datos en sitio, un servidor
  propio. Esa conversación sigue pendiente.
- **La atribución no se quita.** Es condición de uso de OpenStreetMap.
- **Las 26 coordenadas son inventadas.** Están repartidas en algo más de un
  kilómetro alrededor del centro y ajustadas al encuadre, no a la realidad.
- **Las tarjetas flotantes van ancladas a la ciudad.** `.popcard`, `.radar` y
  las tres `.ctx` declaran su punto en `index.html` con `data-lng` / `data-lat`
  y viajan con el mapa al arrastrarlo. Los controles de esquina — capas,
  `.mapctl`, `.mapview` — sí son HUD fijo.
- El mapa queda en `window.nexusMap` para moverlo desde la consola en vivo.

---

## Qué falta para que esto sea un sistema

Fuera de alcance en esta entrega, en orden aproximado de urgencia:

1. **Varios incidentes simultáneos.** El panel derecho muestra uno. Una ciudad
   real tiene decenas. Falta cola y priorización — es lo que primero rompe este
   diseño frente a datos reales.
2. Estados de interfaz: vacío, carga, error, sin permiso.
3. Qué ocurre al pulsar *Tomar control* y cómo se registra para auditoría.
4. La vista **Urban Governance** (no hay tab en el encabezado).
5. Mapa de pantallas completo y flujos funcionales.
6. Tipografía autoalojada, si la sala de demostración no tiene internet: hoy
   Poppins se carga desde Google Fonts y sin red cae al sans del sistema.

---

## Pendientes abiertos del proyecto

1. Confirmar si la referencia visual original es inspiración o diseño aprobado.
2. Confirmar qué módulos y datos son reales y cuáles conceptuales.
3. Definir si el destino final es monitor de operador o videowall. Están
   calibrados distinto: un videowall se lee a varios metros y esta escala
   tipográfica se queda corta.
