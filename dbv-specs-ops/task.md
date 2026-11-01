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

### Fase 2: Construcción (`/build` — Completada)
- [x] **T-01:** Inicializar repositorio Git y `.gitignore`.
- [x] **T-02:** Configurar `package.json` base con scripts y dependencias.
- [x] **T-03:** Configurar `tsconfig.json` estricto y `"type": "module"`.
- [x] **T-04:** Configurar `vite.config.ts`.
- [x] **T-05:** Configurar archivo `LICENSE` (MIT).
- [x] **T-06:** Crear `src/common/styles/tokens.css` (variables de `docs/DESIGN.md`).
- [x] **T-07:** Crear `src/common/styles/reset.css`.
- [x] **T-08:** Crear `src/common/styles/main.css` (layout responsive y contenedor).
- [x] **T-09:** Definir tipos `GameMetadata`, `GameStatus`, `GameId` en `src/common/types/game.ts` (REQ-03, REQ-04).
- [x] **T-10:** Crear datos estáticos inmutables en `src/common/data/games.data.ts` (Snake, Pong, Tetris, Breakout, Tres en raya) con estado "coming-soon".
- [x] **T-11:** Implementar componente `Header.ts` con logo de GuacamoleGH Games (REQ-01).
- [x] **T-12:** Implementar componente `Hero.ts` con intro arcade tecnológica (REQ-02).
- [x] **T-13:** Implementar componente `GameCard.ts` con badge "Próximamente" seguro (REQ-04, REQ-05).
- [x] **T-14:** Implementar componente `GameGrid.ts` con cuadrícula responsive (REQ-03).
- [x] **T-15:** Implementar componente `Footer.ts` con enlaces y créditos (REQ-06).
- [x] **T-16:** Ensamblar aplicación completa en `index.html` y `src/main.ts`.
- [x] **T-17:** Estructurar directorios aislados en `src/games/` para futuros juegos.
- [x] **T-18:** Crear `public/robots.txt` (RNF-04).
- [x] **T-19:** Crear `public/llms.txt` (RNF-04).
- [x] **T-20:** Copiar y optimizar logotipo en `public/logo.png`.

### Fase 3: Pruebas y Simplificación (`/test` y `/code-simplify` — Completada)
- [x] **T-21:** Tests unitarios de integridad de datos en `tests/unit/games.data.test.ts`.
- [x] **T-22:** Tests unitarios de renderizado en `tests/unit/render.test.ts`.
- [x] **T-23:** Tests unitarios de requisitos no funcionales en `tests/unit/non_functional.test.ts`.
- [x] **T-24:** Compilación de producción con Vite (`npm run build`) verificando bundle ultra-ligero (< 20KB).
- [x] **T-25:** Auditoría de calidad y trazabilidad total con `dbv-lint.py` (10/10 requisitos cubiertos, 0 errores).

## Deuda Técnica
*Mejoras detectadas fuera del foco de la tarea actual, para abordarlas en fases futuras.*

- [ ] Implementación del motor y bucle de juego para Snake (Fase futura de juegos).
- [ ] Implementación de Pong, Tetris, Breakout y Tres en raya (Fases futuras de juegos).
- [ ] Soporte para `prefers-reduced-motion` en las animaciones de pulso de badges.

---

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-11-01
> **Exact point / Punto exacto:** Fase 1 completada al 100%. Catálogo implementado, probado y compilado.
> **Pending / Pendiente:** Ninguna tarea pendiente para esta primera fase.
> **Next step / Próximo paso:** Comenzar la especificación e implementación del primer juego (**Snake**) en la Fase 2 cuando el usuario lo disponga.
