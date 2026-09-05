/* ---------- Fix: header/layout "corridos" hacia arriba al entrar directo (iOS) ---------- */
/* Mismo bug conocido de Safari/Chrome en iOS que se corrigió en
   portfolio-animado.js: al abrir la URL directo (no por link interno), a
   veces el header "position:fixed" se dibuja contra el viewport ampliado
   que aún contempla la barra de direcciones sin colapsar, y todo el layout
   se ve corrido hacia arriba hasta el primer scroll (que lo "acomoda"
   solo). Un scroll simulado solo resultó insuficiente en la práctica, así
   que se combina con un "forzado de reflow" directo sobre el header
   (display:none → reflow → display original), que obliga a repintarlo
   desde cero en la posición correcta. */
if(window.matchMedia('(pointer: coarse)').matches){
    const fixIOSLayoutOffset = () => {
        const header = document.querySelector('header');
        if(header){
            const previousDisplay = header.style.display;
            header.style.display = 'none';
            void header.offsetHeight; // fuerza el reflow
            header.style.display = previousDisplay;
        }
        window.scrollTo(0, 1);
        requestAnimationFrame(() => window.scrollTo(0, 0));
    };
    if(document.readyState === 'complete'){
        fixIOSLayoutOffset();
    } else {
        window.addEventListener('load', fixIOSLayoutOffset);
    }
}

/* ---------- Menú móvil ---------- */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    document.body.style.overflow = '';
}));

/* ---------- Scroll suave ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e){
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if(target){ target.scrollIntoView({behavior:'smooth', block:'start'}); }
    });
});

/* ---------- Header: suma sombra/borde al bajar el scroll ---------- */
(function(){
    const header = document.querySelector('header');
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
})();

/* ---------- Botón "volver arriba" ---------- */
(function(){
    const btn = document.getElementById('backToTop');
    if(!btn) return;
    const onScroll = () => btn.classList.toggle('show', window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
    btn.addEventListener('click', () => {
        window.scrollTo({top:0, behavior:'smooth'});
    });
})();

/* ---------- Animación reveal al hacer scroll ---------- */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.classList.add('show');
            revealObserver.unobserve(entry.target);
        }
    });
}, {threshold:0.12});
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- Contador animado de estadísticas ---------- */
/* Basado en tiempo (no en pasos fijos) para que el efecto de conteo se note
   siempre, incluso con números chicos como "3+" que antes terminaban en 2-3
   frames y pasaban desapercibidos. */
function animateCounters(){
    const DURATION = 1300; // milisegundos que dura la cuenta hacia arriba

    document.querySelectorAll('.stat-number').forEach(stat => {
        const target = parseInt(stat.dataset.count, 10);
        const obs = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting){
                const startTime = performance.now();
                const tick = (now) => {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / DURATION, 1);
                    // easeOutQuad: arranca rápido y desacelera al llegar al final
                    const eased = 1 - (1 - progress) * (1 - progress);
                    const current = Math.floor(eased * target);
                    stat.textContent = current + '+';
                    if(progress < 1){
                        requestAnimationFrame(tick);
                    } else {
                        stat.textContent = target + '+';
                    }
                };
                requestAnimationFrame(tick);
                obs.unobserve(stat);
            }
        }, {threshold:0.5});
        obs.observe(stat);
    });
}
animateCounters();

/* ---------- Filtros de portfolio + "Mostrar más" ---------- */
/* En vez de mostrar las 14 cards de una, se revelan de a tandas (PORTFOLIO_STEP)
   para que la sección se sienta liviana y ordenada. Cambiar de filtro reinicia
   la tanda visible al tamaño inicial. */
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioCards = Array.from(document.querySelectorAll('.portfolio-card'));
const portfolioMoreInner = document.getElementById('portfolioMoreInner');
const portfolioMoreBtn = document.getElementById('portfolioMoreBtn');
const portfolioMoreCount = document.getElementById('portfolioMoreCount');
const PORTFOLIO_STEP_DESKTOP = 6;
const PORTFOLIO_STEP_MOBILE = 3;
const mobileQuery = window.matchMedia('(max-width: 767px)');
const getPortfolioStep = () => mobileQuery.matches ? PORTFOLIO_STEP_MOBILE : PORTFOLIO_STEP_DESKTOP;
let activeFilter = 'all';
let visibleCount = getPortfolioStep();

