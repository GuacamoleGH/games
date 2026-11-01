# 🏗 Arquitectura Técnica: GuacamoleGH Games

> **Fase:** `/plan` (Planificación Técnica)
> **Estado:** Validado para Fase 1 (Pendiente Aprobación de Plan por el Usuario)
> **Última Revisión:** 2026-11-01
> **Proyecto:** GuacamoleGH Games (Catálogo Web Arcade)

---

## 🛠 1. Stack Tecnológico

| Capa | Tecnología Seleccionada | Justificación Técnica |
| --- | --- | --- |
| **Entorno y Bundler** | **Vite 6.x** | Empaquetado estático ultrarrápido, soporte nativo de ESM, recarga en caliente instantánea y generación de artefactos `dist/` estáticos puros sin dependencias en el servidor. |
| **Lenguaje** | **TypeScript 5.x** | Tipado estático estricto. Crucial para prevenir errores en tiempo de desarrollo y preparar contratos de interfaz limpios para los futuros bucles de juegos y canvas. |
| **Arquitectura UI** | **Componentes Modulares Ligeros (TS + Web Standards)** | Arquitectura basada en funciones/clases de componentes desacoplados que generan HTML semántico seguro, sin sobrecargar con frameworks pesados (React/Vue) para un catálogo estático. |
| **Estilos** | **CSS3 Moderno + Custom Properties** | Implementación directa de los tokens de `docs/DESIGN.md`. Cero dependencias adicionales, soporte nativo de variables, CSS Grid fluido y flexbox. |
| **Testing** | **Vitest + Happy-DOM / JSDOM** | Suite de pruebas unitarias ultrarrápida con compatibilidad nativa de TypeScript y ESM, permitiendo verificar el render del catálogo y la integridad de metadatos. |
| **Calidad y Linter** | **TypeScript (`strict`) + Linter DBV (`dbv-lint.py`)** | Garantiza el cumplimiento de las directrices de código limpio, un solo `return` con guard clauses y tipado robusto. |
| **Despliegue** | **Web Estática Pura (HTML/JS/CSS)** | Despliegue estático 100% independiente, integrable sin fricción en cualquier contenedor web o servidor de homelab sin backend activo. |

---

## 📂 2. Estructura de Directorios Planificada

```text
/
├── .github/
│   └── workflows/
│       └── ci.yml                   # Integración continua: verificación de tipos, linter y tests
├── dbv-specs-ops/                   # Framework de gobernanza y especificaciones SDD (v3.2.0)
│   ├── docs/
│   │   ├── SPECIFICATIONS.md        # Requisitos funcionales y no funcionales (REQ-XX)
│   │   ├── ARCHITECTURE.md          # Este documento (decisiones técnicas y estructura)
│   │   └── DESIGN.md                # Tokens de diseño y especificación visual
│   ├── project.config.md            # Identidad del proyecto y configuración maestro
│   ├── memory.md                    # Registro de ADRs, lecciones y Rejection Memory
│   ├── task.md                      # Backlog de tareas y Snapshot de contexto
│   └── implementation_plan.md       # Plan técnico detallado de la fase en curso
├── public/
│   ├── favicon.svg                  # Isotipo favicon de GuacamoleGH Games
│   ├── robots.txt                   # Agent Readiness (directivas para bots e IA)
│   └── llms.txt                     # Agent Readiness (contexto estructurado en Markdown)
├── src/
│   ├── common/                      # Núcleo compartido del catálogo
│   │   ├── components/              # Componentes de la interfaz
│   │   │   ├── Header.ts            # Componente de cabecera con logo
│   │   │   ├── Hero.ts              # Componente de presentación
│   │   │   ├── GameGrid.ts          # Contenedor responsive del catálogo
│   │   │   ├── GameCard.ts          # Tarjeta visual con badge "Próximamente"
│   │   │   └── Footer.ts            # Pie de página y créditos
│   │   ├── data/
│   │   │   └── games.data.ts        # Registro tipado inmutable de los 5 juegos
│   │   ├── styles/
│   │   │   ├── tokens.css           # Variables CSS derivadas de docs/DESIGN.md
│   │   │   ├── reset.css            # Normalización y reset CSS accesible
│   │   │   └── main.css             # Layout global, fuentes y transiciones
│   │   └── types/
│   │       └── game.ts              # Interfaces tipadas (GameMetadata, GameStatus)
│   ├── games/                       # MÓDULOS DE JUEGOS AISLADOS (Reservados para futuras fases)
│   │   ├── snake/                   # [Fase Futura: Lógica aislada, canvas y assets de Snake]
│   │   ├── pong/                    # [Fase Futura: Lógica aislada, canvas y assets de Pong]
│   │   ├── tetris/                  # [Fase Futura: Lógica aislada, canvas y assets de Tetris]
│   │   ├── breakout/                # [Fase Futura: Lógica aislada, canvas y assets de Breakout]
│   │   └── tic-tac-toe/             # [Fase Futura: Lógica aislada y assets de Tres en raya]
│   └── main.ts                      # Punto de entrada y orquestador del catálogo
├── tests/
│   ├── unit/                        # Pruebas unitarias
│   │   ├── games.data.test.ts       # Valida integridad, IDs y campos de los 5 juegos
│   │   └── render.test.ts           # Valida generación semántica de componentes
│   └── setup.ts                     # Configuración del entorno de tests DOM
├── index.html                       # Documento HTML5 semántico
├── package.json                     # Definición del paquete, scripts y dependencias
├── tsconfig.json                    # Configuración estricta de compilador TypeScript
└── vite.config.ts                   # Configuración del empaquetador Vite
```

