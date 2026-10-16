// Modelo de la figura de Computer Vision: duración de cada ciclo (s) en la operación simulada.
// Un ciclo lento (57,9 s) es el cuello de botella que aparece marcado en el display.
export const CYCLES = [41.2, 39.8, 42.5, 40.6, 41.9, 57.9, 41.1, 40.2, 42.8, 39.6, 41.5, 40.9];
// segundos de animación por segundo medido: un ciclo de ~41 s se ve en ~2,4 s
export const SCALE = 0.058;
// recorrido guiado (s): 0–5 sin medir · 5–9 detectando · 9–20 midiendo
export const PHASES = { detect: 5, measure: 9, loop: 20 };