function renderPortfolio(){
    const matches = portfolioCards.filter(card => activeFilter === 'all' || card.dataset.cat === activeFilter);
    portfolioCards.forEach(card => { card.style.display = 'none'; });
    matches.slice(0, visibleCount).forEach(card => { card.style.display = ''; });

    const remaining = matches.length - visibleCount;
    if(remaining > 0){
        portfolioMoreInner.hidden = false;
        portfolioMoreCount.textContent = `Proyecto ${Math.min(visibleCount, matches.length)} de ${matches.length}`;
    } else {
        portfolioMoreInner.hidden = true;
    }
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        visibleCount = getPortfolioStep();
        renderPortfolio();
    });
});

portfolioMoreBtn.addEventListener('click', () => {
    visibleCount += getPortfolioStep();
    renderPortfolio();
});

renderPortfolio();

/* ---------- Aviso antes de abrir demos sin backend conectado ---------- */
/* Los links marcados con data-demo="true" son proyectos de portfolio (Netlify)
   sin base de datos real conectada. Los links de "Ver sitio en vivo" (dominio
   propio, en producción real) no llevan este atributo y abren directo. */
document.querySelectorAll('.pf-link[data-demo="true"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const proceed = confirm(
            'Este sitio es una demo de portfolio: está a modo de boceto y no está ' +
            'conectado a una base de datos real, por lo que algunas funcionalidades ' +
            '(formularios, turnos, checkout, etc.) están limitadas.\n\n¿Querés continuar de todos modos?'
        );
        if(proceed){
            window.open(link.href, '_blank', 'noopener,noreferrer');
        }
    });
});

/* ---------- Formulario de contacto ---------- */
/* Envía los datos vía FormSubmit.co (servicio gratuito de formularios sin backend
   propio) directo a axeljaviersalomon@gmail.com. Usa AJAX para no salir de la
   página, y valida el campo honeypot "_honey" como protección anti-spam:
   los bots suelen completar todos los campos del formulario automáticamente,
   incluido el honeypot invisible; si llega con contenido, se descarta el envío
   sin avisar al bot (para no revelar la protección). */
document.getElementById('contactForm').addEventListener('submit', function(e){
    e.preventDefault();
    const form = this;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    // Honeypot: si un bot completó este campo invisible, fingimos éxito y no enviamos nada
    if(data._honey){
        alert('¡Gracias por tu solicitud! Te voy a responder con la mayor brevedad posible.');
        form.reset();
        return;
    }

    if(!data.nombre || !data.email || !data['tipo-proyecto'] || !data.descripcion){
        alert('Por favor completá todos los campos requeridos.');
        return;
    }

    const submitBtn = form.querySelector('.form-submit');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: fd
    })
    .then(response => {
        if(!response.ok) throw new Error('Error en el envío');
        alert('¡Gracias por tu solicitud! Te voy a responder con la mayor brevedad posible.');
        form.reset();
    })
    .catch(() => {
        alert('Hubo un problema al enviar el formulario. Por favor, intentá de nuevo o escribime directo por WhatsApp.');
    })
    .finally(() => {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    });
});

/* =====================================================================
   BOTÓN FLOTANTE DE WHATSAPP — entrada animada
   ===================================================================== */
(function(){
    const waFloat = document.querySelector('.whatsapp-float');

    // El botón redondo aparece con una animación de entrada a los 3 segundos
    setTimeout(() => {
        waFloat.classList.add('wa-visible');
    }, 3000);
})();

/* =====================================================================
   ASISTENTE VIRTUAL CON IA (Gemini) — esquina inferior izquierda
   =====================================================================
   IMPORTANTE — CÓMO FUNCIONA LA SEGURIDAD ACÁ:

   Este sitio es 100% estático (GitHub Pages), sin servidor propio. Por
   eso, la clave de la API de Gemini NUNCA vive en este archivo ni en
   ningún archivo que se suba a GitHub. En su lugar, este script le
   habla a un proxy propio (un Cloudflare Worker gratuito) que vos
   desplegás por separado, y ES ESE PROXY el que guarda la clave de
   forma segura y la usa para hablarle a Gemini.

   Antes de que esto funcione, tenés que:
   1. Desplegar el Worker (código y guía completa en el README del proyecto).
   2. Reemplazar PROXY_URL de acá abajo por la URL real de tu Worker.

   Mientras PROXY_URL no esté configurada, el chat va a avisar que el
   asistente todavía no está conectado, en vez de fallar en silencio.
   ===================================================================== */
