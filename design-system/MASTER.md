# Saimon Nexus — Sistema de diseño

**Instantánea:** 15 de septiembre de 2026  
**Producto:** tablero de comando operativo (smart city / C5).  
**Audiencia:** operadores de centro de mando — no venta a ciudadano.  
**criticidad:** alta

Este archivo es el contrato visual de Nexus. El navegador lee `css/tokens.css`.  
Si un valor no está aquí, no se inventa en la maqueta: se nombra como token y se documenta.

CAD Lite es **préstamo**, no el sistema de este producto. No copiar su Master entero  
(escala 13 px, tema claro, layouts de CAD).

---

## 0. Acuerdos de esta etapa

1. Paleta, Poppins, espaciado, radios, sombras, foco, motion, `.btn` y `.status` vienen de CAD Lite.
2. Nexus es otro producto: monitor 1920×1080, tres columnas, mapa táctico, IA autónoma, solo oscuro.
3. Sala de control (criticidad alta): ver §5.
4. Sigue siendo **maqueta**. Datos, calles y cifras son ilustrativos (`js/data.js`).
5. Un valor nuevo se nombra `--nx-*` en `tokens.css` **antes** de usarse en otra hoja.

---

## 1. Fuentes en código

| Qué | Dónde |
|---|---|
| Tokens (runtime) | `css/tokens.css` |
| Reset, foco, scroll | `css/base.css` |
| Dónde va cada cosa | `css/layout.css` |
| Cómo se ve | `css/components.css` |
| Datos de demo | `js/data.js` |
| Columna izquierda | `js/ui.js` |
| Mapa provisional | `js/map.js` |
| Panel de IA | `js/ai.js` |
| Marcado | `index.html` |

Orden de carga: `tokens` → `base` → `layout` → `components`. Scripts: `data` → `ui` → `map` → `ai`.

Calibración: **1920 × 1080** a pantalla completa. Bajo ~1300 px hay scroll horizontal a propósito.

---

## 2. Heredado de CAD Lite — no redefinir a ojo

Nombres iguales a CAD Lite. Hex y escalas copiados del tema oscuro.

### Superficies

| Token | Valor |
|---|---|
| `--bg-main` | `#15243E` |
| `--bg-panel` | `#1B2E50` |
| `--bg-panel-light` | `#2c3446` |
| `--bg-input` | `#15243E` |
| `--bg-header` | `#202634` |
| `--bg-header-top` | `#151a25` |
| `--bg-panel-gradient` | `linear-gradient(145deg, #233a63 0%, #15243E 100%)` |
| `--btn-gradient` | `linear-gradient(180deg, #4f8cf8 0%, #2d68f8 100%)` |
| `--overlay-scrim` | `rgba(0,0,0,.6)` |

`--bg-gradient` y `--btn-danger-gradient` de CAD Lite **no están** en Nexus todavía. Si hacen falta, se copian con el mismo nombre.

### Texto

| Token | Valor | Uso |
|---|---|---|
| `--text-primary` | `#ffffff` | Títulos, controles |
| `--text-secondary` | `#9ba0ab` | Labels |
| `--text-muted` | `#6b7280` | Ayuda |
| `--text-placeholder` | `#7F92BE` | Placeholder (itálica, peso 300) |

### Acentos

| Token | Hex | RGB |
|---|---|---|
| `--accent-blue` | `#2d68f8` | 45, 104, 248 |
| `--accent-blue-hover` | `#1e52d3` | |
| `--accent-green` | `#10b981` | 16, 185, 129 |
| `--accent-red` | `#ef4444` | 239, 68, 68 |
| `--accent-orange` | `#f59e0b` | 245, 158, 11 |
| `--accent-purple` | `#a855f7` | 168, 85, 247 |
| `--accent-cyan` | `#22d3ee` | 34, 211, 238 |
| `--accent-dark-blue` | `#1c3d7a` | |

`--accent-cyan` está en Nexus (capas de mapa / agentes). Si CAD Lite no lo tenía, aquí es token de producto.

