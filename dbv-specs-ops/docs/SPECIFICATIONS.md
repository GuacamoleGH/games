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

### Requisitos Funcionales (RF) — Fase 1 (Catálogo)

- [x] **REQ-01 · Cabecera de Marca (Header):** La página debe contar con una cabecera minimalista que incluya el nombre de la web "GuacamoleGH Games" acompañado de un identificador visual o isotipo representativo, accesible y alineado a la identidad de GuacamoleGH.
- [x] **REQ-02 · Sección Hero / Introducción:** Debe presentar una sección introductoria destacada que comunique claramente el propósito del sitio: una colección curada de juegos arcade clásicos para disfrutar directamente en el navegador.
- [x] **REQ-03 · Catálogo Visual de Juegos (Grid):** Debe presentar una cuadrícula responsive y equilibrada que contenga exactamente las tarjetas para los 5 juegos arcade planificados:
  1. **Snake** (La clásica serpiente que crece al alimentarse evitando muros y a sí misma).
  2. **Pong** (El legendario duelo de palas y pelota en dos dimensiones).
  3. **Tetris** (El puzzle icónico de apilar y encajar tetrominós).
  4. **Breakout** (El clásico desafío de demoler ladrillos con bola y paleta).
  5. **Tres en raya** (El duelo táctico de turnos 3x3).
- [x] **REQ-04 · Tarjeta de Juego (GameCard):** Cada tarjeta debe estructurarse limpiamente mostrando:
  - Icono o elemento visual distintivo del juego en estética arcade/minimalista.
  - Título oficial del juego.
  - Breve descripción del concepto o mecánica (1-2 frases).
  - Insignia o badge con el estado correspondiente.
- [x] **REQ-05 · Estado Seguro y Transición Interactiva:** Las tarjetas inactivas deben ser informativas sin enlaces rotos ni botones ficticios. Los juegos implementados (como Snake) ofrecen un botón directo y accesible de "Jugar".
- [x] **REQ-06 · Pie de Página (Footer):** Pie de página sobrio que incluya créditos del proyecto GuacamoleGH, mención al homelab, año y enlace al repositorio de código fuente.

### Requisitos Funcionales (RF) — Fase 2 (Juego Snake)

- [x] **REQ-07 · Módulo Aislado de Snake:** El juego debe residir exclusivamente en `src/games/snake/`, encapsulando toda su lógica, ciclo de renderizado en Canvas y vistas, sin dependencias cruzadas con otros juegos.
- [x] **REQ-08 · Motor de Lógica Snake (SnakeEngine):** Modelo desacoplado del DOM que gestione: cuadrícula de 20x20 celdas, longitud inicial de 3 segmentos, avance discreto por intervalos temporales (ticks), generación aleatoria de comida sin solapamiento con el cuerpo, y crecimiento (+1 segmento) al comer comida.
- [x] **REQ-09 · Sistema de Colisiones y Puntuación:** Detección estricta de colisión contra los bordes de la cuadrícula (muros) y autocolisión contra cualquier segmento del cuerpo de la serpiente, derivando en Game Over. Puntuación acumulativa (+10 puntos por comida) y aceleración sutil progresiva.
- [x] **REQ-10 · Renderizado en Canvas HTML5 Fluido:** Renderizado en elemento `<canvas>` adaptativo a 60 FPS con sincronización `requestAnimationFrame`, diseño retro-futurista consistente con `DESIGN.md` (fondo carbón, cuerpo verde neón `#00f59b`, cabeza orientada y comida en turquesa `#00d9c4` con resplandor sutil).
- [x] **REQ-11 · Controles Multiplataforma (Teclado y Táctil):** Soporte para teclas de dirección (Flechas y WASD) con filtro anti-reversión de 180° por tick. Controles táctiles virtuales (D-pad en pantalla) visibles y accesibles para dispositivos móviles y tablets.
- [x] **REQ-12 · Estados de Juego y Récord Local:** Ciclo de vida con estados: Inicio (Ready), En Juego (Playing), Pausa (Paused mediante tecla P o botón) y Fin de Juego (Game Over con botón de reinicio inmediato). Persistencia de récord de puntuación máxima (*High Score*) en `localStorage`.
- [x] **REQ-13 · Integración y Navegación de Juego en el Catálogo:** La tarjeta de Snake en el catálogo principal pasa a estado `"Disponible"` con un botón activo de `"Jugar"`. Al activarlo, se transiciona fluidamente a la vista de juego de Snake sin recargar la página, y la interfaz del juego incluye un botón accesible *"Volver al catálogo"* para regresar a la vista principal.

