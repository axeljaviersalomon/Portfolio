# Portfolio Freelance — Landing Page

Landing page one-page para mostrar portfolio de proyectos freelance y captar
solicitudes de presupuesto para desarrollo web. Construida con **HTML, CSS y
JavaScript puro** (sin frameworks ni build tools).

## 📂 Estructura del proyecto

```
portfolio-landing/
├── index.html              → Estructura y contenido de la página
├── README.md                → Este archivo
└── assets/
    ├── css/
    │   └── styles.css       → Todos los estilos (mobile-first)
    ├── js/
    │   └── script.js        → Toda la interactividad
    └── img/                 → Poné acá tus imágenes reales de proyectos
```

## 🚀 Cómo usarlo

No necesita instalación ni servidor: es HTML/CSS/JS estático.

1. Descomprimí la carpeta donde quieras.
2. Abrí `index.html` directamente en el navegador (doble clic), o
3. Si preferís verlo con un servidor local (recomendado para evitar
   restricciones del navegador con rutas relativas):
   ```bash
   # Con Python instalado
   cd portfolio-landing
   python3 -m http.server 8000
   # Luego abrí http://localhost:8000
   ```
   ```bash
   # O con la extensión "Live Server" de VS Code
   ```

## ✏️ Qué personalizar antes de publicar

| Qué | Dónde | Línea de referencia |
|---|---|---|
| Número de WhatsApp | `index.html` | buscar `wa.me/5491100000000` |
| Nombre / marca | `index.html` | buscar `dev<span class="text-accent">.</span>` |
| Email y teléfono de contacto | `index.html`, sección `<footer>` | buscar `hola@tudominio.com` |
| Proyectos del portfolio | `index.html`, sección `#portfolio` | reemplazar emojis por `<img>` reales en `assets/img/` |
| Testimonios | `index.html`, sección `.testimonios` | reemplazar textos y nombres |
| Color de acento | `assets/css/styles.css` | variables `--accent`, `--accent-hot` en `:root` |
| Envío real del formulario | `assets/js/script.js` | dentro del listener de `#contactForm` (hay un comentario indicando dónde integrar backend/EmailJS/Sheets) |

## 🎨 Stack y decisiones técnicas

- **Mobile-first**: todo el CSS parte de la versión mobile y escala hacia
  arriba con `min-width` media queries (768px tablet, 1024px desktop).
- **Sin dependencias de build**: no requiere Node, npm ni bundlers.
- **Única dependencia externa**: la tipografía Manrope vía Google Fonts
  (se puede quitar si necesitás que funcione 100% offline).
- **Canvas nativo** para la animación de partículas del hero (sin librerías).
- **IntersectionObserver** para animaciones de scroll y contador de
  estadísticas (rendimiento nativo, sin listeners de scroll pesados).

## 📱 Compatibilidad

Probado visualmente en las últimas versiones de Chrome, Firefox, Safari y
Edge. Usa `prefers-reduced-motion` para respetar configuraciones de
accesibilidad del sistema operativo del usuario.