### Bordes, espacio, radio, sombra, motion, z-index

Igual que CAD Lite: `--border-color`, `--border-color-light`, `--border-input`;  
`--spacing-xs` … `--spacing-xl`; radios sm/md/lg, pill, circle;  
`--shadow-sm/md/lg`; `--focus-ring` / `--focus-ring-offset`;  
`--duration-fast/normal/slow`; `--z-base` … `--z-popover`.

### Componentes de contrato

| Clase | Rol |
|---|---|
| `.btn` `.btn--primary` `.btn--ghost` `.btn--block` | Acciones. Una primaria por bloque. |
| `.status` `--danger` `--warning` `--success` `--info` | Estado + texto. Color nunca solo. |

Tema claro de CAD Lite: **deuda consciente**. Sala de control opera en oscuro. No implementar hasta que se pida.

---

## 3. Propio de Nexus

Prefijo `--nx-*`. Cualquier literal nuevo de producto entra por aquí.

### Superficies

| Token | Valor | Uso |
|---|---|---|
| `--nx-surface-map` | `#0C1729` | Fondo del mapa. Lo aplica `js/map.js` al estilo de MapLibre |
| `--nx-map-water` | `#0A1930` | Agua del mapa. También vía `js/map.js` |
| `--nx-map-building` | `#20355C` | Edificios extruidos. También vía `js/map.js` |
| `--nx-surface-raised-solid` | `#0f1c33` | Cabecera opaca de panel flotante |
| `--nx-surface-raised` | `color-mix(… 94%, transparent)` | Cuerpo de panel flotante sobre el mapa |
| `--nx-surface-sunken` | `#101C33` | Filas, pozos |
| `--nx-border-soft` | `rgba(255,255,255,.07)` | Separadores de shell |

### Tipografía — misma familia, otra escala

Familia: `--font-family`: `"Poppins", system-ui, sans-serif` (CAD Lite).  
Base de componentes: **14 px** (`--nx-text-md`), no 13 px. Lectura a distancia en sala.

| Token | rem | px | Uso |
|---|---|---|---|
| `--nx-text-2xs` | .6875 | 11 | Micro-etiqueta, conteo |
| `--nx-text-xs` | .75 | 12 | Meta, hint |
| `--nx-text-sm` | .8125 | 13 | Label |
| `--nx-text-md` | .875 | 14 | **Base** |
| `--nx-text-lg` | 1 | 16 | Título de panel, reloj |
| `--nx-text-xl` | 1.25 | 20 | Unidad junto a cifra |
| `--nx-text-2xl` | 1.75 | 28 | KPI |
| `--nx-text-3xl` | 2.75 | 44 | Cifra protagonista |

No usar `--font-size-*` de CAD Lite. En Nexus la escala es `--nx-text-*`.

Cifras: `font-variant-numeric: tabular-nums` en `body`.

### Malla del shell

| Token | Valor | Uso |
|---|---|---|
| `--nx-header-h` | 4rem | Encabezado desplegado |
| `--nx-header-h-min` | 2rem | Encabezado plegado (`.shell.is-head-min`) |
| `--nx-col-left` | 23rem (368px) | Panel de métricas (flotante) |
| `--nx-col-right` | 26rem (416px) | Panel de IA (flotante) |
| `--nx-panel-gap` | `.75rem` | Aire alrededor de los paneles; también padding de MapLibre |
| Centro | `minmax(0,1fr)` a fila completa | El mapa llena debajo del encabezado |

Áreas: `map` a viewport completo. `.left` y `.ai` flotan bajo el slot de marca
(`.map-brand` arriba-izquierda). Las capas (`.layers`) se centran en el corredor
del mapa. Nada migra de columna sin discusión.

**Modelo B:** el selector de dominio cambia **solo** la columna izquierda. Mapa y panel de IA siguen en contexto de seguridad.

**Neón solo en el mapa.** Laterales planos. El peso lo llevan la cifra grande y el radar.