(function(){
    // Asistente reservado por pedido del cliente (no se usa por ahora).
    // El código queda intacto: para reactivarlo, poner esto en true.
    const AI_ASSISTANT_ENABLED = false;
    if(!AI_ASSISTANT_ENABLED){
        const el = document.getElementById('aiAssistant');
        if(el) el.style.display = 'none';
        return;
    }

    // ---- CONFIGURACIÓN: reemplazar por tu URL real del Worker ----
    const PROXY_URL = 'https://TU-WORKER.workers.dev'; // <-- cambiar esto

    const assistant = document.getElementById('aiAssistant');
    const toggleBtn = document.getElementById('aiToggleBtn');
    const chatPanel = document.getElementById('aiChatPanel');
    const closeBtn = document.getElementById('aiChatClose');
    const messagesEl = document.getElementById('aiChatMessages');
    const input = document.getElementById('aiChatInput');
    const sendBtn = document.getElementById('aiChatSend');

    // Entrada animada a los 9 segundos
    setTimeout(() => {
        assistant.classList.add('ai-visible');
    }, 9000);

    // Abrir / cerrar el panel de chat
    function toggleChat(){
        assistant.classList.toggle('ai-open');
        if(assistant.classList.contains('ai-open')){
            setTimeout(() => input.focus(), 300);
        }
    }
    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    // Escapar HTML antes de insertar cualquier texto en el DOM (anti-XSS)
    function escapeHTML(str){
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function addMessage(text, type){
        const msg = document.createElement('div');
        msg.className = `ai-msg ai-msg-${type}`;
        msg.innerHTML = escapeHTML(text);
        messagesEl.appendChild(msg);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return msg;
    }

    function showTyping(){
        const typing = document.createElement('div');
        typing.className = 'ai-typing';
        typing.id = 'aiTyping';
        typing.innerHTML = '<span></span><span></span><span></span>';
        messagesEl.appendChild(typing);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    function hideTyping(){
        const typing = document.getElementById('aiTyping');
        if(typing) typing.remove();
    }

    // ---- Límite de uso del lado del cliente ----
    // Protección liviana contra el uso excesivo accidental (no contra un
    // atacante decidido, eso lo maneja el proxy). Tope razonable por sesión
    // de navegación para no agotar la cuota gratuita de golpe.
    const MAX_MESSAGES_PER_SESSION = 20;
    let messageCount = parseInt(sessionStorage.getItem('aiMsgCount') || '0', 10);

    // Historial corto de la conversación, para dar contexto a Gemini
    // sin mandar demasiados tokens de más
    let conversationHistory = [];
    const MAX_HISTORY_TURNS = 6;

    async function sendMessage(){
        const text = input.value.trim();
        if(!text) return;

        if(PROXY_URL.includes('TU-WORKER')){
            addMessage('El asistente todavía no está conectado. Revisá la configuración del proxy en el README.', 'error');
            return;
        }

        if(messageCount >= MAX_MESSAGES_PER_SESSION){
            addMessage('Llegaste al límite de mensajes de esta sesión. Escribime directo por WhatsApp si querés seguir la charla 👇', 'error');
            return;
        }

        addMessage(text, 'user');
        input.value = '';
        sendBtn.disabled = true;
        showTyping();

        conversationHistory.push({ role: 'user', text });
        if(conversationHistory.length > MAX_HISTORY_TURNS * 2){
            conversationHistory = conversationHistory.slice(-MAX_HISTORY_TURNS * 2);
        }

        try{
            const response = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: conversationHistory })
            });

            hideTyping();

            if(!response.ok){
                throw new Error('Respuesta no OK del proxy');
            }

            const data = await response.json();
            const reply = data.reply || 'No pude generar una respuesta. Probá de nuevo en un momento.';

            addMessage(reply, 'bot');
            conversationHistory.push({ role: 'model', text: reply });

            messageCount++;
            sessionStorage.setItem('aiMsgCount', String(messageCount));

        } catch(err){
            hideTyping();
            addMessage('Hubo un problema para conectar con el asistente. Probá de nuevo en un momento, o escribime directo por WhatsApp.', 'error');
        } finally {
            sendBtn.disabled = false;
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
        if(e.key === 'Enter'){
            e.preventDefault();
            sendMessage();
        }
    });
})();

/* =====================================================================
   CANVAS — Fondo animado de partículas en ondas (solo en el Hero)
   Se adapta a mobile: menos columnas para mejor rendimiento
   ===================================================================== */
