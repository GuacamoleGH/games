# 🎨 Sistema de Diseño: GuacamoleGH Games

> **Fase:** `/spec` (Especificación Visual)
> **Estado:** Validado
> **Última Revisión:** 2026-11-01
> **Aplica a:** Web de catálogo GuacamoleGH Games y futuros módulos de juegos.

---

> 📐 Inspirado en el estándar **[design.md](https://github.com/google-labs-code/design.md)** de Google Labs — formato estructurado para describir identidades visuales a agentes de codificación.

---

```yaml
# ────────────────────────────────────────────────
# DESIGN TOKENS — Legibles por la IA y por máquina
# ────────────────────────────────────────────────
version: 1.0.0
name: "GuacamoleGH Games Design System"
description: "Estética tecnológica, minimalista y arcade para el homelab GuacamoleGH. Tema oscuro dominante en tonos carbón con acentos vibrantes verde aguacate y turquesa digital."

# PALETA DE COLORES (Tema Oscuro por defecto)
colors:
  # Fondos y Superficies (Gama Carbón)
  background-deep:    "#0c0e12"   # Fondo base más profundo (viewport exterior)
  background-base:    "#12151b"   # Fondo principal de la aplicación
  surface-card:       "#181d26"   # Fondo de tarjetas y componentes contenidos
  surface-card-hover: "#1f2532"   # Estado hover en tarjetas
  surface-elevated:   "#262d3d"   # Menús, modales o tooltips flotantes
  
  # Bordes y Divisores
  border-subtle:      "#222a38"   # Líneas divisorias y bordes sutiles de tarjeta
  border-highlight:   "#00f59b33" # Borde activo o con glow sutil (20% opacidad)
  border-focus:       "#00f59b"   # Borde de foco accesible
  
  # Acentos de Marca (Guacamole + Tecnología)
  accent-green:       "#00f59b"   # Verde aguacate eléctrico / Neón arcade principal
  accent-turquoise:   "#00d9c4"   # Turquesa secundario para degradados y detalles
  accent-gradient:    "linear-gradient(135deg, #00f59b 0%, #00d9c4 100%)"
  
  # Tipografía y Contenido
  text-primary:       "#f0f4f8"   # Texto principal de alto contraste (títulos, valores)
  text-secondary:     "#94a3b8"   # Texto descriptivo y secundario
  text-muted:         "#64748b"   # Metadatos, etiquetas sutiles, pie de página
  text-accent:        "#00f59b"   # Destacados y links activos
  
  # Estados y Badges
  badge-coming-soon-bg:     "#132622"  # Fondo de la insignia "Próximamente"
  badge-coming-soon-border: "#1d473b"  # Borde de la insignia
  badge-coming-soon-text:   "#34d399"  # Texto de la insignia

# TIPOGRAFÍA
typography:
  fontFamily:
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace"
  
  scale:
    h1:
      fontSize: "2.5rem"        # 40px en desktop (2rem en móvil)
      fontWeight: 700
      lineHeight: 1.15
      letterSpacing: "-0.03em"
    h2:
      fontSize: "1.75rem"       # 28px
      fontWeight: 600
      lineHeight: 1.25
      letterSpacing: "-0.02em"
    h3:
      fontSize: "1.25rem"       # 20px (Títulos de tarjeta)
      fontWeight: 600
      lineHeight: 1.3
      letterSpacing: "-0.01em"
    body:
      fontSize: "1rem"          # 16px
      fontWeight: 400
      lineHeight: 1.6
    body-sm:
      fontSize: "0.875rem"      # 14px (Descripciones de tarjetas)
      fontWeight: 400
      lineHeight: 1.5
    badge:
      fontSize: "0.75rem"       # 12px
      fontWeight: 600
      lineHeight: 1.2
      letterSpacing: "0.05em"
      textTransform: "uppercase"

# ESPACIADO Y LAYOUT
layout:
  container-max-width: "1200px"
  grid-gap: "24px"
  header-height: "72px"

spacing:
  xs:  "4px"
  sm:  "8px"
  md:  "16px"
  lg:  "24px"
  xl:  "32px"
  xxl: "48px"
  xxxl: "64px"

# RADIOS DE BORDE
radius:
  sm: "6px"
  md: "10px"
  lg: "16px"
  full: "9999px"

# SOMBRAS Y EFECTOS
effects:
  card-shadow: "0 4px 20px -2px rgba(0, 0, 0, 0.4)"
  card-hover-shadow: "0 8px 30px -4px rgba(0, 245, 155, 0.12)"
  subtle-glow: "0 0 25px -5px rgba(0, 245, 155, 0.25)"
  transition-fast: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
  transition-normal: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
```

---

## 🧩 1. Filosofía de Diseño y Principios

1. **Minimalismo Tecnológico:** Ausencia de artificios o elementos innecesarios. El contenido (los juegos) y la claridad funcional son los protagonistas.
2. **Inspiración Arcade Moderna:** Toques sutiles de la estética arcade clásica (iconografía limpia, tipografía monospace selectiva para badges, gradientes neón controlados), pero ejecutados con rigor de diseño web contemporáneo (sin estridencias ni baja legibilidad).
3. **Consistencia Homelab:** Los acentos verdes aguacate (`#00f59b`) y turquesas (`#00d9c4`) vinculan directamente la interfaz con la identidad del ecosistema GuacamoleGH, manteniendo una presencia visual armónica y profesional.
4. **Respeto a la Accesibilidad (WCAG 2.1 AA):** El contraste entre el texto y las superficies oscuras supera el umbral de 4.5:1 en todos los casos, y los estados de foco están definidos con claridad.

---

## 🖼️ 2. Especificación de Componentes Clave

### 2.1. Cabecera (Header)
- **Estructura:** Barra fija o sticky discreta (`height: 72px`) con fondo ligeramente traslúcido y desenfoque (`backdrop-filter: blur(12px); background: rgba(18, 21, 27, 0.85);`).
- **Logo / Marca:** 
  - Isotipo geométrico o badge `GH` con gradiente verde-turquesa.
  - Texto de marca: `GuacamoleGH` en `text-primary` (peso 600) + `Games` en `accent-green` (peso 700).
- **Indicador:** Badge sutil "Homelab Edition" o enlace informativo mínimo.

### 2.2. Sección Hero
- **Estructura:** Centrada y limpia con espaciado vertical generoso (`padding: 64px 24px 48px`).
- **Titular Principal (H1):** `Arcade Clásico en tu Navegador`.
- **Subtítulo:** Breve párrafo explicativo (`max-width: 650px`): *"Una colección curada de juegos arcade retro construidos para jugar al instante, ligeros y sin dependencias."*
- **Efecto visual ambiental:** Gradiente radial ambiental muy suave en el fondo detrás del Hero (`rgba(0, 245, 155, 0.05)` centrado en la parte superior), sin sobrecargar la pantalla ni consumir GPU.

### 2.3. Catálogo de Juegos (Game Grid & Cards)
- **Grid Layout:** Cuadrícula CSS automática responsive:
  - Móvil (< 640px): 1 columna.
  - Tablet (640px - 1024px): 2 columnas.
  - Desktop (> 1024px): 3 columnas (en la fila superior 3 tarjetas, en la inferior 2 centradas o cuadrícula adaptativa de 3 columnas con espaciado equilibrado).
- **Tarjeta de Juego (GameCard):**
  - **Fondo:** `surface-card` con borde sutil `border-subtle` y `border-radius: 16px`.
  - **Icono / Arte Representativo:** Cabecera de la tarjeta con ilustración minimalista/vectorial o icono SVG estilizado representativo de cada juego:
    - *Snake:* Serpiente pixel o trazado vector segmentado.
    - *Pong:* Dos paletas y pelota retro en movimiento.
    - *Tetris:* Tetrominós en ensamblaje geométrico.
    - *Breakout:* Muro de bloques y trayectoria de rebote.
    - *Tres en raya:* Cuadrícula 3x3 con marcas estilizadas X y O.
  - **Cuerpo de la Tarjeta:**
    - Título del juego (H3, `text-primary`, peso 600).
    - Descripción breve (2 líneas, `text-secondary`, tamaño 14px).
  - **Pie de la Tarjeta:**
    - Insignia o Badge **"Próximamente"** (`badge-coming-soon`): con punto indicador pulsante verde muy sutil y texto claro.
  - **Comportamiento Interactivo:**
    - Al pasar el cursor (hover en desktop): Elevación sutil (`transform: translateY(-4px)`), borde exterior con leve brillo turquesa (`border-highlight`), sin enlaces engañosos. Cursor estilo `default` (no pointer falso de botón que no hace nada).

### 2.4. Pie de Página (Footer)
- **Estructura:** Separador superior `border-subtle`, alineación centrada o en extremos con `padding: 40px 24px`.
- **Contenido:**
  - `GuacamoleGH Games · Homelab Project`
  - Enlace al repositorio GitHub (`GuacamoleGH/games`).
  - Nota de tecnología: *"Desarrollado bajo la metodología DBV Specs Ops"*.

---

## 📱 3. Puntos de Ruptura Responsive (Breakpoints)

| Dispositivo | Ancho Mínimo | Columnas Grid | Espaciado Container |
|---|---|---|---|
| **Móvil Pequeño/Medio** | `320px` - `639px` | 1 col | `16px` |
| **Tablet / Móvil Grande** | `640px` - `1023px` | 2 cols | `24px` |
| **Desktop / Laptop** | `1024px` - `1439px` | 3 cols | `32px` |
| **Pantallas Grandes** | `1440px+` | 3 cols (max `1200px`) | Auto centrado |