### Requisitos Funcionales (RF) — Fase 3 (Juego Pong)

- [x] **REQ-14 · Módulo Aislado de Pong:** El juego debe residir exclusivamente en `src/games/pong/`, encapsulando toda su física 2D, IA del rival, ciclo de renderizado en Canvas y vistas, sin dependencias cruzadas con el catálogo ni con Snake.
- [x] **REQ-15 · Motor Físico y Cinemática de Pong (PongEngine):** Espacio virtual normalizado (800x500), palas con restricción dentro del área de juego, bola con velocidad vectorial continua `(vx, vy)`, rebote especular en límites superior e inferior, y rebote angular dinámico según el punto de impacto en la pala con aceleración progresiva de velocidad por intercambio.
- [x] **REQ-16 · Inteligencia Artificial del Rival (IA Autómata):** Pala derecha controlada por algoritmo con velocidad calibrada y retraso de seguimiento para permitir partidas dinámicas, justas y desafiantes sin invencibilidad artificial.
- [x] **REQ-17 · Sistema de Puntuación y Condición de Victoria:** Detección de tanto al rebasar la pala del oponente, reseteo de saque centrado hacia el anotador, y victoria al primero en alcanzar 5 puntos con pantalla de resultado (Victoria/Derrota).
- [x] **REQ-18 · Renderizado en Canvas HTML5 Retro-Futurista:** Renderizado a 60 FPS con sincronización `requestAnimationFrame`, línea de red central punteada, pala del jugador en verde aguacate neón (`#00f59b`), pala rival en turquesa digital (`#00d9c4`), bola brillante y marcadores digitales.
- [x] **REQ-19 · Controles Multiplataforma para Pong:** Soporte para control de pala mediante teclado (teclas W/S y Flechas Arriba/Abajo), seguimiento opcional por cursor de ratón, y controles táctiles verticales (deslizamiento/botones) para móviles y tablets.
- [x] **REQ-20 · Integración de Pong en el Catálogo y Enrutador SPA:** La tarjeta de Pong en el catálogo principal pasa a estado `"Disponible"` con botón interactivo de `"Jugar"`, enrutamiento mediante hash `#pong` y botón accesible *"Volver al Catálogo"*.

### Requisitos Funcionales (RF) — Fase 4 (Juego Tetris)

- [x] **REQ-21 · Módulo Aislado de Tetris:** El juego debe residir exclusivamente en `src/games/tetris/`, encapsulando toda su matriz de juego, rotaciones, renderizado en Canvas y vistas, sin dependencias cruzadas con el catálogo ni con otros juegos.
- [x] **REQ-22 · Motor de Cuadrícula y Tetrominós (TetrisEngine):** Matriz estándar de 10 columnas por 20 filas, generación aleatoria de los 7 tetrominós oficiales (I, O, T, S, Z, J, L) con matrices de rotación de 4 estados y control estricto de colisiones con los límites laterales e inferiores y con piezas ya fijadas.
- [x] **REQ-23 · Detección de Líneas y Puntuación por Niveles:** Detección automática de líneas horizontales completas, colapso de filas superiores, cálculo de puntuación clásica (1, 2, 3 o 4 líneas/Tetris) y aceleración progresiva de caída según el nivel actual.
- [x] **REQ-24 · Proyección de Caída (Ghost Piece) y Siguiente Pieza:** Cálculo en tiempo real de la posición de impacto proyectada (Ghost Piece) para máxima precisión de juego, y previsualización de la siguiente pieza en el panel lateral del HUD.
- [x] **REQ-25 · Renderizado en Canvas HTML5 Tecnológico:** Renderizado a 60 FPS con diseño oscuro carbón, tetrominós con acabado neón y bordes biselados suaves, HUD con nivel, líneas, puntuación actual y récord persistido en `localStorage`.
- [x] **REQ-26 · Controles Multiplataforma para Tetris:** Soporte de teclado (Flechas/WASD, Espacio para Hard Drop, rotación con Flecha Arriba o W) y controles virtuales táctiles en pantalla para móviles/tablets (movimiento lateral, rotar, soft drop y hard drop).
- [x] **REQ-27 · Integración de Tetris en el Catálogo y Enrutador SPA:** La tarjeta de Tetris en el catálogo principal pasa a estado `"Disponible"` con botón interactivo de `"Jugar"`, enrutamiento mediante hash `#tetris` y botón accesible *"Volver al Catálogo"*.