(function(){
    const canvas = document.getElementById('waveCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function getGridSize(){
        // Menos partículas en pantallas chicas: mejor performance mobile-first
        if(window.innerWidth < 480) return {cols:26, rows:9};
        if(window.innerWidth < 768) return {cols:36, rows:11};
        return {cols:60, rows:14};
    }

    function resize(){
        width = canvas.parentElement.offsetWidth;
        height = canvas.parentElement.offsetHeight;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(1,0,0,1,0,0);
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        buildGrid();
    }

    function buildGrid(){
        particles = [];
        const {cols, rows} = getGridSize();
        const spacingX = width / cols;
        const spacingY = height / rows;
        for(let y = 0; y < rows; y++){
            for(let x = 0; x < cols; x++){
                particles.push({
                    baseX: x * spacingX,
                    baseY: y * spacingY,
                    x: x * spacingX,
                    y: y * spacingY,
                    depth: y / rows
                });
            }
        }
    }

    let t = 0;
    function animate(){
        t += 0.015;
        ctx.clearRect(0,0,width,height);

        particles.forEach(p => {
            const wave = Math.sin(t + p.baseX * 0.02 + p.depth * 4) * (5 + p.depth * 12);
            p.y = p.baseY + wave;

            const size = 1 + p.depth * 2;
            const opacity = 0.15 + p.depth * 0.5;

            const hueMix = p.baseX / width;
            const color = hueMix < 0.5
                ? `rgba(31, 201, 195, ${opacity})`   /* teal */
                : `rgba(47, 111, 237, ${opacity})`;  /* azul acento */

            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI*2);
            ctx.fillStyle = color;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
})();

/* =====================================================================
   TILT 3D EN LAS CARDS DE PORTFOLIO — solo mouse fino, respeta reduced-motion
   Inclina levemente la card hacia el cursor (max ~6°) para dar sensación
   de profundidad; --rx/--ry son leídas por la clase .has-tilt en el CSS.
   ===================================================================== */
(function(){
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!hasFinePointer || prefersReducedMotion) return;

    const MAX_TILT = 6;
    document.querySelectorAll('.portfolio-card').forEach(card => {
        card.classList.add('has-tilt');
        let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            tx = -py * MAX_TILT;
            ty = px * MAX_TILT;
            if(!raf) raf = requestAnimationFrame(loop);
        });
        card.addEventListener('mouseleave', () => {
            tx = 0; ty = 0;
            if(!raf) raf = requestAnimationFrame(loop);
        });

        function loop(){
            cx += (tx - cx) * 0.15;
            cy += (ty - cy) * 0.15;
            card.style.setProperty('--rx', cx.toFixed(2) + 'deg');
            card.style.setProperty('--ry', cy.toFixed(2) + 'deg');
            raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : null;
        }
    });
})();

/* =====================================================================
   TARJETA 3D LUMINISCENTE — cuadro del ícono de React en "Por qué elegirme"
   Mismo recurso que las tarjetas de portfolio-animado.js: la tarjeta
   "mira" hacia el mouse en TODA la pantalla (no solo al pasar por
   encima), lo que le da ese movimiento constante y sutil. Un
   IntersectionObserver frena el loop de rAF mientras la sección está
   fuera de vista, así no queda calculando de fondo sin necesidad.
   ===================================================================== */
(function(){
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!hasFinePointer || prefersReducedMotion) return;

    const visual = document.querySelector('.porque-visual');
    if(!visual) return;

    const MAX_TILT = 14;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let isVisible = false;
    let raf = null;
    let rx = 0, ry = 0, gx = 50, gy = 50;

    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    const observer = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
        if(isVisible && !raf) raf = requestAnimationFrame(loop);
    });
    observer.observe(visual);

    function clamp(value, min, max){
        return Math.max(min, Math.min(max, value));
    }

    function loop(){
        if(!isVisible){
            rx += (0 - rx) * 0.12;
            ry += (0 - ry) * 0.12;
        } else {
            const r = visual.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const px = clamp((targetX - cx) / (r.width * 1.4), -1, 1);
            const py = clamp((targetY - cy) / (r.height * 1.4), -1, 1);
            rx += (-py * MAX_TILT - rx) * 0.1;
            ry += (px * MAX_TILT - ry) * 0.1;
            gx += (50 + px * 40 - gx) * 0.1;
            gy += (50 + py * 40 - gy) * 0.1;
        }
        visual.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        visual.style.setProperty('--ry', ry.toFixed(2) + 'deg');
        visual.style.setProperty('--glow-x', gx.toFixed(1) + '%');
        visual.style.setProperty('--glow-y', gy.toFixed(1) + '%');
        raf = isVisible ? requestAnimationFrame(loop) : null;
    }
})();