### Decisiones de producto en UI

- **IA autónoma.** El operador frena, no autoriza. Primaria: **Tomar control**. No volver a “Ejecutar recomendación”.
- **Un incidente en foco** en la columna derecha (limitación actual de la maqueta).
- Mapa = traza SVG desechable (`js/map.js`). No pulir como si fuera el mapa final.

### Componentes propios (ya en código)

Encabezado: `.map-brand` (logo + ciudad + clima + avatar), `.avatar`.  
Shell: mapa a pantalla completa; sin fila de encabezado fija.  
Izquierda: `.domains` / `.domain`, `.headline-*`, `.delta` / `.delta--*`, `.spark`, `.row`, `.sector` / `.donut`, `.kpi`, `.picker`.  
Mapa: `.layers` / `.layer`, `.marker--*` (+ `.marker-anchor`), `.radar`, `.popcard`,
`.devcard`, `.map-dock`, `.agent-orb`, `.ctx`, `.mapctl`, `.mapview`.  
IA: `.ai-card` (+ `--thread` / `--plan` / `--fleet` / `--inventory` / `--routes-*`), `.ai-live`, `.case`, `.chain` (+ `.chain__step`), `.case__scope` / `.case__actions`, `.disp` / `.unit`, `.log` (+ `.log__dot--*`), `.agents` / `.agent`, `.autonomy__btn`, `.fleet` / `.device` / `.chip` / `.dsec`, `.route` / `.route-detail` / `.route-itin`.

**Jerarquía de la columna derecha.** Los dos frenos viven en el head de cada
`.ai-card` con `.autonomy__btn`: **Pausar autonomía** (ciudad) y **Tomar control**
(incidente). Declara el alcance por escrito (`.case__scope`); la posición en el
panel no basta para distinguir «esta ciudad» de «este incidente».

**El caso vive fuera de `.ai__scroll`.** Identidad, cadena, recursos y pie se ven sin
desplazar. Solo bitácora y agentes hacen scroll.

Deltas: `up` / `down` no bastan. Incidentes que suben son malos → `.delta--up-bad`. Tiempos que bajan son buenos → `.delta--down-good`.

---

## 4. Aún no existe

No construir en CSS “como si ya hubiera producto”:

1. Vista **Urban Governance** (no hay tab en el encabezado).
2. Cola y priorización de **varios incidentes** simultáneos → cubierto en lote 14
   (modo Incidentes); Vigía sigue siendo el foco de un solo caso.
3. Flujo real de **Tomar control** / **Intervenir** (confirmación, auditoría, registro).
4. Estados de interfaz: vacío, carga, error, sin permiso.
5. Búsqueda ⌘K, notificaciones, zoom/3D, “Ver análisis completo”. Satélite
   fotorealista (otro proveedor).
6. Mapa geográfico (MapLibre / Mapbox / deck.gl) — reemplaza `js/map.js` entero.
7. Tipografía autoalojada (hoy Poppins = Google Fonts).
8. Tema claro.
9. Calibración videowall (metros de distancia; esta escala se queda corta).

---

## 5. Sala de control (criticidad alta)

Activa en este proyecto. Se suma a UX base (feedback, color + texto, jerarquía).

1. Pocas acciones para lo grave. Tomar control / Intervenir no se entierran.
2. Incidente activo y mapa visibles sin scroll obligatorio para decidir.
3. No tapar el mapa con un modal a pantalla completa mientras hay evento en curso. Panel o overlay no bloqueante.
4. Prioridad = color **y** texto/icono (`.status`, no solo el radar rojo).
5. Feedback al clic inmediato. Motion de adorno no retrasa la acción.
6. Confirmación solo si el costo de error es alto (tomar control, cortar autonomía).

Modales de CAD Lite (scrim `--overlay-scrim`) se reservan para eso; no para filtros ni capas.

---

## 6. Inventario de la maqueta (se toca / teatro / no se toca)

Leído de `index.html` + JS. Sin rediseñar.

