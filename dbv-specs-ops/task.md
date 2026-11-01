# Backlog - GuacamoleGH Games

## Contexto del Proyecto (Context Snapshot)
* **Objetivo**: Catálogo web moderno, minimalista y tecnológico de juegos arcade clásicos para el homelab GuacamoleGH, con los 5 títulos previstos mostrados como "Próximamente" en esta fase inicial.
* **Estado actual**: Fases `/spec`, `/plan`, `/build`, `/test` y `/code-simplify` completadas. Catálogo funcional, 13/13 tests pasando, build de producción verificado (< 20KB total), y 100% de trazabilidad de requisitos verificada por `dbv-lint.py`.
* **Última decisión técnica**: Se integró el logotipo oficial 'G' en gradiente verde/turquesa y se modelaron las tarjetas de juego como componentes informativos semánticos y accesibles (`role="region"`, `tabindex="0"`) sin enlaces ficticios rotos para cumplir rigurosamente con REQ-05.
* **Próximo paso**: Fase 2 del roadmap global (Implementación modular del primer juego jugable: **Snake** en `src/games/snake/`).

## Checklist de Tareas

### Fase 1: Especificación y Planificación (Completada)
- [x] **Inspección del entorno y framework** — Verificado repositorio vacío e integrado DBV Specs Ops v3.2.0 en `dbv-specs-ops/`.
- [x] **Configuración de gobernanza** — Actualizado `project.config.md` y archivos de activación en raíz (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`).
- [x] **Especificaciones funcionales y no funcionales** — Elaborado `docs/SPECIFICATIONS.md` con trazabilidad de requisitos (`REQ-01` a `REQ-06`, `RNF-01` a `RNF-04`).
- [x] **Sistema de diseño y tokens** — Elaborado `docs/DESIGN.md` con paleta carbón, acentos verde/turquesa y especificación de componentes.
- [x] **Arquitectura técnica y aislamiento** — Elaborado `docs/ARCHITECTURE.md` con stack Vite + TypeScript y aislamiento modular para futuros juegos.
- [x] **Revisión arquitectónica adversaria y plan de trabajo** — Elaborado `implementation_plan.md` con Frontmatter YAML y desglose de tareas.
- [x] **Registro de memoria y contexto** — Actualizado `memory.md` con contexto activo, ADRs iniciales y Rejection Memory.

### Fase 2: Implementación del Juego Snake (Completada)
- [x] **T-26:** Definir tipos en `src/games/snake/types.ts` (`@spec REQ-07, REQ-08`).
- [x] **T-27:** Implementar motor de juego puro en `src/games/snake/engine/SnakeEngine.ts` (`@spec REQ-08, REQ-09, REQ-11`).
- [x] **T-28:** Implementar vista Canvas y controles táctiles en `src/games/snake/ui/SnakeView.ts` (`@spec REQ-10, REQ-11, REQ-12`).
- [x] **T-29:** Crear punto de entrada de módulo en `src/games/snake/index.ts` (`@spec REQ-07`).
- [x] **T-30:** Actualizar `src/common/data/games.data.ts` con Snake disponible (`@spec REQ-13`).
- [x] **T-31:** Actualizar `src/common/components/GameCard.ts` con botón interactivo de juego (`@spec REQ-05, REQ-13`).
- [x] **T-32:** Actualizar `src/main.ts` con navegación entre catálogo y juego (`@spec REQ-13`).
- [x] **T-33:** Suite de pruebas unitarias en `tests/unit/snake.engine.test.ts` (`@spec REQ-07, REQ-08, REQ-09, REQ-11, REQ-12`).
- [x] **T-34:** Actualizar tests de renderizado en `tests/unit/render.test.ts` (`@spec REQ-13`).
- [x] **T-35:** Verificación completa con `npm test`, `npm run build` y `dbv-lint.py` (22/22 tests, 17/17 specs, 0 avisos).
- [x] **T-36:** Commit y push de la Fase 2 a GitHub.

### Fase 3: Implementación del Juego Pong (Completada)
- [x] **T-37:** Definir tipos en `src/games/pong/types.ts` (`@spec REQ-14, REQ-15`).
- [x] **T-38:** Implementar motor de física pura en `src/games/pong/engine/PongEngine.ts` (`@spec REQ-15, REQ-16, REQ-17`).
- [x] **T-39:** Implementar vista Canvas y controles táctiles en `src/games/pong/ui/PongView.ts` (`@spec REQ-18, REQ-19`).
- [x] **T-40:** Crear punto de entrada de módulo en `src/games/pong/index.ts` (`@spec REQ-14`).
- [x] **T-41:** Actualizar `src/common/data/games.data.ts` con Pong disponible (`@spec REQ-20`).
- [x] **T-42:** Actualizar `src/main.ts` con navegación para `#pong` (`@spec REQ-20`).
- [x] **T-43:** Suite de pruebas unitarias en `tests/unit/pong.engine.test.ts` (`@spec REQ-14, REQ-15, REQ-16, REQ-17`).
- [x] **T-44:** Actualizar tests de renderizado en `tests/unit/render.test.ts` (`@spec REQ-18, REQ-19, REQ-20`).
- [x] **T-45:** Verificación completa con `npm test`, `npm run build` y `dbv-lint.py` (29/29 tests, 24/24 specs, 0 avisos).
- [x] **T-46:** Commit y push de la Fase 3 a GitHub.

### Fase 4: Implementación del Juego Tetris (Completada)
- [x] **T-47:** Definir tipos y matrices en `src/games/tetris/types.ts` (`@spec REQ-21, REQ-22`).
- [x] **T-48:** Implementar motor de lógica pura en `src/games/tetris/engine/TetrisEngine.ts` (`@spec REQ-22, REQ-23, REQ-24`).
- [x] **T-49:** Implementar vista Canvas y controles táctiles en `src/games/tetris/ui/TetrisView.ts` (`@spec REQ-24, REQ-25, REQ-26`).
- [x] **T-50:** Crear punto de entrada de módulo en `src/games/tetris/index.ts` (`@spec REQ-21`).
- [x] **T-51:** Actualizar `src/common/data/games.data.ts` con Tetris disponible (`@spec REQ-27`).
- [x] **T-52:** Actualizar `src/main.ts` con navegación para `#tetris` (`@spec REQ-27`).
- [x] **T-53:** Suite de pruebas unitarias en `tests/unit/tetris.engine.test.ts` (`@spec REQ-21, REQ-22, REQ-23, REQ-24`).
- [x] **T-54:** Actualizar tests de renderizado en `tests/unit/render.test.ts` (`@spec REQ-25, REQ-26, REQ-27`).
- [x] **T-55:** Verificación completa con `npm test`, `npm run build` y `dbv-lint.py` (40/40 tests, 31/31 specs, 0 avisos).
- [x] **T-56:** Commit y push de la Fase 4 a GitHub.

### Fase 5: Implementación del Juego Breakout (Completada)
- [x] **T-57:** Definir tipos y modelos en `src/games/breakout/types.ts` (`@spec REQ-28, REQ-29, REQ-31`).
- [x] **T-58:** Implementar motor físico puro en `src/games/breakout/engine/BreakoutEngine.ts` (`@spec REQ-29, REQ-30, REQ-31, REQ-32`).
- [x] **T-59:** Implementar vista Canvas y controles táctiles en `src/games/breakout/ui/BreakoutView.ts` (`@spec REQ-32, REQ-33`).
- [x] **T-60:** Crear punto de entrada de módulo en `src/games/breakout/index.ts` (`@spec REQ-28`).
- [x] **T-61:** Añadir estilos CSS de Breakout en `src/common/styles/main.css`.
- [x] **T-62:** Actualizar `src/common/data/games.data.ts` con Breakout disponible (`@spec REQ-34`).
- [x] **T-63:** Actualizar `src/main.ts` con navegación para `#breakout` (`@spec REQ-34`).
- [x] **T-64:** Suite de pruebas unitarias en `tests/unit/breakout.engine.test.ts` (`@spec REQ-28, REQ-29, REQ-30, REQ-31, REQ-32`).
- [x] **T-65:** Actualizar tests de renderizado en `tests/unit/render.test.ts` y catálogo (`@spec REQ-33, REQ-34`).
- [x] **T-66:** Verificación completa con `npm test`, `npm run build` y `dbv-lint.py` (49/49 tests, 38/38 specs, 0 avisos).

## Deuda Técnica
*Mejoras detectadas fuera del foco de la tarea actual, para abordarlas en fases futuras.*

- [ ] Implementación de Tres en raya (Fase 6 del roadmap final).

---

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-11-01
> **Exact point / Punto exacto:** Fase 5 completada al 100%. Juego Breakout totalmente funcional y jugable con cinemática 2D de alta precisión, matriz multicapa de 50 ladrillos (5 filas coloreadas por tokens de diseño), rebote dinámico angular en la paleta, resolución precisa de colisiones AABB sin solapamiento, 3 vidas, condición de victoria/derrota, y récord persistido.
> **Pending / Pendiente:** Ninguna tarea pendiente para Breakout.
> **Next step / Próximo paso:** Fase 6 (Especificación e implementación del último juego: **Tres en raya**).