### Requisitos Funcionales (RF) — Fase 5 (Juego Breakout)

- [x] **REQ-28 · Módulo Aislado de Breakout:** El juego debe residir exclusivamente en `src/games/breakout/`, encapsulando toda su cinemática 2D, detección de colisiones, gestión de vidas, renderizado en Canvas y vistas, sin dependencias cruzadas con el catálogo ni con otros juegos.
- [x] **REQ-29 · Motor Físico y Cinemática de Breakout (BreakoutEngine):** Espacio virtual normalizado (800x600), paleta inferior horizontal con restricción en límites, bola esférica con velocidad vectorial continua `(vx, vy)`, rebote especular en techo y laterales, y zona de pérdida inferior que resta una vida con relanzamiento centrado.
- [x] **REQ-30 · Rebote Angular Dinámico en la Paleta:** El vector de reflexión al impactar con la paleta depende de la posición relativa del contacto (ángulo variable de -60° a +60° respecto a la normal), incrementando gradualmente la velocidad de la bola para intensificar el reto.
- [x] **REQ-31 · Matriz de Ladrillos Multicapa y Puntuación:** Disposición en filas con colores diferenciados según tokens de diseño (filas superiores de mayor puntuación y resistencia), detección precisa de colisión AABB bola-ladrillo con inversión del eje correspondiente y destrucción del ladrillo impactado.
- [x] **REQ-32 · Vidas, Condición de Victoria y Récord Persistido:** 3 vidas por intento, contador de vidas y puntuación en HUD, detección automática de victoria al destruir todos los ladrillos o derrota al perder las 3 vidas, y persistencia del récord máximo en `localStorage`.
- [x] **REQ-33 · Renderizado en Canvas HTML5 Tecnológico:** Renderizado a 60 FPS mediante `requestAnimationFrame` con diseño oscuro carbón, ladrillos brillantes con acentos verde aguacate, turquesa digital, ámbar y fucsia neón, y controles universales (teclado Flechas/AD, cursor de ratón continuo y botones táctiles o arrastre en móviles).
- [x] **REQ-34 · Integración de Breakout en el Catálogo y Enrutador SPA:** La tarjeta de Breakout en el catálogo principal pasa a estado `"Disponible"` con botón interactivo de `"Jugar"`, enrutamiento mediante hash `#breakout` y botón accesible *"Volver al Catálogo"*.

### Requisitos Funcionales (RF) — Fase 6 (Juego Tres en Raya)

