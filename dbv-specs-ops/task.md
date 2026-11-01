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

### Fase 6: Implementación del Juego Tres en Raya (Completada)
- [x] **T-67:** Definir tipos y modelos en `src/games/tic-tac-toe/types.ts` (`@spec REQ-35, REQ-36, REQ-37`).
- [x] **T-68:** Implementar motor lógico e IA Minimax en `src/games/tic-tac-toe/engine/TicTacToeEngine.ts` (`@spec REQ-36, REQ-37, REQ-38`).
- [x] **T-69:** Implementar interfaz accesible y renderizado en `src/games/tic-tac-toe/ui/TicTacToeView.ts` (`@spec REQ-38, REQ-39`).
- [x] **T-70:** Crear punto de entrada de módulo en `src/games/tic-tac-toe/index.ts` (`@spec REQ-35`).
- [x] **T-71:** Añadir estilos CSS de Tres en raya en `src/common/styles/main.css`.
- [x] **T-72:** Actualizar `src/common/data/games.data.ts` con Tres en raya disponible (`@spec REQ-40`).
- [x] **T-73:** Actualizar `src/main.ts` con navegación para `#tic-tac-toe` (`@spec REQ-40`).
- [x] **T-74:** Suite de pruebas unitarias en `tests/unit/tic-tac-toe.engine.test.ts` (`@spec REQ-35, REQ-36, REQ-37, REQ-38`).
- [x] **T-75:** Actualizar tests de renderizado en `tests/unit/render.test.ts` y catálogo (`@spec REQ-39, REQ-40`).
- [x] **T-76:** Verificación completa con `npm test`, `npm run build` y `dbv-lint.py` (59/59 tests, 44/44 specs, 0 avisos).

### Sistema de Efectos de Sonido Arcade (Completado)
- [x] **T-77:** Implementar `src/common/audio/SoundEffects.ts` con osciladores Web Audio API (`AudioContext`), síntesis de ondas cuadradas/triangulares y envolventes ADSR (`@spec REQ-41`).
- [x] **T-78:** Añadir botón de control de audio (🔊 / 🔇) en la cabecera semántica `src/common/components/Header.ts` con persistencia en `localStorage` (`@spec REQ-41`).
- [x] **T-79:** Conectar efectos de sonido en Snake (`src/games/snake/ui/SnakeView.ts`: comer, morir, inicio) (`@spec REQ-41`).
- [x] **T-80:** Conectar efectos de sonido en Pong, Tetris, Breakout y Tres en raya (`@spec REQ-41`).
- [x] **T-81:** Crear suite de pruebas unitarias en `tests/unit/sound.test.ts` validando síntesis y tolerancia a entornos sin audio (`@spec REQ-41`).
- [x] **T-82:** Verificación completa con `npm test`, `npm run build` y `dbv-lint.py` (65/65 tests, 45/45 specs, 0 avisos).

### Ajustes de Jugabilidad, UI y Arte (Completado)
- [x] **T-83:** Calibrar velocidad de la bola y bucle a 60Hz fijo en Breakout (`BreakoutEngine.ts` y `BreakoutView.ts`) (`@spec REQ-30, REQ-33`).
- [x] **T-84:** Desbloquear turno de IA en Tres en raya corrigiendo `makeMove()` en `TicTacToeEngine.ts` y test (`@spec REQ-37, REQ-38`).
- [x] **T-85:** Eliminar "Fase X (Disponible)" en las tarjetas de juego en `GameCard.ts` (`@spec REQ-04`).
- [x] **T-86:** Mejorar el logo/icono SVG de Snake en `games.data.ts` con diseño retro arcade de alta calidad (`@spec REQ-04, REQ-10`).
- [x] **T-87:** Verificación completa con `npm test`, `npm run build` y `dbv-lint.py`, commit y push a GitHub.

### Selector de Dificultad Dinámica y Ajustes de Breakout (Completado)
- [x] **T-88:** Corregir maquetación de la cabecera en Breakout y ocultar controles táctiles en escritorio (`BreakoutView.ts` y `main.css`) (`@spec REQ-33, REQ-42`).
- [x] **T-89:** Selector de dificultad de 3 niveles en Snake con modulación de velocidad y persistencia (`SnakeEngine.ts`, `SnakeView.ts`, test) (`@spec REQ-42`).
- [x] **T-90:** Selector de dificultad de 3 niveles en Pong con modulación de velocidad e IA (`PongEngine.ts`, `PongView.ts`, test) (`@spec REQ-42`).
- [x] **T-91:** Selector de dificultad de 3 niveles en Breakout con modulación de velocidad de bola y paleta (`BreakoutEngine.ts`, `BreakoutView.ts`, test) (`@spec REQ-42`).
- [x] **T-92:** Verificación completa con `npm test`, `npm run build` y `dbv-lint.py`, commit y push a GitHub.

## Deuda Técnica
*Mejoras detectadas fuera del foco de la tarea actual, para abordarlas en fases futuras.*

- *(Ninguna pendiente).*

---

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-11-01
> **Exact point / Punto exacto:** Selector de dificultad de 3 niveles (Fácil, Normal, Difícil) implementado en Snake, Pong y Breakout con persistencia y modulación de velocidad física; maquetación de Breakout y ocultación de controles táctiles en escritorio completadas (REQ-42).
> **Pending / Pendiente:** Ninguna.
> **Next step / Próximo paso:** Proyecto en estado estable y probado, listo para nuevas peticiones o fases.