| Zona | Qué hay | Real en la maqueta | Teatro (pinta, no hace) | No se toca en el primer pulido |
|---|---|---|---|---|
| Encabezado | Marca, búsqueda, ciudad, clima, reloj, sistema OK, campana, avatar | Reloj avanza desde 11:24 de demo | ⌘K, campana, avatar | Reloj escenificado (no usar hora del equipo) |
| Izquierda | 4 dominios, cifra, spark, 5 categorías, sectores, KPIs | Clic de dominio; caben sin scroll a 1080 | Periodo, “Ver todos”, filas de categoría | Modelo B: no cambiar mapa/IA al cambiar dominio |
| Centro | MapLibre, capas, popcard, ctx, radar, controles | Capas; vista día/noche; zoom; 3D; fullscreen; centrar; norte | Capas base (satélite) | No fingir satélite fotorealista |
| Derecha | Autonomía, 1 caso, cadena, unidades, bitácora, 6 agentes | Nada cableado | Intervenir, Tomar control, análisis, bitácora, detalles | Un solo incidente; no inventar cola en este lote |
| Global | Marca de agua de placeholder | Visible | — | No quitar hasta datos reales |

**Se toca (fase pulido):** jerarquía, densidad, lectura, estados visuales de lo que ya existe, consistencia de tokens (hay hex sueltos: `#dbe7ff`, `#8eb2ff`, fills del mapa), foco, labels de marcadores.

---

## 7. Criterio de pulido — qué sí / qué no

**Sí (siguiente fase, cuando se apruebe el lote 1):**

- Jerarquía y peso visual por columna.
- Densidad y alineación en 1920.
- Estados hover/active/pressed de controles que ya existen.
- Sustituir literales de color por tokens ya definidos o `--nx-*` nuevos documentados aquí.
- Accesibilidad: foco visible, `aria-label` en iconos funcionales, `cursor: pointer`, contraste.
- Texto + icono en prioridad y en pips de agentes (no solo color).

**No todavía:**

- Reemplazar el mapa SVG.
- Flujos nuevos (Urban Governance, cola, Tomar control de verdad).
- APIs, auth, i18n de producto.
- Tema claro, videowall, font self-hosted.
- Pulir manzanas/semilla del generador.

Si un ajuste exige dato o flujo nuevo, se anota en §4. No se “resuelve” con CSS.

---

## 8. Cómo extender

1. ¿El valor existe en §2 o §3? Usarlo.
2. Si no: token `--nx-*` en `css/tokens.css`, fila aquí, luego CSS.
3. Componente nuevo: tokens existentes, clase BEM sin prefijo de módulo (como ahora), documentar en §3.
4. Prohibido: paleta genérica, escala 13 px de CAD Lite, modal que cubra el mapa en evento activo.

---

## 9. Lote 1 — aplicado el 15 de septiembre de 2026

Alcance aprobado: higiene. No se movió composición ni jerarquía.

**Tokens.** Ya no hay hex fuera de `tokens.css`. Se nombraron los tintes de acento
(`--nx-tint-*`), el cristal sobre el mapa (`--nx-glass*`), la pintura del lienzo
(`--nx-map-*`) y las capas de interacción (`--nx-hover-*`, `--nx-fill-faint`,
`--nx-text-faint`, `--nx-text-watermark`). El SVG del mapa pinta desde CSS
(`.map__base-from`, `.map__grid`, `.map__blocks`, `.map__park`, `.map__avenues`,
`.map__route`), así que `js/map.js` solo emite geometría.

Dos consolidaciones con cambio visual mínimo, deliberadas:

- `.mode.is-active` pasó de `#dbe7ff` a `--nx-tint-blue-bright` (`#cfe0ff`).
- `.log__item:hover` pasó de 3.5% a 4% de blanco (`--nx-hover-soft`).

`--nx-surface-block` se alineó a `#1B3159`, que es lo que el mapa ya dibujaba;
antes el token decía `#17294A` y nadie lo usaba.

