# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es Faro

Sitio web **estático** de salud mental en español (Chile): 35 herramientas
interactivas + un Protocolo de crisis para personas con ansiedad/pánico. Sin
cuenta, sin backend, sin descargas — se usa directo desde el navegador.

## Comandos

```
npm install          # dependencias de desarrollo (una vez)
npm run build:css    # compila assets/css/input.css → assets/css/faro-base.css (minificado)
npm run watch:css    # recompila al guardar, para desarrollar
```

Preview local: `py -m http.server 5500` (configurado como `faro-site` en
`.claude/launch.json`; usar `preview_start({name:"faro-site"})` si está disponible).

**No hay tests, linter ni CI.** La verificación es visual/manual en el
navegador, en ambos temas (claro/oscuro) y en viewport móvil.

## Arquitectura

**Stack**: HTML estático + Tailwind CSS 4 (CLI) + DaisyUI 5 + JS vanilla +
localStorage. Cero frameworks, cero backend, **cero CDNs en el cliente**
(Tailwind, DaisyUI y las fuentes Petrona/Karla están auto-alojadas). Esto es
una decisión de producto, no solo técnica: la promesa es carga instantánea sin
dependencias externas que puedan fallar cuando alguien la necesita en crisis.
No introducir CDNs ni dependencias de runtime.

**Rutas de página**:
- `index.html` — hero puro: CTA "Necesito ayuda ahora" → `herramientas/protocolo-de-crisis.html#ahora`.
- `herramientas.html` — catálogo completo de las 35 herramientas + Protocolo.
- `sobre-faro.html` — página informativa.
- `herramientas/*.html` — 36 páginas (35 herramientas + Protocolo). Cada una
  tiene su propio JS en `assets/js/` (un archivo por herramienta; no se
  comparten entre sí).

**Triple hoja de CSS, en este orden exacto en cada `<head>`**:
1. `assets/css/fonts.css` — `@font-face` de Petrona/Karla desde `assets/fonts/`.
2. `assets/css/faro-base.css` — **compilado, no editar a mano**. Se regenera
   con `npm run build:css` a partir de `assets/css/input.css` (que declara
   `@import "tailwindcss"` + `@plugin "daisyui"` + los `@source` que apuntan a
   los HTML y JS a escanear en busca de clases usadas).
3. `assets/css/styles.css` — fuente de verdad de los tokens de color
   (`--color-*`, `--faro-*`), componentes propios `.faro-*` y overrides sobre
   DaisyUI. Este orden (DaisyUI primero, Faro después) es lo que hace que la
   paleta y el modo oscuro salgan idénticos a la referencia — no invertirlo.

**Sistema de tema** (`assets/js/main.js` + snippet inline en cada `<head>`):
- `data-theme="faro-light"|"faro-dark"` en `<html>`.
- Persistencia en `localStorage["faro-theme"]` (sin el prefijo `faro:` — ese
  prefijo es solo de `Faro.Store`, ver abajo).
- Si no hay preferencia guardada, respeta `prefers-color-scheme`.
- El snippet anti-parpadeo es idéntico en las 39 páginas:
  ```html
  <script>(function(){try{var t=localStorage.getItem("faro-theme");if(!t&&window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches)t="faro-dark";if(t)document.documentElement.setAttribute("data-theme",t);}catch(e){}})();</script>
  ```
- El toggle vive en `#theme-toggle` (nav de cada página); el ícono cambia
  luna↔sol vía JS según el tema activo.

**Sistema de pantallas** (patrón que usa casi toda herramienta multi-paso):
- Secciones `<section class="faro-screen">`, solo una con `.active` a la vez.
- `Faro.Screens.show(id)` mueve el `.active`, hace scroll suave (respetando
  `prefers-reduced-motion`) y mueve el foco al primer heading para lectores
  de pantalla.
- Botones "Continuar" / "‹ Volver al paso anterior" usan
  `data-siguiente="s-N"`; el handler de cada herramienta llama a
  `Faro.Screens.show()` con ese id.
- Las pantallas persisten en el DOM (`display:none`, no se destruyen), así que
  los valores ya escritos en un formulario **no se pierden** al volver atrás.

**APIs compartidas en `window.Faro`** (todas en `assets/js/main.js`):
- `Faro.Store.get/set/push/remove` — localStorage con prefijo `"faro:"` y
  JSON seguro (try/catch para modo privado). Todos los historiales de las
  herramientas pasan por aquí.
- `Faro.Util.todayKey()`, `formatDate()`, `formatDateTime()`, `escapeHtml()`,
  `trackToolUse(id, nombre)` (alimenta el Plan de emergencia), `vibrate()`,
  `prefersReducedMotion()`.
