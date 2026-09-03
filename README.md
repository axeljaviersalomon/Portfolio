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
└── cloudflare-worker/
    └── gemini-proxy-worker.js  → Código del proxy del asistente de IA.
                                   NO se sube a GitHub Pages — se despliega
                                   aparte en Cloudflare (ver sección abajo).
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

## 🤖 Asistente virtual con IA (Gemini) — cómo activarlo

El sitio incluye un widget de chat flotante (abajo a la izquierda, aparece a
los 5 segundos) conectado a la API gratuita de Gemini. **Por defecto viene
apagado** — si no seguís estos pasos, el chat va a avisar amablemente que
todavía no está conectado, en vez de fallar en silencio.

### ¿Por qué no viene ya conectado directamente?

Porque este sitio es estático (GitHub Pages no tiene servidor propio). Si la
clave de la API de Gemini estuviera directamente en `script.js`, cualquiera
que abra el código fuente de tu página podría copiarla y usarla como propia,
agotando tu cuota gratuita o generándote un gasto si algún día activás
facturación. Por eso la arquitectura usa un intermediario (proxy) gratuito
que guarda la clave de forma segura, lejos del código público.

### Paso 1 — Conseguir tu API key gratuita de Gemini

1. Entrá a [aistudio.google.com](https://aistudio.google.com/) con tu cuenta
   de Google.
2. Buscá la opción **"Get API key"** (o "Obtener clave de API").
3. Creá una clave nueva. Es gratis, no pide tarjeta de crédito.
4. Copiala y guardala en un lugar seguro (no la pegues todavía en ningún
   archivo del proyecto).

### Paso 2 — Desplegar el proxy en Cloudflare Workers (gratis)

1. Creá una cuenta gratis en [dash.cloudflare.com](https://dash.cloudflare.com/sign-up)
   (no pide tarjeta para el plan gratuito).
2. En el menú lateral, andá a **Workers & Pages → Create → Create Worker**.
3. Ponele un nombre (por ejemplo `axel-portfolio-ai`) y creálo.
4. Una vez creado, click en **"Edit code"** (o el botón para editar el
   código del Worker).
5. Borrá todo el código de ejemplo que trae por defecto, y pegá el
   contenido completo de `cloudflare-worker/gemini-proxy-worker.js`
   (el archivo que está en esta misma carpeta del proyecto).
6. Click en **"Deploy"** (o "Save and Deploy").
7. Andá a la pestaña **"Settings" → "Variables and Secrets"** de tu Worker.
8. Agregá una variable nueva:
   - **Nombre:** `GEMINI_API_KEY`
   - **Valor:** la clave que copiaste en el Paso 1
   - Marcá la opción de **"Encrypt"** si está disponible (la esconde incluso
     de vos mismo en el panel, por seguridad extra).
9. Guardá. Cloudflare te va a mostrar la URL pública de tu Worker, algo
   como `https://axel-portfolio-ai.tu-usuario.workers.dev`.

### Paso 3 — Conectar el widget del sitio a tu proxy

1. Abrí `assets/js/script.js`.
2. Buscá esta línea (con `Ctrl+F`):
   ```js
   const PROXY_URL = 'https://TU-WORKER.workers.dev';
   ```
3. Reemplazá esa URL por la real que te dio Cloudflare en el paso anterior.
4. Guardá, subí los cambios a GitHub (`git add . && git commit -m "Conectar asistente de IA" && git push`).

### Paso 4 — Probarlo

Entrá a tu sitio publicado, esperá 5 segundos, abrí el chat y probá
preguntarle algo como *"¿qué servicios ofrece Axel?"*. Si todo está bien
conectado, va a responder usando la información real de tu portfolio.

### Sobre los límites del plan gratuito

Gemini ofrece (a la fecha) alrededor de 1.000-1.500 consultas gratis por
día con el modelo `gemini-2.0-flash-lite` (el que usa este proyecto por
defecto, el más generoso en cuota). Para un portfolio personal es más que
suficiente. Si algún día lo superás, el asistente le va a avisar amablemente
al visitante que alcanzó el límite del día, en vez de romperse.

### Qué tan segura es esta configuración (honestidad ante todo)

- ✅ La clave de Gemini nunca está en el código de GitHub Pages — vive
  únicamente en el Worker de Cloudflare, encriptada.
- ✅ El proxy solo acepta pedidos que vengan desde tu dominio
  (`axeljaviersalomon.github.io`), gracias a la validación de CORS —
  esto bloquea que otros sitios web usen tu proxy desde su propio
  JavaScript.
- ⚠️ Esto **no es seguridad de nivel bancario**: alguien con conocimientos
  técnicos avanzados podría, en teoría, llamar directamente a la URL del
  Worker sin pasar por tu sitio (evitando la validación de CORS, ya que esa
  validación la aplica el navegador, no el servidor). Para un portfolio
  personal esto es un riesgo aceptable y estándar de la industria para
  proyectos de este tamaño — pero si en algún momento vas a manejar tráfico
  serio o datos sensibles, valdría la pena sumar autenticación adicional
  (por ejemplo, un token temporal firmado) o rate-limiting server-side con
  Cloudflare KV/Durable Objects.



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