- [x] **REQ-35 · Módulo Aislado de Tres en Raya:** El juego debe residir exclusivamente en `src/games/tic-tac-toe/`, encapsulando toda su lógica de cuadrícula 3x3, IA rival, vistas y estilos, sin dependencias cruzadas con el catálogo ni con otros juegos.
- [x] **REQ-36 · Motor Lógico de Tablero y Turnos (TicTacToeEngine):** Matriz de 3x3 celdas, alternancia estricta de turnos (Jugador 'X' vs IA 'O'), verificación automática de combinaciones ganadoras (3 horizontales, 3 verticales, 2 diagonales) y detección de empate al completarse las 9 celdas.
- [x] **REQ-37 · Inteligencia Artificial del Rival (Minimax y Dificultad):** Algoritmo Minimax para jugadas estratégicas óptimas, con selector de dificultad (Fácil con probabilidad de error vs Imbatible con Minimax perfecto) para partidas adaptadas a cualquier nivel de jugador.
- [x] **REQ-38 · Marcador de Partidas y Persistencia:** Registro y cómputo en tiempo real de partidas ganadas por el Jugador, empates y victorias de la IA, con persistencia opcional del historial de tanteo en `localStorage`.
- [x] **REQ-39 · Renderizado e Interfaz de Usuario Accesible y Táctil:** Cuadrícula interactiva accesible (foco por teclado `:focus-visible` con navegación por flechas y selección con Espacio/Enter), resaltado visual de la línea ganadora, y estética oscura carbón con 'X' en verde aguacate neón (`#00f59b`) y 'O' en turquesa digital (`#00d9c4`).
- [x] **REQ-40 · Integración de Tres en Raya en el Catálogo y Enrutador SPA:** La tarjeta de Tres en Raya en el catálogo principal pasa a estado `"Disponible"` con botón interactivo de `"Jugar"`, enrutamiento mediante hash `#tic-tac-toe` y botón accesible *"Volver al Catálogo"*, completando el 100% de los 5 juegos jugables en la web.

### Requisitos Funcionales (RF) — Sistema de Audio Arcade

- [x] **REQ-41 · Sistema de Efectos de Sonido Sintetizados (Web Audio API):** Generación de audio 100% sintetizado en tiempo real sin archivos de audio externos (cero descargas de red, ultra-ligero < 3KB), mediante osciladores nativos de la Web Audio API (ondas cuadradas/triangulares y envolventes de ganancia) para reproducir efectos retro arcade en todos los juegos (comer en Snake, rebotes en Pong, rotaciones y líneas en Tetris, impactos en Breakout, marcas en Tres en raya, clics, victorias y derrotas). Incluye botón accesible de silenciar/activar sonido (🔊 / 🔇) con persistencia en `localStorage` y activación automática ante la primera interacción del usuario.

### Requisitos Funcionales (RF) — Ajustes y Dificultad Dinámica

- [x] **REQ-42 · Selector de Dificultad Dinámico (Fácil, Normal, Difícil, Extremo) y Calibración de Breakout:** Selector interactivo de 4 niveles de dificultad (`Fácil`, `Normal`, `Difícil`, `Extremo`) con persistencia en `localStorage` y modulación inmediata en caliente del vector de velocidad física en Snake (180ms/130ms/80ms/45ms), Pong (260/400/600/850 px/s) y Breakout (3.0/4.5/6.5/9.5 px/tick con paleta a 7.0/8.5/10.5/13.5). Ampliación de la matriz de Breakout a 7 filas x 10 columnas (70 ladrillos con degradado arcoíris retro neón de 7 niveles).

### Requisitos Funcionales (RF) — Fase 7 (Juego Space Invaders)

