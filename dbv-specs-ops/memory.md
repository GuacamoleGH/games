# 🧠 Memory & Context — GuacamoleGH Games

> **Frontera de uso (Memory vs. Tasks):**
> - `task.md` → progreso **operativo**: checklist de tareas, Snapshot de Contexto (el paso exacto siguiente), y estado de la sesión.
> - `memory.md` → contexto **cualitativo y temático**: conocimiento persistente, decisiones técnicas profundas, lecciones, y el área del producto en foco (no el paso específico).
>
> *Instrucción para la IA: Consulta este archivo al inicio de cada sesión para recuperar el hilo técnico. Actualiza las secciones correspondientes cuando el workflow lo indique (triggers en `/plan`, `/build`, `/test` y gate en `/ship`).*

## 🎯 Contexto Activo
- **Estado actual del desarrollo:** Fase 1 — Especificación y Planificación de la web de catálogo. Repositorio inicializado en blanco.
- **Foco inmediato:** Definición rigurosa de especificaciones (`SPECIFICATIONS.md`), arquitectura modular (`ARCHITECTURE.md`), sistema de diseño con tokens (`DESIGN.md`) y plan de implementación (`implementation_plan.md`). Pendiente de validación por el usuario antes de pasar a la fase `/build`.

## 🏗️ Log de Decisiones Técnicas (ADR Ligero)
*Registro de por qué se tomaron ciertas rutas. Formato: `- **AAAA-MM-DD - Título:** decisión y motivo.`*

- **2026-11-01 - ADR-001: Despliegue Estático sin Backend:** Se descarta cualquier backend (Node/Python/Go/bases de datos) para mantener la web 100% estática, ligera y segura para el entorno homelab GuacamoleGH.
- **2026-11-01 - ADR-002: Modularidad Aislada por Juego:** Cada juego futuro residirá en su propio directorio aislado bajo `src/games/<juego>/` con lógica de canvas, estilos y assets independientes, desacoplados del catálogo principal.
- **2026-11-01 - ADR-003: Stack Ligero Vite + TypeScript + CSS Moderno:** Se propone Vite con TypeScript para asegurar tipado estricto en la lógica futura de bucles de juegos y canvas, sin dependencias pesadas ni frameworks de UI innecesarios en la Fase 1.
- **2026-11-01 - ADR-004: Independencia Absoluta de Infraestructura Homelab:** Este repositorio (`GuacamoleGH/games`) se mantiene estrictamente autónomo sin alterar la web principal ni tocar configuraciones de Cloudflare Tunnels, Docker o DNS.
- **2026-11-01 - ADR-005: Desacoplamiento Modelo/Vista en Snake y Navegación SPA Ligera:** La lógica de Snake se encapsula en `SnakeEngine.ts` (100% pura y testeable sin DOM) y se renderiza mediante `SnakeView.ts` en Canvas. La navegación catálogo ↔ juego se gestiona con hash routing (`#snake`) sin librerías de enrutamiento externas.

## ⚠️ Lecciones Aprendidas / Errores Evitados

- **2026-11-01:** Mantener el catálogo en la Fase 1 estrictamente informativo ("Próximamente") sin incluir lógica embrionaria o placeholders ejecutables de juegos para evitar deuda técnica prematura.
- **2026-11-01:** En juegos de cuadrícula por ticks (Snake), el filtrado anti-reversión de 180° debe contrastarse obligatoriamente contra `lastProcessedDirection` (la dirección del último tick ejecutado) y no contra `currentDirection` de entrada rápida, evitando autocolisiones accidentales por pulsaciones dobles dentro del mismo ciclo temporal.

## 🚫 Rejection Memory (Caminos Descartados)

- **REJECTED-01** (2026-11-01) · Ámbito: Arquitectura general — Intento: Incluir backend (Node.js/FastAPI) o persistencia para rankings/cuentas → Motivo: Viola las restricciones explícitas del proyecto; aumenta innecesariamente la superficie de ataque y el mantenimiento del homelab → En su lugar: Web estática cliente pura.
- **REJECTED-02** (2026-11-01) · Ámbito: Framework frontend — Intento: Frameworks pesados de servidor o SPA monolíticas (Next.js, Angular, Nuxt) → Motivo: Complejidad desproporcionada para un catálogo y juegos basados en Canvas HTML5 → En su lugar: Vite + TypeScript modular con componentes reutilizables ligeros.

## 🗺️ Mapa de Relaciones

- **Catálogo (`src/common/`):** Gobierna la interfaz de la página principal (Header, Hero, GameGrid, GameCard, Footer) y orquesta la presentación del catálogo.
- **Módulos de Juegos (`src/games/`):** Directorios aislados y autocontenidos que se implementarán uno a uno en fases futuras.
- **Tokens de Diseño (`src/common/styles/tokens.css`):** Variables CSS derivadas de `docs/DESIGN.md` que definen la paleta oscura, carbón y verde/turquesa.

---

## 🧹 Política de Mantenimiento

*Aplicar en cada `/ship` de tipo Major, o cuando este fichero supere las 200 líneas activas (Hot/Warm/Cold, ver `<context_management>` de `MASTER_PROMPT.md`).*
