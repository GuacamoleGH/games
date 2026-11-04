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

### Fase 7: Implementación del Juego Space Invaders (Completada)
- [x] **T-93:** Definir tipos y modelos en `src/games/space-invaders/types.ts` (`@spec REQ-43, REQ-44, REQ-45`).
- [x] **T-94:** Implementar motor de física y lógica pura en `src/games/space-invaders/engine/SpaceInvadersEngine.ts` (`@spec REQ-44, REQ-45`).
- [x] **T-95:** Implementar efectos de sonido sintetizados en `src/common/audio/SoundEffects.ts` (`@spec REQ-47`).
- [x] **T-96:** Implementar vista Canvas y controles táctiles en `src/games/space-invaders/ui/SpaceInvadersView.ts` (`@spec REQ-45, REQ-46, REQ-47`).
- [x] **T-97:** Crear punto de entrada de módulo en `src/games/space-invaders/index.ts` (`@spec REQ-43`).
- [x] **T-98:** Añadir estilos CSS de Space Invaders en `src/common/styles/main.css`.
- [x] **T-99:** Actualizar tipos `GameId` en `src/common/types/game.ts` y catálogo en `src/common/data/games.data.ts` (`@spec REQ-48`).
- [x] **T-100:** Actualizar enrutador SPA y navegación en `src/main.ts` (`@spec REQ-48`).
- [x] **T-101:** Suite de pruebas unitarias en `tests/unit/space-invaders.engine.test.ts` y actualizar `tests/unit/render.test.ts` (`@spec REQ-43, REQ-44, REQ-45, REQ-46, REQ-47, REQ-48`).
- [x] **T-102:** Verificación completa con `npm test`, `npm run build` y `dbv-lint.py`, commit y push a GitHub.

### Optimización de UI y Distribución de Controles (Completada)
- [x] **T-103:** Corregir alineación de la barra superior de Tetris (`.tetris-top-bar`) con `justify-content: space-between` y ancho acotado a 416px para alinear Volver al Catálogo y Pausa (`main.css`) (`@spec REQ-25, RNF-02, RNF-03`).
- [x] **T-104:** Ocultar controles táctiles virtuales en escritorio (`min-width: 900px` y `pointer: fine`) para Tetris (`.tetris-touch-controls`) y demás títulos (`main.css`) (`@spec RNF-02, RNF-03`).
- [x] **T-105:** Centrar barra de acciones en Breakout y Space Invaders en resoluciones intermedias/móviles para evitar desbordes desalineados (`main.css`) (`@spec REQ-33, REQ-46, RNF-02`).
- [x] **T-106:** Verificación completa con `npm test`, `npm run build` y `dbv-lint.py` (86/86 tests, 52/52 specs, 0 avisos).
- [x] **T-107:** Homogeneizar dimensiones y arquitectura de barra superior en los 6 juegos: altura fija de 42px en botones y HUD, estructura tríptico unificada (Volver / HUD / Acciones), y `white-space: nowrap` anti-envoltura (`main.css`, views) (`@spec REQ-04, REQ-25, REQ-33, REQ-46, RNF-02, RNF-03`).
- [x] **T-108:** Corregir deformación de cuadrícula en Tres en Raya (`grid-template-rows: repeat(3, 1fr)` y `aspect-ratio: 1 / 1`), alinear barra superior a 640px en una sola línea horizontal y cancelar temporizadores asíncronos en reinicio (`main.css`, `TicTacToeView.ts`) (`@spec REQ-38, REQ-39, RNF-02, RNF-03`).
- [x] **T-109:** Selección aleatoria de turno inicial (50% humano 'X', 50% IA 'O') en Tres en Raya al iniciar o pulsar Nueva Ronda, con mensajes de apertura dinámicos y disparo automático de IA (`TicTacToeEngine.ts`, `TicTacToeView.ts`, tests) (`@spec REQ-36`).