- [x] **REQ-43 · Módulo Aislado de Space Invaders:** El juego debe residir exclusivamente en `src/games/space-invaders/`, encapsulando toda su cinemática 2D, lógica de invasores, proyectiles, búnkeres/escudos, vistas Canvas y estilos, sin dependencias cruzadas con otros juegos.
- [x] **REQ-44 · Motor de Física y Lógica Pura (SpaceInvadersEngine):** Cañón defensor del jugador (movimiento horizontal limitado por bordes y disparo láser), formación de invasores alienígenas en 5 filas x 11 columnas con marcha oscilante y descenso progresivo al tocar los bordes, aceleración de marcha según el número de invasores vivos, proyectiles aleatorios de alienígenas, 4 búnkeres defensivos con degradación progresiva de daño, puntuación por tipo de alien, nave nodriza UFO misteriosa y detección de derrota por pérdida de vidas o invasión en tierra.
- [x] **REQ-45 · Selector de Dificultad Dinámico de 4 Niveles (Fácil, Normal, Difícil, Extremo):** Modulación de velocidad de los invasores, cadencia de fuego enemigo y velocidad del proyectil del jugador, con persistencia en `localStorage`.
- [x] **REQ-46 · Renderizado Canvas HTML5 y Controles Accesibles:** Lienzo Canvas a 60Hz con sprites vectoriales pixel-art retro neón (invasores con animación de dos pasos, cañón verde neón, partículas de impacto), controles por teclado (flechas / A-D, espacio para disparo, P para pausa) y controles táctiles virtuales para móviles (< 900px) con ocultación automática en escritorio.
- [x] **REQ-47 · Integración de Efectos de Sonido Sintetizados (Web Audio API):** Generación en tiempo real de sonidos de disparo láser, marcha rítmica alienígena, explosión de invasor, impacto en escudo y victoria/derrota mediante osciladores Web Audio API sin ficheros externos.
- [x] **REQ-48 · Integración de Space Invaders en el Catálogo y Enrutador SPA:** Añadir Space Invaders como 6to juego oficial en `src/common/data/games.data.ts`, actualización de contador a 6 títulos, tarjeta con estado `"Disponible"`, botón interactivo *"Jugar Ahora →"*, enrutamiento cliente `#space-invaders` y botón accesible *"Volver al Catálogo"*.

### Requisitos Funcionales (RF) — Fase 8 (Juego Pac-Man)

- [x] **REQ-49 · Módulo Aislado de Pac-Man:** El juego debe residir exclusivamente en `src/games/pacman/`, encapsulando toda su lógica de laberinto, entidades, renderizado en Canvas y vistas, sin dependencias cruzadas con otros juegos.
- [x] **REQ-50 · Motor Lógico y Laberinto de Pac-Man (PacmanEngine):** Modelo de laberinto en cuadrícula con caminos transitables, muros y túnel de transporte lateral. Pac-Man con avance continuo y búfer de dirección. Generación de puntos (pellets, +10 pts) y píldoras de energía (energizers, +50 pts). 4 fantasmas (Blinky, Pinky, Inky, Clyde) con ciclo de estados: persecución, dispersión y asustado (vulnerables durante tiempo calibrado, +200/400/800/1600 pts acumulativos). Gestión de 3 vidas, condición de victoria al consumir todos los puntos, y récord persistido.
- [x] **REQ-51 · Renderizado Canvas HTML5 y Controles para Pac-Man:** Renderizado retro-neón a 60 FPS con sincronización `requestAnimationFrame`, animación de apertura y cierre de boca de Pac-Man según dirección, sprites vectoriales de fantasmas con ojos orientados y parpadeo al expirar el modo asustado. Soporte de teclado (Flechas y WASD) y controles táctiles virtuales (D-pad en pantalla) para móviles.
- [x] **REQ-52 · Integración de Pac-Man en el Catálogo y Enrutador SPA:** La tarjeta de Pac-Man en el catálogo principal pasa a estado `"Disponible"` con botón interactivo de `"Jugar"`, enrutamiento mediante hash `#pacman` y botón accesible *"Volver al Catálogo"*.

### Requisitos Funcionales (RF) — Fase 9 (Juego Asteroids)