**Foco y etiquetas.** El buscador ya no mata el anillo: el foco se dibuja en el
contenedor con `:focus-within`. Sobre el mapa el anillo plano se perdía, así que
marcadores, capas y controles usan `--nx-focus-ring-map`, que corta contra el
lienzo. Los 41 iconos decorativos llevan `aria-hidden`; el único SVG que conserva
nombre accesible es el lienzo del mapa. Los marcadores dejaron de anunciarse
como `incidente` y ahora dicen «Incidente 1», «Cámara 3» (el número es orden
dentro del tipo, no un identificador real).

**Prioridad sin depender del color.** Los estados de agente tienen forma propia:
círculo lleno = activo, anillo = procesando, cuadrado = en espera. La leyenda
reusa las mismas formas, y cada tarjeta lleva su estado en texto para lector de
pantalla (`.sr-only`). Los estilos en línea de los iconos de agente pasaron a
`.agent__icon--*`.

**Controles sin comportamiento.** `.is-mock` los atenúa, y el marcado agrega
`disabled` o `inert` para que tampoco reciban clic ni foco: buscador con ⌘K,
campana y el botón de capas base del mapa (satélite). Zoom, 3D, pantalla
completa, centrar y norte ya están cableados.

### Pospuesto del lote 1

Peso de la columna derecha (1), unificar Intervenir / Tomar control (2), densidad
de capas por defecto (4) y recorte del encabezado (5). Cambian composición y
piden decisión de producto.

### Detectado y no resuelto

- **9 px en uso.** `--nx-text-3xs` existe para nombrar lo que ya había (status,
  tarea de agente, marca de agua, badge). Está bajo el piso de lectura de sala:
  candidato a subir en el próximo lote.
- **Deltas por color.** `.delta--up-bad` / `--down-good` distinguen bueno de malo
  solo por color; la flecha indica dirección, no juicio.
- **Estilos en línea** que quedan: color de los puntos de la bitácora. Los de
  posición sobre el mapa desaparecieron en el lote 3.
- **Marcadores y popcard no responden al clic.** Son `<button>` que no hacen nada;
  no se atenuaron porque son el contenido del mapa, no cromo.

---

## 10. Lote 2 — columna derecha, 15 de septiembre de 2026

Medición de partida a 1920 × 1080: el panel pedía **1111 px** en **862 px** útiles,
y el caso activo empezaba a 233 px del borde. Después del lote, todo el panel cabe
**sin scroll**; con la cadena desplegada el scroll es de 27 px y afecta solo al contexto.

1. **Dos frenos con alcance escrito.** `Intervenir` pasó a **Pausar autonomía** (ghost,
   ciudad completa); **Tomar control** es la única primaria y declara que dirige solo
   este incidente. `Ver análisis completo` quedó como teatro (`.is-mock` + `disabled`).
2. **Cadena expandida.** Los 4 pasos cumplidos, el paso en vivo y el siguiente
   se muestran siempre en línea de tiempo (sin acordeón).
3. **El caso fuera del scroll.** `.case` es hermano de `.ai__scroll`, no hijo.
4. **Bitácora a 2 entradas.** Se quitó la que repetía el despacho de ZM-14 / A-07, que
   ya está en el caso. `Bitácora completa` es teatro.
5. **Agentes en tira de 6.** `<ul>` semántico, nombre visible, estado por forma y tarea
   en `title` + `.sr-only`. Se eliminó `.agent__task` visible. `Ver detalles` es teatro.

**No se tocó:** mapa, columna izquierda, encabezado, número de incidentes (sigue siendo
uno), y ningún freno quedó cableado.

**Detectado:** `--text-muted` sobre `--nx-surface-sunken` ronda 3.4:1, por debajo del
4.5:1 del checklist. `.case__scope` se subió a `--text-secondary`; el resto de usos
(`.kpi__label`, `.unit__kind`, `.chain__time`) sigue pendiente de revisar.

---

