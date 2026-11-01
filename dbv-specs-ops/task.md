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

## Deuda Técnica
*Mejoras detectadas fuera del foco de la tarea actual, para abordarlas en fases futuras.*

- [ ] Implementación de Breakout (Fase 5 del roadmap).
- [ ] Implementación de Tres en raya (Fase 6 del roadmap).

---

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-11-01
> **Exact point / Punto exacto:** Fase 4 completada al 100%. Juego Tetris totalmente funcional y jugable con motor clásico 10x20, los 7 tetrominós con rotación y wall kicks, detección y limpieza de líneas, cálculo de puntuación y niveles, proyección de caída (Ghost Piece), previsualización de siguiente pieza, HUD completo, controles táctiles y persistencia de récord.
> **Pending / Pendiente:** Ninguna tarea pendiente para Tetris.
> **Next step / Próximo paso:** Fase 5 (Especificación e implementación de **Breakout**).