---

## 🔑 3. Decisiones Técnicas Clave

### 3.1. Principio de Aislamiento por Juego (Modular Sandbox)
- Cada juego en futuras fases será una unidad funcional totalmente independiente alojada en su respectivo subdirectorio dentro de `src/games/<juego>/`.
- La lógica de juego, bucles de animación (`requestAnimationFrame`), gestión de entradas de teclado/táctiles y estilos específicos del juego no contaminarán el ámbito global del catálogo ni de otros juegos.
- En la Fase 1, `src/games/` permanece únicamente estructurado a nivel arquitectónico y conceptual sin lógica ejecutable.

### 3.2. Gestión de Datos del Catálogo
- Los 5 juegos se definen de manera inmutable en `src/common/data/games.data.ts` cumpliendo la interfaz `GameMetadata`:
  ```typescript
  export type GameId = 'snake' | 'pong' | 'tetris' | 'breakout' | 'tic-tac-toe';
  export type GameStatus = 'coming-soon' | 'available' | 'maintenance';

  export interface GameMetadata {
    readonly id: GameId;
    readonly title: string;
    readonly description: string;
    readonly status: GameStatus;
    readonly statusLabel: string;
    readonly iconSvg: string;
    readonly route?: string;
  }
  ```
- En esta fase, todos los juegos declaran `status: 'coming-soon'` y `statusLabel: 'Próximamente'`.

### 3.3. Estándares de Codificación Obligatorios (DBV Specs Ops)
- **Regla de UN SOLO return + Guard Clauses:** Las funciones validarán entradas mediante guard clauses al inicio y resolverán su flujo con una única sentencia `return` al final.
- **Tipado Estricto:** Prohibición absoluta de tipos `any`. Modo estricto activado en TypeScript (`strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`).
- **Trazabilidad `@spec`:** Funciones de datos y renderizado marcarán su correspondencia con los requisitos especificados (ej. `@spec REQ-03, REQ-04`).

---

## ⚠️ 4. Restricciones y Riesgos Técnicos

- **Restricción:** No se permite la inclusión de ningún backend ni de persistencia externa. Toda la aplicación debe compilarse en archivos estáticos servibles por cualquier servidor web HTTP o almacenamiento de objetos.
- **Riesgo:** Generación de enlaces rotos o expectativas erróneas al hacer click en las tarjetas.
  - *Mitigación:* Se implementa el requisito `REQ-05`, estableciendo que las tarjetas son informativas en esta fase, utilizando marcado semántico accesible (`role="article"` en lugar de `<a>` con `href="#"`), evitando navegación fallida.

---

## 🤖 5. Agent Harness (Arnés del Agente)

- **Contexto Estático:** Cargado automáticamente mediante `GEMINI.md`, `CLAUDE.md`, `AGENTS.md` redirigiendo a `dbv-specs-ops/docs/MASTER_PROMPT.md`.
- **Guardrails:** Verificación con linter `python dbv-specs-ops/scripts/dbv-lint.py` para asegurar cumplimiento del retorno único y consistencia de especificaciones.
- **Agent Readiness:** Ficheros `public/robots.txt` y `public/llms.txt` para proveer navegación clara y eficiente a agentes de IA que exploren el homelab.