/* =====================================================================
   MISMA TARJETA, EN MOBILE — sin mouse no hay hacia dónde "mirar", así que
   en touch replica el vaivén 3D idle (seno suave) que ya usan las tarjetas
   de portfolio-animado.js: mismo SWAY, mismas custom properties
   (--rx/--ry/--glow-x/--glow-y) que ya lee el CSS de esta tarjeta, así que
   no hace falta tocar estilos para nada de esto.
   ===================================================================== */
(function(){
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!isCoarsePointer || prefersReducedMotion) return;

    const visual = document.querySelector('.porque-visual');
    if(!visual) return;

    const SWAY = 6;
    let isVisible = false;
    let raf = null;
    let t = 0;

    const observer = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
        if(isVisible && !raf) raf = requestAnimationFrame(loop);
    });
    observer.observe(visual);

    function loop(){
        t += 0.02;
        const rx = Math.sin(t) * SWAY * 0.5;
        const ry = Math.sin(t * 0.7) * SWAY;
        visual.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        visual.style.setProperty('--ry', ry.toFixed(2) + 'deg');
        visual.style.setProperty('--glow-x', (50 + ry * 1.3).toFixed(1) + '%');
        visual.style.setProperty('--glow-y', (50 + rx * 1.3).toFixed(1) + '%');
        raf = isVisible ? requestAnimationFrame(loop) : null;
    }
})();

/* =====================================================================
   LUZ QUE SIGUE AL CURSOR — solo en dispositivos con mouse (pointer: fine)
   En touch/mobile no hay cursor real, así que no tiene sentido activarlo
   ===================================================================== */
(function(){
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!hasFinePointer || prefersReducedMotion) return;

    const glow = document.getElementById('cursorGlow');
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let isActive = false;

    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        if(!isActive){
            glow.classList.add('active');
            isActive = true;
        }
    });

    document.addEventListener('mouseleave', () => {
        glow.classList.remove('active');
        isActive = false;
    });

    // Suaviza el movimiento (lerp) para que la luz "persiga" al cursor con inercia sutil
    function followCursor(){
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
        requestAnimationFrame(followCursor);
    }
    followCursor();
})();

/* =====================================================================
   GRID TRIANGULAR CON MÁSCARA DE LUZ — fondo de "Por qué elegirme"
   Malla geométrica casi invisible que se revela con un brillo alrededor
   del cursor (mismos colores del canvas del hero: teal + azul de acento).
   Solo es interactiva con mouse fino; en touch/reduced-motion se deja la
   malla estática, sin animación (mismo criterio que la luz del cursor).
   ===================================================================== */