## 11. Lote 3 — mapa real en 3D, 15 de septiembre de 2026

La traza SVG generada se cambió por **MapLibre GL 4.7.1** con teselas de
**OpenFreeMap**. `js/map.js` se reescribió completo, como estaba previsto desde
el inicio del proyecto. Verificado a 1920 × 1080: pitch 60°, 63 edificios
extruidos en cuadro (altura media 17 m, máxima 90 m), los 26 marcadores dentro
del encuadre y sin un solo solapamiento entre tarjetas y marcadores.

1. **Cartografía con la paleta de Nexus.** El estilo `dark` de OpenFreeMap es gris
   neutro. `js/map.js` le reescribe fondo y agua con `--nx-surface-map` y
   `--nx-map-water`, y extruye edificios con `--nx-map-building`. El mapa no
   introduce color propio: los tres valores son tokens.
2. **Altura con respaldo.** `render_height` no siempre viene en OpenMapTiles; sin
   alternativa el mapa se vería inclinado pero plano. Cae a `height` y luego a 12 m.
   La huella plana `building` se oculta para que no asome bajo la extrusión.
3. **Marcador dentro de un ancla.** MapLibre escribe `position` y `transform` en
   línea sobre el elemento que recibe. Si ese elemento fuera el `.marker`, perdería
   su centrado y su `:hover`. El ancla es `.marker-anchor` — un punto de 0 × 0 — y el
   botón vive dentro con su CSS intacto. Es la única regla nueva del lote.
4. **Tarjetas ancladas a la ciudad.** `.popcard`, `.radar` y las tres `.ctx` ya no se
   posicionan en porcentaje: declaran `data-lng` / `data-lat` en el marcado y viajan
   con el mapa. Con el mapa arrastrable, un porcentaje las dejaría quietas mientras
   la ciudad se mueve debajo. Los controles de esquina siguen siendo HUD fijo.
5. **Código muerto fuera.** Se eliminaron `.street` y las siete reglas de pintura del
   SVG, con sus tokens (`--nx-map-base-*`, `--nx-map-grid`, `--nx-map-avenue`,
   `--nx-map-park*`, `--nx-surface-block`, `--nx-text-faint`).

**Coste que introduce:** la maqueta ya no abre con `file://` ni sin internet.

**Pendiente de producto:** OpenFreeMap no da garantía de servicio ni admite datos
en sitio. Antes de un piloto con cliente hay que elegir proveedor de teselas.

---

## 12. Lote 4 — encabezado, 15 de septiembre de 2026

1. **Fuera el interruptor de modos.** `City Safety` / `Urban Governance` no hacía nada
   y el segundo ya estaba apagado. Se eliminaron `.modes` / `.mode` del marcado y del CSS.
2. **Encabezado plegable.** Botón `.head__toggle` con `aria-expanded` que alterna
   `.shell.is-head-min` (`js/shell.js`). De **64 px a 32 px**: el mapa pasa de 1016 a
   **1048 px** de alto a 1920 × 1080. Plegado sobrevive lo que la sala consulta de un
   vistazo — marca, hora y estado del sistema — y se ocultan buscador, ciudad, clima,
   fecha, campana y avatar. El botón nunca se oculta: sin él no habría vuelta atrás.

**Por qué no se anima.** Animar la fila de la malla obligaría a MapLibre a recalcular
su lienzo en cada fotograma. El cambio es instantáneo, que además es lo que pide la
capa de criticidad alta. MapLibre reajusta su lienzo solo, por su `ResizeObserver`:
verificado, el canvas queda en 1048 px sin llamar a `resize()`.

**Lo que esto no resuelve:** son 32 px de 1080. Si hace falta más aire, el siguiente
candidato es la altura de las tarjetas de la columna izquierda, no el encabezado.

---

## 13. Lote 5 — paneles flotantes, 16 de septiembre de 2026