- `Faro.Screens.show(id)`.
- `Faro.applyTheme()`, `Faro.currentTheme()`.
- Relleno visual de sliders: `main.js` pinta automáticamente el gradiente de
  relleno en todo `.faro-slider` (con `MutationObserver` para los creados
  dinámicamente). Para excluir un slider de este relleno automático — porque
  ya tiene su propio gradiente de escala — usar el atributo `data-no-fill`.

**Componentes propios `.faro-*`** (en `styles.css`): `.faro-screen`,
`.faro-option-card`, `.faro-chip`, `.faro-btn-big` (+ variantes `-primary`/`-ghost`),
`.faro-input`, `.faro-textarea`, `.faro-slider` (+ `.faro-vslider-wrap` para el
patrón de slider vertical por rotación -90°), `.tool-stage` +
`.tool-bokeh-bg`/`.tool-bokeh-card` (marco visual de las herramientas),
`.faro-content-card` + `.faro-card-title` (tarjetas del catálogo), `.faro-surface`
(fondo con gradiente dorado, solo en modo claro).

## Fuentes de verdad (no inventar, leer directamente)

- **`catalogo_herramientas.md`** — Ficha terapéutica de cada una de las 35
  herramientas + Protocolo: qué es, por qué funciona (con respaldo clínico), y
  la UX pantalla-por-pantalla exacta (textos, ramas condicionales, variantes,
  placeholders). **Los textos terapéuticos no se modifican sin instrucción
  explícita del usuario** — son resultado de analizar ~15 fuentes profesionales
  (TCC de Burns, ACT de Hayes, Nardone, Beyebach, terapia breve centrada en
  soluciones, etc.).
- **`Paleta de colores Faro.html`** — Autoridad de la paleta "atardecer".
  Claro = Early Sunset, oscuro = Twilight. Ante cualquier discrepancia con
  otras referencias de diseño, gana este archivo.
- **`md-analisis/*.md`** — Los análisis clínicos que sustentan el catálogo;
  consultar si hace falta entender la base terapéutica de una técnica
  concreta.

## Convenciones y decisiones no obvias

- **Accesibilidad AA ya verificada — no romperla**:
  - `--color-primary-content` es `#3A2518` en modo claro (deliberadamente no
    el literal más claro que sugeriría un mock, porque ese falla contraste WCAG).
  - Nunca usar `--faro-text-muted` en elementos interactivos ni en etiquetas
    de escala de slider (contraste insuficiente); para eso existe
    `--faro-text-secondary`.
  - `.faro-btn-big`, `.faro-option-card`, `.faro-chip` tienen `:focus-visible`
    explícito (outline 3px, color primario).
  - `prefers-reduced-motion` está cubierto tanto en CSS (`@media`) como en JS
    (`Faro.Util.prefersReducedMotion()`).
  - Formularios multi-pantalla conectan la pregunta visual con su campo via
    `<h2 id="q-xxx">` + `aria-labelledby="q-xxx"` en el input/textarea.
  - Los sliders llevan `aria-label` describiendo qué miden y su rango.
  - Los timers largos (Silla rumiatoria, Media hora rumiatoria) calculan el
    tiempo restante desde un timestamp `Date.now()`, no decrementando en cada
    tick de `setInterval` — así sobreviven al throttling que aplican los
    navegadores móviles a pestañas en segundo plano o con la pantalla bloqueada.
- **Español chileno neutro** en todo el copy — nada de "vosotros" ni modismos
  de otras variantes regionales.
- **El microcopy no es relleno genérico**: el catálogo especifica frases
  terapéuticas literales; el resto del copy de interfaz debe ser cálido y
  directo, calibrado para alguien en un momento de crisis.
- **Cambios que tocan muchas páginas a la vez** (nav, snippet de tema, una
  clase utilitaria) se hacen con scripts Node de reemplazo exacto por
  split/join — nunca regex ni edición manual archivo por archivo. Escribir el
  script en un directorio de scratchpad, correrlo, y siempre revisar
  residuales con grep después.
- **El dueño del producto es una psicóloga aprendiendo a programar.** Explicar
  sin asumir jerga de desarrollo, y cuando se proponga un cambio de diseño o
  contenido, anteponer el razonamiento clínico o de UX al detalle técnico.

## Agente disponible

`.claude/agents/ui-ux-designer.md` — agente propio de crítica UX/UI (metodología
NN/g + WCAG 2.2). Útil para auditar una pantalla o un flujo antes de darlo por
terminado; invocar con `subagent_type: "ui-ux-designer"`.
