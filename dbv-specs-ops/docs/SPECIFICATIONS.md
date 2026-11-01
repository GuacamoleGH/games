# 📋 Especificaciones: GuacamoleGH Games

> **Fase:** `/spec` (Especificación)
> **Estado:** Validado para Fase 1 (Pendiente Aprobación de Plan por el Usuario)
> **Última Revisión:** 2026-11-01
> **Proyecto:** GuacamoleGH Games (Catálogo Web Arcade)

---

## 🎯 1. Contexto y Objetivos

*Basado en la filosofía de "entender el problema antes de proponer la solución".*

- **Problema:** El homelab GuacamoleGH cuenta con diversos servicios y una web principal independiente, pero carece de un espacio recreativo web ligero donde explorar y disfrutar de juegos arcade clásicos directamente desde el navegador de forma rápida y accesible.
- **Objetivo (Éxito):** Desarrollar la página principal de **GuacamoleGH Games** como un catálogo visual pulido, moderno, minimalista y tecnológico, que presente de forma clara los 5 juegos clásicos planificados para futuras fases mostrando su estado actual como **"Próximamente"**, con rendimiento óptimo, accesibilidad y diseño responsive.

---

## 👥 2. Usuarios y Escenarios

- **Perfil de Usuario:** Visitantes y usuarios del homelab GuacamoleGH que acceden desde ordenadores de sobremesa, portátiles, tablets o dispositivos móviles.
- **Escenarios Clave:**
  - *Escenario A (Exploración desde PC/Móvil):* El usuario accede a la URL de Games y visualiza de inmediato una cabecera tecnológica, un mensaje de bienvenida (Hero) que explica la colección arcade y una cuadrícula con los 5 títulos previstos.
  - *Escenario B (Consulta de Estado):* El usuario observa las tarjetas de cada juego con su icono/diseño, título, sinopsis breve y la indicación explícita de "Próximamente", comprendiendo que aún no son jugables y sin encontrarse con enlaces rotos ni comportamientos inesperados.
  - *Escenario C (Navegación accesible y rápida):* El usuario en dispositivo táctil o mediante teclado puede desplazarse con fluidez y contraste visual nítido bajo una interfaz con tema oscuro carbón y acentos verdes/turquesas.

---

## ✨ 3. Funcionalidades Principales (Requisitos)

*Trazabilidad de Requisitos (Spec IDs): Cada requisito lleva un identificador inmutable para su posterior trazabilidad en código (`@spec REQ-XX`) y tests.*

### Requisitos Funcionales (RF)

- [ ] **REQ-01 · Cabecera de Marca (Header):** La página debe contar con una cabecera minimalista que incluya el nombre de la web "GuacamoleGH Games" acompañado de un identificador visual o isotipo representativo, accesible y alineado a la identidad de GuacamoleGH.
- [ ] **REQ-02 · Sección Hero / Introducción:** Debe presentar una sección introductoria destacada que comunique claramente el propósito del sitio: una colección curada de juegos arcade clásicos para disfrutar directamente en el navegador.
- [ ] **REQ-03 · Catálogo Visual de Juegos (Grid):** Debe presentar una cuadrícula responsive y equilibrada que contenga exactamente las tarjetas para los 5 juegos arcade planificados:
  1. **Snake** (La clásica serpiente que crece al alimentarse evitando muros y a sí misma).
  2. **Pong** (El legendario duelo de palas y pelota en dos dimensiones).
  3. **Tetris** (El puzzle icónico de apilar y encajar tetrominós).
  4. **Breakout** (El clásico desafío de demoler ladrillos con bola y paleta).
  5. **Tres en raya** (El duelo táctico de turnos 3x3).
- [ ] **REQ-04 · Tarjeta de Juego (GameCard):** Cada tarjeta debe estructurarse limpiamente mostrando:
  - Icono o elemento visual distintivo del juego en estética arcade/minimalista.
  - Título oficial del juego.
  - Breve descripción del concepto o mecánica (1-2 frases).
  - Insignia o badge con el estado **"Próximamente"** claramente legible.
- [ ] **REQ-05 · Estado No Jugable Seguro:** En esta fase, las tarjetas son informativas. No deben contener botones de "Jugar" ficticios, ni enlaces a páginas en blanco o errores 404. Deben responder visualmente al foco y hover con sutileza tecnológica, manteniendo intacta la expectativa del usuario.
- [ ] **REQ-06 · Pie de Página (Footer):** Pie de página sobrio que incluya créditos del proyecto GuacamoleGH, mención al homelab, año y enlace al repositorio de código fuente.

### Requisitos No Funcionales (RNF)

- [ ] **RNF-01 · Rendimiento y Ligereza:** Carga instantánea con footprint inicial reducido (bundle compilado < 150KB sin assets pesados), score objetivo de 100/100 en Lighthouse de rendimiento.
- [ ] **RNF-02 · Diseño Responsive Universal:** Interfaz 100% adaptable y fluida probada en resoluciones móviles (360px - 480px), tablets (768px - 1024px) y pantallas de escritorio/ultrawide (1200px+).
- [ ] **RNF-03 · Accesibilidad y Ergonomía (WCAG 2.1 AA):**
  - Ratio de contraste mínimo de 4.5:1 para texto normal sobre fondos oscuros.
  - Enfoque visible mediante teclado (`:focus-visible`).
  - Áreas táctiles mínimas de 44x44px.
  - Jerarquía semántica HTML5 estricta (`header`, `main`, `section`, `article`, `footer`, `h1`-`h3`).
