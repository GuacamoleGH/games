// =============================================================================
// GuacamoleGH Games — Catálogo web de juegos arcade clásicos para navegador
// Copyright (c) 2026 GuacamoleGH
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

/**
 * @fileoverview Componente de Pie de Página (Footer) con créditos y metadatos del proyecto.
 * @spec REQ-06
 */

/**
 * Renderiza el HTML semántico del pie de página.
 * @spec REQ-06
 * @returns Cadena HTML del componente Footer.
 */
export function renderFooter(): string {
  const currentYear = new Date().getFullYear();

  const html = `
    <footer class="site-footer" role="contentinfo">
      <div class="container footer-inner">
        <div class="footer-brand">
          <strong>GuacamoleGH Games</strong> &copy; ${currentYear} &middot; Proyecto personal de homelab
        </div>
        <div class="footer-links">
          <a 
            href="https://github.com/GuacamoleGH/games" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="footer-link"
            aria-label="Repositorio de GuacamoleGH Games en GitHub"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
            </svg>
            <span>GitHub</span>
          </a>
          <span class="footer-sdd-tag">SDD con dbv-specs-ops</span>
        </div>
      </div>
    </footer>
  `;
  return html;
}
