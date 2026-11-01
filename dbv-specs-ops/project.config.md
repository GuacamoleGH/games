# 🪪 Project Config

> This file is read automatically by the AI at session start.
> If placeholders are detected, the AI will propose a complete setup draft with marked assumptions (`[ASSUMPTION: ...]`) for you to confirm in one single step.

---

## Project Identity

- **Name:** GuacamoleGH Games
- **Description:** Catálogo web de juegos arcade clásicos para navegador en el homelab GuacamoleGH
- **Author / Company:** GuacamoleGH · https://github.com/GuacamoleGH/games
- **License:** MIT
- **Languages:** TypeScript, HTML5, CSS3
- **Technologies / Stack:** Vite, TypeScript, CSS3 / Modern Vanilla CSS (con Custom Properties)
- **Agent Readiness (Web):** Yes
- **Desktop AI Assistant (Local/Cloud/ACP):** No
- **Framework Version:** 3.2.0

---

## Model Routing Guidelines

To optimize OpEx (Token Burn) and latency, refer to this routing strategy when executing project development tasks:

| Development Phase | Required Reasoning Complexity | Recommended Model Class | Example Models |
| --- | --- | --- | --- |
| `/spec` (Specifications) | Very High | Advanced Reasoning / Frontier Models | Gemini 3.1 Pro, Claude Opus 5, GPT-5.6 Sol |
| `/plan` (Planning / Architecture) | Very High | Advanced Reasoning / Frontier Models | Gemini 3.1 Pro, Claude Opus 5, GPT-5.6 Sol |
| `/build` (Code Implementation) | Medium | Fast, high-accuracy coding models | Gemini 3.5 Flash, Claude Sonnet 5, GPT-5.6 Terra |
| `/test` (Conventional Tests / Evals) | Medium-Low | Fast & cheap models | Gemini 2.5 Flash-Lite, Claude Haiku 5, GPT-5.6 Luna |
| `/code-simplify` (Security & Refactor) | High | Security-conscious reasoning models | Gemini 3.1 Pro, Claude Sonnet 5, GPT-5.6 Sol |
| `/ship` (Documentation, Changelog) | Low | Fast, text-optimized models | Gemini 2.5 Flash-Lite, Claude Haiku 5, GPT-5.6 Luna |

---

## File Header Template

All source files must include a header comment in the appropriate syntax for the language.
Use the fields above to generate it. Always include the framework credit line.

**Example (TypeScript / JavaScript / CSS):**
```
// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================
```

**Example (HTML):**
```
<!--
  GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
  Copyright (c) 2026 GuacamoleGH
  Licensed under the MIT License. See LICENSE for details.
  Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
-->
```

---

## Fuente de verdad
- Modo: repo

## Guardarraíles activos
- Pre-commit: no
- Linter dbv-lint.py (en /code-simplify): sí
- Branch protection en CI: no

## Release de GitHub
- GitHub Release: manual

## Maintain (Fase 7)
- Activo: no
