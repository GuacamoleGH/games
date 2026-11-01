# 🎮 GuacamoleGH Games

<div align="center">
  <img src="public/logo.png" alt="GuacamoleGH Games Logo" width="128" height="128" />
  <p><strong>Catálogo web de juegos arcade clásicos para navegador en el homelab GuacamoleGH</strong></p>
  <p>
    <img src="https://img.shields.io/badge/status-Fase%202%3A%20Snake%20Jugable-00f59b?style=flat-square" alt="Status" />
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/methodology-DBV%20Specs%20Ops%20v3.2.0-00d9c4?style=flat-square" alt="Methodology" />
  </p>
</div>

---

## 📑 Índice

- [📌 Sobre el proyecto](#about)
- [🕹️ Catálogo de Juegos](#games)
- [🛠️ Stack Tecnológico](#stack)
- [🧰 Requisitos](#requirements)
- [⚙️ Instalación y Uso](#usage)
- [📂 Estructura del Proyecto](#structure)
- [🧪 Pruebas y Calidad](#testing)
- [📄 Licencia](#license)

---

<a name="about"></a>
## 📌 Sobre el proyecto

**GuacamoleGH Games** es un catálogo web arcade moderno, minimalista y tecnológico, diseñado para explorar y jugar a títulos clásicos directamente desde el navegador dentro del homelab GuacamoleGH.

En esta **Fase 1**, el proyecto despliega la página principal del catálogo con diseño responsive, tema oscuro en tonos carbón y acentos verde/turquesa, presentando los 5 títulos previstos en estado informativo **"Próximamente"**.

El desarrollo sigue rigurosamente la metodología **Spec-Driven Development (SDD)** con el framework [dbv-specs-ops](https://github.com/davidbuenov/dbv-specs-ops).

---

<a name="games"></a>
## 🕹️ Catálogo de Juegos Planificados

| Juego | Género | Estado Actual | Fase de Implementación |
|---|---|---|---|
| **Snake** | Arcade | 🟢 **Disponible (Jugable)** | Fase 2 |
| **Pong** | Clásico | ⏳ Próximamente | Fase 3 |
| **Tetris** | Puzzle | ⏳ Próximamente | Fase 4 |
| **Breakout** | Arcade | ⏳ Próximamente | Fase 5 |
| **Tres en raya** | Estrategia | ⏳ Próximamente | Fase 6 |

Cada juego futuro se implementará de manera modular y aislada en su propio directorio dentro de `src/games/` sin acoplarse al catálogo.

---

<a name="stack"></a>
## 🛠️ Stack Tecnológico

- **Entorno y Bundler:** Vite 6.x (compilación estática ultra-ligera < 20KB).
- **Lenguaje:** TypeScript 5.x con tipado estricto (`strict: true`).
- **Estilos:** CSS3 Moderno con Custom Properties (Tokens de diseño de `docs/DESIGN.md`), CSS Grid fluido y variables temáticas.
- **Testing:** Vitest con Happy-DOM (100% trazabilidad de requisitos `@spec`).
- **Arquitectura:** Web Estática pura (sin backend, base de datos ni cuentas de usuario).

---

<a name="requirements"></a>
## 🧰 Requisitos

- **Node.js:** v20.0.0 o superior (verificado con Node v24).
- **npm:** v10.0.0 o superior.

---

<a name="usage"></a>
## ⚙️ Instalación y Uso

### 1. Clonar e instalar dependencias
```bash
git clone https://github.com/GuacamoleGH/games.git
cd games
npm install
```

### 2. Ejecutar en modo desarrollo
```bash
npm run dev
```
La aplicación se abrirá en `http://localhost:3000` con recarga en caliente instantánea (HMR).

### 3. Compilar para producción
```bash
npm run build
```
Genera los archivos estáticos en la carpeta `dist/`, listos para servirse desde cualquier servidor web HTTP o contenedor del homelab.

### 4. Vista previa local del build de producción
```bash
npm run preview
```

---

<a name="structure"></a>
## 📂 Estructura del Proyecto

```text
/
├── dbv-specs-ops/          # Especificaciones, arquitectura, memoria y backlog SDD
├── public/                 # Archivos estáticos públicos (logo, robots.txt, llms.txt)
├── src/
│   ├── common/             # Componentes, estilos y datos del catálogo
│   │   ├── components/     # Header, Hero, GameGrid, GameCard, Footer
│   │   ├── data/           # games.data.ts (Metadatos tipados de los 5 juegos)
│   │   ├── styles/         # tokens.css, reset.css, main.css
│   │   └── types/          # Interfaces TypeScript (GameMetadata, GameStatus)
│   ├── games/              # Módulos aislados reservados para futuros juegos
│   └── main.ts             # Punto de entrada de la aplicación
├── tests/                  # Suite de pruebas unitarias y de requisitos (Vitest)
├── index.html              # Entrada HTML5 semántica
├── package.json            # Dependencias y scripts del proyecto
├── tsconfig.json           # Configuración TypeScript estricta
└── vite.config.ts          # Configuración del empaquetador Vite
```

---

<a name="testing"></a>
## 🧪 Pruebas y Calidad

Para ejecutar la suite de pruebas unitarias:
```bash
npm test
```

Para verificar la trazabilidad de especificaciones y estándares con el linter de dbv-specs-ops:
```bash
python dbv-specs-ops/scripts/dbv-lint.py
```

---

<a name="license"></a>
## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

> Construido con ❤️ bajo la metodología **dbv-specs-ops** · [GitHub](https://github.com/davidbuenov/dbv-specs-ops)