- [x] **REQ-53 · Módulo Aislado de Asteroids:** El juego debe residir exclusivamente en `src/games/asteroids/`, encapsulando toda su cinemática 2D espacial, división de asteroides, proyectiles, Canvas y vistas, sin dependencias cruzadas con otros juegos.
- [x] **REQ-54 · Motor Físico Vectorial 2D de Asteroids (AsteroidsEngine):** Espacio continuo (800x600) con física inercial pura: nave con orientación angular, aceleración por empuje con estela de partículas, arrastre/rozamiento suave por vacío, y envolvente toroidal en los 4 bordes (wrap-around de coordenadas). Disparo de proyectiles láser con alcance y cadencia calibrada. Asteroides poligonales en 3 tamaños (Grande, Mediano, Pequeño) que se fragmentan al recibir impacto (+20, +50, +100 pts). 3 vidas, oleadas consecutivas y récord persistido en `localStorage`.
- [x] **REQ-55 · Renderizado Canvas Vectorial y Controles para Asteroids:** Renderizado vectorial retro-arcade en verde aguacate neón (`#00f59b`) y turquesa digital (`#00d9c4`) con partículas de propulsión y explosiones. Controles por teclado (Flechas/WASD, Espacio para disparar) y controles táctiles en pantalla para móviles (Girar Izquierda/Derecha, Empuje, Disparo).
- [x] **REQ-56 · Integración de Asteroids en el Catálogo y Enrutador SPA:** La tarjeta de Asteroids en el catálogo principal pasa a estado `"Disponible"` con botón interactivo de `"Jugar"`, enrutamiento mediante hash `#asteroids` y botón accesible *"Volver al Catálogo"*.

### Requisitos Funcionales (RF) — Fase 10 (Juego Blackjack)

- [x] **REQ-57 · Módulo Aislado de Blackjack:** El juego debe residir exclusivamente en `src/games/blackjack/`, encapsulando toda su lógica de baraja de naipes, reglas de juego, IA del crupier, vistas y estilos, sin dependencias cruzadas con otros juegos.
- [x] **REQ-58 · Motor de Lógica y Reglas de Blackjack (BlackjackEngine):** Mazo estándar de 52 cartas con barajado determinista/aleatorio. Cómputo óptimo del valor de la mano considerando As como 1 u 11 puntos según convenga. Acciones completas del jugador: Pedir Carta (Hit), Plantarse (Stand), Doblar Apuesta (Double Down) y Nueva Ronda (Deal). IA del crupier siguiendo la regla de la casa (pedir con 16 o menos, plantarse en 17+). Pagos oficiales (Blackjack natural 3:2, victoria estándar 1:1, empate o Push que devuelve la apuesta). Gestión de saldo de fichas, selector de apuestas y recarga automática si se agotan las fichas.
- [x] **REQ-59 · Interfaz Visual Accesible y Controles para Blackjack:** Tablero interactivo con estética de paño de mesa carbón/neón, naipes vectoriales estilizados con palos de alta visibilidad, panel de control con botones ergonómicos (área táctil >= 44px) y feedback auditivo para reparto, victorias, derrotas y empates.
- [x] **REQ-60 · Integración de Blackjack en el Catálogo y Enrutador SPA:** La tarjeta de Blackjack en el catálogo principal pasa a estado `"Disponible"` con botón interactivo de `"Jugar"`, enrutamiento mediante hash `#blackjack` y botón accesible *"Volver al Catálogo"*, completando los 9 juegos del catálogo.

### Requisitos No Funcionales (RNF)

- [x] **RNF-01 · Rendimiento y Ligereza:** Carga instantánea con footprint inicial reducido (bundle compilado < 150KB sin assets pesados), score objetivo de 100/100 en Lighthouse de rendimiento.
- [x] **RNF-02 · Diseño Responsive Universal:** Interfaz 100% adaptable y fluida probada en resoluciones móviles (360px - 480px), tablets (768px - 1024px) y pantallas de escritorio/ultrawide (1200px+).
- [x] **RNF-03 · Accesibilidad y Ergonomía (WCAG 2.1 AA):**
  - Ratio de contraste mínimo de 4.5:1 para texto normal sobre fondos oscuros.
  - Enfoque visible mediante teclado (`:focus-visible`).
  - Áreas táctiles mínimas de 44x44px.
  - Jerarquía semántica HTML5 estricta (`header`, `main`, `section`, `article`, `footer`, `h1`-`h3`).
- [x] **RNF-04 · Agent Readiness Web:** Archivos estáticos en raíz/public (`robots.txt` y `llms.txt`) para navegación estructurada de agentes IA y robots sin consumir recursos excesivos.

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