### Fase 8: Implementación del Juego Pac-Man (Completada)
- [x] **T-110:** Definir tipos y estados en `src/games/pacman/types.ts` (`@spec REQ-49, REQ-50`).
- [x] **T-111:** Implementar motor lógico y laberinto en `src/games/pacman/engine/PacmanEngine.ts` (`@spec REQ-50`).
- [x] **T-112:** Implementar renderizado Canvas retro-neón y controles táctiles en `src/games/pacman/ui/PacmanView.ts` (`@spec REQ-50, REQ-51`).
- [x] **T-113:** Crear punto de entrada de módulo en `src/games/pacman/index.ts` y README (`@spec REQ-49`).
- [x] **T-114:** Integrar Pac-Man en catálogo `games.data.ts` y enrutador `main.ts` (`@spec REQ-52`).
- [x] **T-115:** Suite de pruebas unitarias en `tests/unit/pacman.engine.test.ts` (`@spec REQ-49, REQ-50, REQ-51, REQ-52`).

### Fase 9: Implementación del Juego Asteroids (Completada)
- [x] **T-116:** Definir tipos y modelos en `src/games/asteroids/types.ts` (`@spec REQ-53, REQ-54`).
- [x] **T-117:** Implementar motor físico vectorial en `src/games/asteroids/engine/AsteroidsEngine.ts` (`@spec REQ-54`).
- [x] **T-118:** Implementar renderizado Canvas vectorial y controles táctiles en `src/games/asteroids/ui/AsteroidsView.ts` (`@spec REQ-54, REQ-55`).
- [x] **T-119:** Crear punto de entrada de módulo en `src/games/asteroids/index.ts` y README (`@spec REQ-53`).
- [x] **T-120:** Integrar Asteroids en catálogo `games.data.ts` y enrutador `main.ts` (`@spec REQ-56`).
- [x] **T-121:** Suite de pruebas unitarias en `tests/unit/asteroids.engine.test.ts` (`@spec REQ-53, REQ-54, REQ-55, REQ-56`).

### Fase 10: Implementación del Juego Blackjack (Completada)
- [x] **T-122:** Definir tipos y reglas en `src/games/blackjack/types.ts` (`@spec REQ-57, REQ-58`).
- [x] **T-123:** Implementar motor de naipes e IA crupier en `src/games/blackjack/engine/BlackjackEngine.ts` (`@spec REQ-58`).
- [x] **T-124:** Implementar vista accesible de tapete y naipes en `src/games/blackjack/ui/BlackjackView.ts` (`@spec REQ-58, REQ-59`).
- [x] **T-125:** Crear punto de entrada de módulo en `src/games/blackjack/index.ts` y README (`@spec REQ-57`).
- [x] **T-126:** Integrar Blackjack en catálogo `games.data.ts` y enrutador `main.ts` (`@spec REQ-60`).
- [x] **T-127:** Suite de pruebas unitarias en `tests/unit/blackjack.engine.test.ts` (`@spec REQ-57, REQ-58, REQ-59, REQ-60`).

