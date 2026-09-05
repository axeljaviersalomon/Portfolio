/* =====================================================================
   SOBRE MÍ — página de scroll normal, mismo comportamiento genérico que
   script.js (menú mobile, reveal al scroll, luz de cursor, WhatsApp
   flotante) pero sin nada de lo que esta página no tiene: contadores,
   filtros de portfolio, formulario de contacto ni asistente de IA.
   ===================================================================== */

/* ---------- Menú móvil ---------- */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if(hamburger && navLinks){
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
}

/* ---------- Header: suma sombra/borde al bajar el scroll ---------- */
(function(){
    const header = document.querySelector('header');
    if(!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
})();

/* ---------- Animación reveal al hacer scroll (igual que script.js) ---------- */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.classList.add('show');
            revealObserver.unobserve(entry.target);
        }
    });
}, {threshold:0.12});
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- Luz que sigue al cursor (solo mouse fino) ---------- */
(function(){
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const glow = document.getElementById('cursorGlow');
    if(!glow || !hasFinePointer || prefersReducedMotion) return;

    let targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
    let currentX = targetX, currentY = targetY;
    let isActive = false;

    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        if(!isActive){ glow.classList.add('active'); isActive = true; }
    });
    document.addEventListener('mouseleave', () => {
        glow.classList.remove('active');
        isActive = false;
    });
    function followCursor(){
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        glow.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
        requestAnimationFrame(followCursor);
    }
    followCursor();
})();

/* =====================================================================
   TARJETA 3D DEL LOGO (sección "Filosofía") — mismo comportamiento que
   ".porque-visual" en script.js (home): en desktop con mouse, tiltea
   hacia el cursor y mueve el brillo especular; en touch, hace un vaivén
   idle. Se duplica acá (en vez de compartir script.js) porque esta
   página no carga ese archivo — ver nota al inicio de este archivo.
   ===================================================================== */
(function(){
    const visual = document.querySelector('.porque-visual');
    if(!visual) return;

    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(prefersReducedMotion) return;

    let raf = null;
    let isVisible = false;
    const observer = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
        if(isVisible && !raf) raf = requestAnimationFrame(loop);
    });
    observer.observe(visual);

    function clamp(value, min, max){
        return Math.max(min, Math.min(max, value));
    }

    let loop;

    if(hasFinePointer){
        const MAX_TILT = 14;
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let rx = 0, ry = 0, gx = 50, gy = 50;

        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        });

        loop = function(){
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
        };
    } else {
        const SWAY = 6;
        let t = 0;

        loop = function(){
            t += 0.02;
            const rx = Math.sin(t) * SWAY * 0.5;
            const ry = Math.sin(t * 0.7) * SWAY;
            visual.style.setProperty('--rx', rx.toFixed(2) + 'deg');
            visual.style.setProperty('--ry', ry.toFixed(2) + 'deg');
            visual.style.setProperty('--glow-x', (50 + ry * 1.3).toFixed(1) + '%');
            visual.style.setProperty('--glow-y', (50 + rx * 1.3).toFixed(1) + '%');
            raf = isVisible ? requestAnimationFrame(loop) : null;
        };
    }
})();

/* ---------- Botón flotante de WhatsApp — entrada animada ---------- */
(function(){
    const waFloat = document.querySelector('.whatsapp-float');
    if(!waFloat) return;
    setTimeout(() => {
        waFloat.classList.add('wa-visible');
    }, 3000);
})();

/* =====================================================================
   CANVAS — Fondo animado de partículas en ondas (sección "Tecnologías")
   Copia exacta del mismo efecto que el Hero de index.html (#waveCanvas
   en script.js): mismo grid adaptativo, mismo movimiento y colores.
   ===================================================================== */
(function(){
    const canvas = document.getElementById('waveCanvasTech');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function getGridSize(){
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
                ? `rgba(31, 201, 195, ${opacity})`
                : `rgba(47, 111, 237, ${opacity})`;

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