(function(){
    const canvas = document.getElementById('porqueGridCanvas');
    if(!canvas) return;
    const section = canvas.closest('.porque');
    const ctx = canvas.getContext('2d');
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Resolución 1:1 (sin escalar por devicePixelRatio): en pantallas retina
    // escalar el canvas duplica/cuadruplica los píxeles a redibujar en cada
    // frame y era la causa real del "delay" seguiste al cursor — se sacrifica
    // nitidez a cambio de que la animación se mantenga a 60fps siempre.
    const staticCanvas = document.createElement('canvas');
    const staticCtx = staticCanvas.getContext('2d');

    let width, height;

    function getCellSize(){
        // Celdas más grandes (menos triángulos) en pantallas chicas: mejor performance mobile-first
        if(window.innerWidth < 480) return 46;
        if(window.innerWidth < 768) return 54;
        return 68;
    }
    let cell = getCellSize();

    function strokeTriangle(g, p1, p2, p3){
        g.beginPath();
        g.moveTo(p1.x, p1.y);
        g.lineTo(p2.x, p2.y);
        g.lineTo(p3.x, p3.y);
        g.closePath();
    }

    // La malla base (sin brillo) es siempre la misma hasta el próximo resize,
    // así que se dibuja UNA sola vez en un canvas offscreen y cada frame solo
    // se copia (drawImage) en vez de volver a trazar cientos de triángulos.
    function buildStaticGrid(){
        staticCanvas.width = width;
        staticCanvas.height = height;
        staticCtx.clearRect(0, 0, width, height);
        staticCtx.strokeStyle = 'rgba(255,255,255,0.035)';
        staticCtx.lineWidth = 1;
        const cols = Math.ceil(width / cell) + 1;
        const rows = Math.ceil(height / cell) + 1;
        for(let y = 0; y < rows; y++){
            for(let x = 0; x < cols; x++){
                const x0 = x * cell, y0 = y * cell, x1 = x0 + cell, y1 = y0 + cell;
                const tl = {x:x0, y:y0}, tr = {x:x1, y:y0}, bl = {x:x0, y:y1}, br = {x:x1, y:y1};
                strokeTriangle(staticCtx, tl, tr, bl); staticCtx.stroke();
                strokeTriangle(staticCtx, tr, br, bl); staticCtx.stroke();
            }
        }
    }

    function resize(){
        width = section.offsetWidth;
        height = section.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        cell = getCellSize();
        buildStaticGrid();
    }

    function drawStatic(){
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(staticCanvas, 0, 0);
    }

    if(!hasFinePointer || prefersReducedMotion){
        resize();
        drawStatic();
        window.addEventListener('resize', () => { resize(); drawStatic(); });
        return;
    }

    function colorFor(hue, alpha){
        return hue < 0.5
            ? `rgba(31, 201, 195, ${alpha})`   /* teal */
            : `rgba(47, 111, 237, ${alpha})`;  /* azul acento */
    }

    const RADIUS = 240;
    const cellRadius = Math.ceil(RADIUS / cell) + 1;
    let mouseX = -9999, mouseY = -9999;
    let targetX = mouseX, targetY = mouseY;
    let rafId = null;
    let idleFrames = 0;

    function drawGlowTriangle(p1, p2, p3, mx, my){
        const cx = (p1.x + p2.x + p3.x) / 3;
        const cy = (p1.y + p2.y + p3.y) / 3;
        const dist = Math.hypot(cx - mx, cy - my);
        const glowT = Math.max(0, 1 - dist / RADIUS);
        if(glowT <= 0.02) return;

        const hue = cx / width;
        strokeTriangle(ctx, p1, p2, p3);
        ctx.fillStyle = colorFor(hue, glowT * 0.55);
        if(glowT > 0.6){
            // Glow real (shadowBlur) solo para el puñado de triángulos justo
            // debajo del cursor: es la operación más cara de canvas 2D, y
            // aplicarla a toda la malla en cada frame era la causa del delay.
            ctx.shadowColor = colorFor(hue, Math.min(glowT, 1));
            ctx.shadowBlur = 9 * glowT;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = colorFor(hue, Math.min(0.5, glowT * 0.8) + 0.06);
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function draw(){
        mouseX += (targetX - mouseX) * 0.35;
        mouseY += (targetY - mouseY) * 0.35;

        drawStatic();

        // Solo se reconstruyen y evalúan los triángulos de las celdas dentro
        // del radio de brillo alrededor del mouse (no toda la malla): mucho
        // menos trabajo por frame que iterar cientos de triángulos.
        const colCenter = Math.floor(mouseX / cell);
        const rowCenter = Math.floor(mouseY / cell);
        for(let ry = rowCenter - cellRadius; ry <= rowCenter + cellRadius; ry++){
            if(ry < 0) continue;
            const y0 = ry * cell, y1 = y0 + cell;
            for(let rx = colCenter - cellRadius; rx <= colCenter + cellRadius; rx++){
                if(rx < 0) continue;
                const x0 = rx * cell, x1 = x0 + cell;
                const tl = {x:x0, y:y0}, tr = {x:x1, y:y0}, bl = {x:x0, y:y1}, br = {x:x1, y:y1};
                drawGlowTriangle(tl, tr, bl, mouseX, mouseY);
                drawGlowTriangle(tr, br, bl, mouseX, mouseY);
            }
        }

        // Sin mouse activo y con el brillo ya asentado: se corta el loop en
        // vez de seguir redibujando 60 veces por segundo en segundo plano.
        const settled = Math.hypot(targetX - mouseX, targetY - mouseY) < 0.5;
        if(targetX < 0 && settled){
            idleFrames++;
            if(idleFrames > 10){ rafId = null; drawStatic(); return; }
        } else {
            idleFrames = 0;
        }
        rafId = requestAnimationFrame(draw);
    }

    function ensureLoop(){
        if(rafId === null) rafId = requestAnimationFrame(draw);
    }

    resize();
    drawStatic();
    window.addEventListener('resize', () => { resize(); (rafId === null ? drawStatic : () => {})(); });

    section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
        ensureLoop();
    });
    section.addEventListener('mouseleave', () => {
        targetX = -9999;
        targetY = -9999;
        ensureLoop();
    });
})();