Las columnas izquierda y derecha dejan de ser celdas de la malla y flotan sobre el
mapa, con margen (`--nx-panel-gap`), radio (`--border-radius-lg`) y sombra
(`--shadow-lg`). El fondo es `--nx-surface-raised`: las cifras no pelean con la
ciudad. Verificado a 1920 × 1080: paneles a 12 px del borde, radio 12 px, mapa a
ancho completo, 23 marcadores visibles en el corredor central.

1. **Malla de dos filas.** `head` / `map`. `.left` y `.ai` son `position:absolute`
   con `z-index: --nx-z-panel`.
2. **Padding de cámara.** `js/map.js` lee los mismos tokens y llama a `setPadding`
   para que el centro geográfico viva entre los paneles, no debajo de ellos.
3. **HUD inset.** Capas, controles y vista satelital usan `.map__inset-left` /
   `.map__inset-right` para no quedar bajo las columnas.

**No se tocó:** contenido de métricas, panel de IA, ni semitransparencia de los
paneles (rompería contraste).

---

## 14. Lote 6 — mapa oscuro ↔ día, 16 de septiembre de 2026

El botón que decía «Vista satelital» (teatro) pasó a **Vista día / Vista noche**.
Alterna OpenFreeMap `dark` ↔ `bright`. Es mapa vectorial diurno, no satélite.

1. **`setStyle` + reaplicar capas.** Cambiar de estilo borra la extrusión y los
   tintes de Nexus. `applyNexusLayers()` corre en `load` y tras cada cambio.
   El listener se registra *antes* de `setStyle` (caché puede disparar
   `style.load` en el mismo tick).
2. **Paleta por modo.** En oscuro se tiñen fondo y agua. En día se deja Bright
   intacto y la extrusión usa `--nx-map-building-day` (`#c4bdb0`).
3. **Foco en día.** `#map[data-map-style="day"]` corta el anillo de foco contra
   blanco.
4. **Contraste HUD en día (17/09).** Capas, controles y marcadores usan fondo
   opaco (`--bg-panel` / `--accent-dark-blue`); el incidente va en rojo sólido
   para que el icono blanco no se lave contra Bright.

**Sigue fuera:** satélite / fotorealismo 3D (otro proveedor). El botón de capas
base del HUD permanece `disabled` + `.is-mock`.

**Controles del mapa (17/09):** zoom ±, 3D↔2D, pantalla completa (`#map`),
centrar en Guadalajara y orientar al norte están cableados en `js/map.js`.
La N de la brújula rota con el bearing.

## 16. Lote 8 — panel izquierdo sin scroll, 17 de septiembre de 2026

A 1920 × 1080 el panel pedía **~178 px** de más. Ajuste sin quitar secciones:

1. **5 categorías** en Seguridad (se quitó «No procedentes»). Los otros dominios
   ya traían 5.
2. **Densidad local** en `.left`: gap `md`, spark 2.25 rem, filas/donuts/KPIs
   más compactos. La columna de IA no se tocó.

Meta: overflow 0 con encabezado expandido.

**Ajuste de huecos (17/09):** sectores en **3 columnas** (sin fondo, donut
~4.25 rem). Sin `flex` que estire la sección: altura natural para no abrir
huecos entre categorías, sectores e indicadores.

## 17. Lote 9 — teatro visual Simon + dispositivo, 17 de septiembre de 2026

1. **`.agent-orb`** — avatar (`assets/simon-agent.png`). Hover despliega modos.
   **Vigía** abre `#ai-panel`; **Dispositivos** abre `#devices-panel`; **Rutas**
   abre `#routes-panel`; **Incidentes** abre `#incidents-panel`. Mutuamente
   excluyentes. `shell.is-right-open` reserva padding e insets.
2. **`.devcard`** — ficha de recurso en el muelle (foto `saimon-robot.jpg`).
   Arranca oculta; clic en ZM-14 / A-07 / DR-03 la despliega (y otro clic la
   cierra). Botón × también cierra. Al abrir, el marcador ligado en el mapa
   crece, emite ondas (`.marker-ping`) y muestra un callout con el código.

