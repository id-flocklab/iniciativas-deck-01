# Iniciativas de I+D · Flock Labs 2026

Presentación de las iniciativas de I+D, migrada desde Figma Slides a HTML para poder iterarla rápido sin perder el diseño original. Incluye export a PDF y tres videos explicativos (uno por iniciativa).

## Uso

Requiere Node 18+ y Google Chrome instalado (se usa para renderizar el PDF y los videos). Los videos necesitan además `ffmpeg`.

```bash
npm install
npm run dev        # http://localhost:5173 — se recarga solo al editar
npm run pdf        # out/IyD-Flock-Labs-2026.pdf
npm run video:cv   # out/video/cv.mp4 (también video:vr y video:ra)
```

## Cómo editar

- **Contenido:** todo está en [`slides.js`](slides.js). Cada slide es un objeto con `type`, `theme` y sus textos. El texto entre `*asteriscos*` sale en Newsreader itálica (el acento del diseño).
- **Tipos de slide:** `cover`, `section`, `list`, `cards`, `steps`, `clients`, `quote`, `gantt`, `closing` — definidos en [`render.js`](render.js).
- **Estilos:** [`styles.css`](styles.css), con las medidas tomadas del Figma original. Temas por iniciativa: `deck` (violeta), `i1` (magenta), `i2` (naranja), `i3` (verde).
- **Videos:** `video/cv.html`, `video/vr.html`, `video/ra.html` (base compartida en `video/common.*`). Se pueden ver en el navegador en `/video/<nombre>.html`.

## Fidelidad con el diseño original

`reference/` tiene las capturas de las 28 slides originales de Figma. `npm run build && npm run compare` renderiza el deck y genera comparaciones en `out/cmp/`.