- [ ] **RNF-04 · Agent Readiness Web:** Archivos estáticos en raíz/public (`robots.txt` y `llms.txt`) para navegación estructurada de agentes IA y robots sin consumir recursos excesivos.

---

## 🏗️ 4. Propuesta de Solución Técnica (Resumen)

- **Enfoque:** Arquitectura Single-Page estática pura construida con **Vite + TypeScript + CSS3 Moderno** (variables CSS basadas en el sistema de diseño de tokens). Despliegue estático sin servidor de backend.
- **Aislamiento Modular:** El catálogo reside en `src/common/` y el directorio `src/games/` queda preparado como espacio modular aislado para que cada juego futuro contenga su propio ciclo de vida, canvas y tipos sin colisiones.
- **Sistema de Diseño:** Definido formalmente en `docs/DESIGN.md` mediante tokens de diseño para tema oscuro: fondos carbón (`#0f1115`, `#161920`, `#1f242d`) y acentos tecnológicos en verde turquesa (`#00f59b`, `#00d287`, `#00b8a9`).

### 4.1. Agent Readiness Checklist (Proyectos Web)
- [x] **robots.txt**: Configurar en `public/robots.txt` directivas limpias `Content-Signal: ai-train=no, search=yes, ai-input=yes`.
- [x] **llms.txt**: Crear en `public/llms.txt` la descripción semántica del catálogo arcade y su arquitectura en Markdown.

---

## 🚫 5. Fuera de Alcance (Out of Scope)

*Límites estrictos para blindar la entrega frente a "scope creep":*

- ❌ **No implementación de lógica jugable ni canvas interactivo** para ninguno de los 5 juegos en esta Fase 1.
- ❌ **No backend, APIs ni bases de datos** (ni Node, ni Python, ni SQLite, ni PostgreSQL).
- ❌ **No persistencia de datos, ni cuentas de usuario, ni autenticación, ni perfiles.**
- ❌ **No sistema de rankings, puntuaciones altas (high scores) ni multijugador.**
- ❌ **No modificaciones ni enlaces acoplados con el repositorio de la web principal de GuacamoleGH.**
- ❌ **No alteración de infraestructura homelab** (Docker, túneles Cloudflare, DNS o proxies inversos).

---

## ⚠️ 6. Riesgos y Mitigación

- **Riesgo 1 (Acoplamiento prematuro entre juegos y catálogo):** Si la UI del catálogo se mezcla con la lógica de los juegos, añadir futuros juegos será costoso y propenso a regresiones.
  - *Mitigación:* Se define una interfaz de datos estricta (`GameMetadata`) en `src/common/types/game.ts` y una carpeta aislada `src/games/<juego>/` reservada para cada desarrollo individual futuro.
- **Riesgo 2 (Inconsistencia visual con la estética de GuacamoleGH):** Variaciones en tonos o contrastes débiles.
  - *Mitigación:* Especificación exhaustiva de tokens en `docs/DESIGN.md` con paleta carbón y verde/turquesa y contraste verificado WCAG AA.
- **Riesgo 3 (Deuda técnica por sobreingeniería):** Incluir frameworks de estado masivos o librerías innecesarias.
  - *Mitigación:* Cero dependencias en runtime; solo Vite y TypeScript para compilación estática limpia.

---

## ❓ 7. Preguntas Abiertas y Decisiones Pendientes

1. **Stack de Desarrollo:** ¿Apruebas el uso de **Vite + TypeScript + CSS Moderno** (con variables nativas), o prefieres **Vanilla HTML/CSS/JS puro sin bundler**, o incorporar **Tailwind CSS**? (Recomendamos Vite + TypeScript + CSS Moderno por robustez de tipado para los futuros bucles de juegos en canvas).
2. **Estrategia de Inicialización Git:** Dado que la carpeta del workspace está vacía y no tiene repositorio inicializado, ¿confirmas la ejecución de `git init`, configuración de `.gitignore` y commit inicial tras aprobar esta fase?
3. **Logotipo / Isotipo:** ¿Dispones de un SVG o activo gráfico oficial del logo de GuacamoleGH, o diseñamos en código un isotipo minimalista representativo (por ejemplo, un aguacate pixel-art o un monograma "GH" geométrico en verde turquesa)?

---

## 🧪 8. Criterios de Evaluación y Calidad

- **Verificación de Enlaces e Interacción:** Ausencia total de enlaces rotos o acciones fallidas.
- **Verificación Responsive:** Visualización impecable en 360px, 768px, 1024px y 1440px.
- **Conformidad de Tokens:** Todos los colores y espaciados derivan de `docs/DESIGN.md`.