## 18. Lote 10 — salud de dispositivos, 18 de septiembre de 2026

Panel derecho del modo Dispositivos: inventario con salud operativa.

1. **Card resumen** — conteos En línea / Degradado / Fuera / Dañado + % en línea
   (flota completa, no filtrada).
2. **Card inventario** — búsqueda + chips de estado (incl. Críticos) y tipo;
   lista agrupada por sector (acordeón). Clic enfoca marcador en el mapa.
3. **Datos** — `DEVICES` en `js/data.js`; UI en `js/devices.js`.

## 20. Lote 12 — rutas de despacho animadas, 18 de septiembre de 2026

Al seleccionar ZM-14 / A-07 / DR-03 en el plan, además del foco del marcador:

1. **Dron** — línea recta aérea (verde) hacia el incidente.
2. **Terrestre** — polyline mock con quiebres (púrpura / azul).
3. **Animación** — dash en movimiento + punto que recorre la ruta.
   Teatro visual; sin routing real. Se limpia al deseleccionar o cerrar el panel.

## 21. Lote 13 — rutas de patrullaje, 18 de septiembre de 2026

El modo **Patrullaje** pasa a **Rutas** (`#routes-panel`).

1. **Lista** — altura completa; rutas IA/humano con filtros y búsqueda.
2. **Detalle** — navegación lista → detalle (botón Atrás). Gobernanza,
   incidentes, itinerario A/B + tramos.
3. **Mapa** — circuito animado en naranja de alto contraste
   (`nexusShowPatrolRoute`). Datos: `PATROL_ROUTES`; UI: `routes.js`.

## 22. Lote 14 — cola de incidentes, 21 de septiembre de 2026

El modo **Fuerza robótica** pasa a **Incidentes** (`#incidents-panel`).

1. **Lista** — altura completa; prioridad / folio / tipo / estatus; filtros
   (prioridad, vivos por defecto) + búsqueda. Resumen Abiertos · Despachados ·
   En atención · Prioridad alta.
2. **Detalle** — lista → detalle (Atrás): stream EN VIVO, descripción, unidades
   asignadas e historial.
3. **Mapa** — selección abre popcard + radar (`nexusShowIncidentPopcard`);
   clic en marcador con el panel abierto sincroniza el detalle.
   Datos: `INCIDENTS`; UI: `incidents.js`.

---

## 15. Lote 7 — columna derecha en 2 paneles, 17 de septiembre de 2026

La derecha pasa a la lectura de la referencia de directivos: **hilo arriba, plan abajo**,
sin soltar los frenos C5. El aside `.ai` es transparente: flotan dos `.ai-card`
(fondo `--nx-surface-raised`, borde y sombra) sobre el mapa.

1. **Banner de autonomía compacto.** Retirado del aside; la acción vive en el
   head del hilo (`Pausar autonomía`).
2. **Panel A — Hilo de Simon Core.** Título `VIGIA ejecutándose` + bitácora en
   línea de tiempo (mismo patrón que `.chain`) + mensaje en vivo (`.ai-live`).
3. **Panel B — Plan del incidente.** Caso, cadena expandida, recursos y tira de agentes.
   **Tomar control** vive en el head del panel (mismo patrón que Pausar autonomía).
   Verificado: visible sin salir de 1080 px.

**No se cablearon** Pausar / Tomar control. **No se copió** el diagrama radial
de la referencia: la cadena vertical cubre el plan del incidente.

## 19. Lote 11 — HUD de marca, 18 de septiembre de 2026

Se retira el encabezado de fila completa. El mapa ocupa el viewport.

1. **`.map-brand`** — arriba-izquierda: `LOGO-BLANCO.png` + ciudad + clima + avatar
   (siempre visible; sin expandir al click).
2. **`.layers`** — centradas en el corredor entre paneles (misma franja superior).
3. **Fuera de esta maqueta:** búsqueda ⌘K, sysok, notificaciones, pliegue
   `is-head-min`.
