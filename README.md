# Portfolio Freelance — Axel Salomon

Landing page one-page de portfolio y captación de presupuestos para desarrollo
web freelance. Construida con **HTML, CSS y JavaScript puro** (sin frameworks
ni build tools), mobile-first, lista para publicar en GitHub Pages.

## 📂 Estructura del proyecto

```
portfolio-landing/
├── index.html              → Estructura y contenido de la página
├── README.md                → Este archivo
├── assets/
│   ├── css/
│   │   └── styles.css       → Todos los estilos (mobile-first)
│   ├── js/
│   │   └── script.js        → Toda la interactividad
│   └── img/                 → Logo, favicons e imágenes propias
```

## 🚀 Cómo verlo localmente

No necesita instalación ni servidor: es HTML/CSS/JS estático.

1. Descomprimí la carpeta donde quieras.
2. Abrí `index.html` directamente en el navegador (doble clic).

Si preferís levantarlo con un servidor local (opcional):
```bash
cd portfolio-landing
python3 -m http.server 8000
# Luego abrí http://localhost:8000
```

## ✅ Estado del proyecto

Todo el contenido ya está cargado con datos reales — no quedan placeholders
genéricos pendientes:

- **Portfolio**: 11 proyectos reales con logo, categoría, descripción y link
  (9 "Ver demo" con aviso previo de que son bocetos sin base de datos
  conectada; 2 "Ver sitio en vivo" de dominio propio en producción real).
- **Contacto**: WhatsApp, email y navegación con tus datos reales.
- **Formulario**: envía de verdad por email (ver sección siguiente).

## 📬 Formulario de contacto — FormSubmit

El formulario usa **[FormSubmit.co](https://formsubmit.co)**, un servicio
gratuito que reenvía los envíos por email sin necesitar backend propio (ideal
para GitHub Pages, que solo sirve archivos estáticos).

**⚠️ Activación única requerida:** la primera vez que alguien complete y envíe
el formulario desde el sitio ya publicado, FormSubmit te va a mandar un email
de confirmación a `axeljaviersalomon@gmail.com` con un link para activarlo.
Hasta hacer clic ahí, los envíos no llegan. **Recomendación:** apenas publiques
el sitio, mandate vos mismo un mensaje de prueba para activarlo antes de que
lo use un cliente real.

**Protección anti-spam:** el formulario incluye un campo honeypot invisible
(`_honey`). Los bots que completan formularios automáticamente suelen llenar
también los campos ocultos; si ese campo llega con contenido, el envío se
descarta en el propio navegador sin llegar a mandarse.

Si en algún momento cambiás de email, actualizá el `action` del `<form>` en
`index.html` (buscá `formsubmit.co/ajax/`).

## ✏️ Qué podés seguir ajustando

| Qué | Dónde |
|---|---|
| Color de acento (azul) | `assets/css/styles.css`, variables `--accent` / `--accent-hot` en `:root` |
| Estadísticas del hero (11+/9+/3+) | `index.html`, buscar `data-count` |
| Textos de servicios / "Sobre mí" | `index.html`, secciones `#servicios` y `#porque` |
| Orden o contenido del portfolio | `index.html`, sección `#portfolio` (cada proyecto es un bloque `<!-- Proyecto N: ... -->`) |
| Redes sociales del footer | `index.html`, `.footer-social` |

## 🎨 Decisiones técnicas

- **Mobile-first**: el CSS parte de la versión mobile y escala hacia arriba
  con `min-width` media queries (768px tablet, 1024px desktop).
- **Sin dependencias de build**: no requiere Node, npm ni bundlers.
- **Única dependencia externa**: la tipografía Manrope vía Google Fonts.
- **Canvas nativo** para la animación de partículas del hero.
- **IntersectionObserver** para animaciones de scroll y contador de
  estadísticas.
- **Luz que sigue al cursor**: activa solo en dispositivos con mouse
  (`pointer: fine`), respeta `prefers-reduced-motion`.

## 📱 Compatibilidad

Probado visualmente en las últimas versiones de Chrome, Firefox, Safari y
Edge, en mobile y desktop. Usa `prefers-reduced-motion` para respetar
configuraciones de accesibilidad del sistema operativo del usuario.

Repo: `github.com/axeljaviersalomon/Portfolio`

1. Subir el contenido de esta carpeta a la rama `main` del repo (ver comandos
   en la respuesta del chat).
2. En GitHub: **Settings → Pages → Source: rama `main`, carpeta `/ (root)` → Save**.
3. Esperar 1-2 minutos. El sitio queda en:
   `https://axeljaviersalomon.github.io/Portfolio/`

### ⚠️ Si después de un push el sitio se ve "roto" o sin estilos

Es casi siempre **caché vieja**, no un bug real: el navegador (o la CDN de
GitHub) sigue sirviendo una versión anterior de `styles.css` o `script.js`
mientras ya cargó el `index.html` nuevo, generando una mezcla rara.

**Cómo confirmarlo:** abrí el sitio en una ventana de incógnito. Si ahí se ve
bien, era caché.

**Solución permanente ya aplicada:** los `<link>` y `<script>` del CSS/JS
tienen un parámetro `?v=2` al final de la URL. Cada vez que hagas un cambio
en `styles.css` o `script.js` y lo subas, **subí también ese número** (`?v=3`,
`?v=4`, etc.) en `index.html` — así el navegador siempre los trata como
archivos nuevos y nunca sirve una versión vieja cacheada.