### Verificación Final y Documentación (Completada)
- [x] **T-128:** Actualizar estilos CSS en `src/common/styles/main.css` manteniendo compacidad y consistencia visual.
- [x] **T-129:** Actualizar pruebas del catálogo `render.test.ts` y `games.data.test.ts` con 9 juegos disponibles.
- [x] **T-130:** Verificación completa con `npm test`, `npm run build` y `dbv-lint.py` (0 errores, 0 avisos).
- [x] **T-131:** Implementar IA auténtica de fantasmas Namco 1980 en Pac-Man: ciclos temporizados Scatter/Chase, desempate estricto UP>LEFT>DOWN>RIGHT, objetivos individuales (Blinky Chase/Cruise Elroy, Pinky 4 casillas con bug hacia arriba, Inky duplicación vectorial, Clyde radio 8 casillas), eliminación de la línea rosa del interior de la casa, estado 'eaten' con navegación de ojos y regeneración en la base (`PacmanEngine.ts`, tests) (`@spec REQ-50`).
- [x] **T-132:** Centrar barra superior de Pac-Man respecto a la pantalla completa (`minmax(0, 1fr) auto minmax(0, 1fr)` con `max-width: 900px`), vidas estrictamente horizontales con `white-space: nowrap` y eliminación del badge 'Homelab Edition' del Header (`PacmanView.ts`, `Header.ts`, `main.css`, tests) (`@spec REQ-01, REQ-51`).
- [x] **T-133:** Implementar mecánica de División (Split) en Blackjack y sincronizar audio de resultado: botón Dividir [V], gestión independiente de manos y apuestas, resolución ante el crupier, y sonido ejecutado de forma síncrona solo tras revelar la carta del crupier y mostrar el banner (`BlackjackEngine.ts`, `BlackjackView.ts`, `main.css`, tests) (`@spec REQ-58, REQ-59`).
- [x] **T-134:** Corregir movimiento casilla a casilla estricto en Pac-Man: erradicar redondeos de coma flotante que teletransportaban fantasmas al interior de muros, asegurar salida fluida de la Ghost House (Pinky, Inky, Clyde) y regeneración de ojos devorados en la puerta (9, 8) sin bloqueos (`PacmanEngine.ts`, tests) (`@spec REQ-50`).
- [x] **T-135:** Zapato multibaraja de 6 barajas (312 cartas) con rebarajado automático, visualización de baraja de naipes en esquina superior derecha con etiqueta "BARAJA", cambio de etiqueta de puntuación a "VALOR" y eliminación del conteo de cartas numérico (`BlackjackEngine.ts`, `BlackjackView.ts`, `main.css`, tests) (`@spec REQ-58, REQ-59`).
- [x] **T-136:** Resolver solapamiento en barra superior de Asteroids ampliando contenedor a 880px y compactando espaciado; implementar escalado integral de dificultad (Fácil, Normal, Difícil, Extremo) que altera dinámicamente cantidad de asteroides por oleada, multiplicador de velocidad, fragmentación, vidas iniciales y cadencia de disparo (`AsteroidsEngine.ts`, `AsteroidsView.ts`, `main.css`, tests) (`@spec REQ-54, REQ-55`).
- [x] **T-137:** Eliminar el botón y selector de dificultad en Pac-Man preservando el escalado arcade auténtico por niveles (`PacmanView.ts`, tests) (`@spec REQ-50, REQ-51`).
- [x] **T-138:** Homologación visual absoluta de la barra superior en 900px con HUD unificado sin solapamientos, y reinicio automático de partida al alternar dificultad en todos los juegos (Snake, Breakout, Pong, Space Invaders, Asteroids, Tic-Tac-Toe) (`AsteroidsEngine.ts`, views, `main.css`, tests) (`@spec REQ-04, REQ-10, REQ-18, REQ-25, REQ-33, REQ-46, REQ-54, RNF-02, RNF-03`).
- [x] **T-139:** Restaurar cinemática original de Asteroids (Atari 1979) donde los asteroides no chocan entre sí y atraviesan libremente el espacio (`AsteroidsEngine.ts`, tests) (`@spec REQ-54`).
- [x] **T-140:** Actualizar `README.md`, badge de tests (130 passing) y sincronizar todos los cambios con GitHub en las ramas `main` y `master`.

## Deuda Técnica
*Mejoras detectadas fuera del foco de la tarea actual, para abordarlas en fases futuras.*

- *(Ninguna pendiente).*

---

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-11-04
> **Exact point / Punto exacto:** Todos los cambios (Pac-Man, Asteroids, Blackjack, nuevo logo oficial, HUD homologado 900px, 130 tests unitarios) commiteados y subidos exitosamente a GitHub (ramas `main` y `master`).
> **Pending / Pendiente:** Ninguna tarea pendiente. Esperando nuevas instrucciones del usuario.
> **Next step / Próximo paso:** Esperar nuevas instrucciones del usuario.
