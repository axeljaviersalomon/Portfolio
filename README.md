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

| Qué | Estado | Dónde |
|---|---|---|
| Número de WhatsApp del botón flotante | ⚠️ Pendiente — poné tu número real | `index.html`, buscar `wa.me/5491100000000` |
| Email de contacto | ⚠️ Pendiente — hay un comentario `<!-- TODO -->` | `index.html`, sección `<footer>` |
| Teléfono de contacto | ⚠️ Pendiente — hay un comentario `<!-- TODO -->` | `index.html`, sección `<footer>` |
| Estadísticas del hero (proyectos/clientes/años) | ⚠️ Puse valores estimados según tus 11 proyectos — ajustalos si hace falta | `index.html`, buscar `data-count` |
| Nombre / marca | ✅ Ya actualizado a "Axel Salomon" | `index.html` |
| Proyectos del portfolio | ✅ Ya cargados con tus 11 proyectos reales, imágenes y links | `index.html`, sección `#portfolio` |
| Testimonios | ⚠️ Siguen siendo de ejemplo — reemplazalos por reseñas reales de tus clientes (tenés reseñas de Google reales en Studio Boutique y Hotel Setos que podrías citar) | `index.html`, sección `.testimonios` |
| Color de acento | Editable si querés otro tono | `assets/css/styles.css`, variables `--accent`, `--accent-hot` en `:root` |
| Envío real del formulario | Sigue en modo demo (solo `console.log`) | `assets/js/script.js`, dentro del listener de `#contactForm` |

### 📌 Sobre el portfolio actual

Los 11 proyectos ya están cargados con su imagen (logo real tomado de cada sitio), categoría, descripción y link "Ver sitio en vivo":

- **Hotelería (dominio propio)**: Hotel Restaurante Setos, Hotel La Estrella de Castillejo
- **Salud**: Centro Médico AC Boutique, Studio Boutique
- **Coaching & Eventos**: Quantum, Conecta con tu Propósito, Viví en Propósito, Contexto Nexo
- **Negocios**: Grupo Roma Real Estate, Tao Trading Academy
- **Bienestar**: Chiron Planet Enterprise

Las imágenes se cargan directo desde la URL del sitio original (`hotinlink`), así que no ocupan espacio en `assets/img/` — si preferís tenerlas como copia local (recomendado para no depender de que esos sitios seguros online), descargalas y actualizá los `src` en `index.html` para que apunten a `assets/img/nombre-proyecto.png`.

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
