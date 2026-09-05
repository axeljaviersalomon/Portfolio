/* =====================================================================
   SOBRE MÍ — navegación por paneles (scroll-snap "manejado")
   Independiente de script.js y de portfolio-animado.js: esta página no
   tiene formulario, filtros de portfolio ni tarjetas de proyecto, así
   que reimplementa solo lo que necesita (menú mobile, header on scroll,
   luz de cursor, fondo de malla) más la navegación de paneles, sin la
   parte de filtros/tilt 3D que sí usa Portfolio Animado.
   ===================================================================== */

/* ---------- Menú móvil (igual que en el resto del sitio) ---------- */
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
   NAVEGACIÓN POR PANELES
   Misma lógica de scroll-jack "de a un panel por gesto" que Portfolio
   Animado (ver ese JS para el detalle de cada decisión), pero sin
   filtros: acá el listado de paneles es fijo, nunca cambia.
   ===================================================================== */
(function(){
    const track = document.getElementById('paTrack');
    if(!track) return;

    const panels = Array.from(track.querySelectorAll('.pa-panel'));
    if(!panels.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const dotsWrap = document.getElementById('paDots');
    const counterCurrent = document.getElementById('paCounterCurrent');
    const counterTotal = document.getElementById('paCounterTotal');
    const prevBtn = document.getElementById('paPrevBtn');
    const nextBtn = document.getElementById('paNextBtn');
    const toTopBtn = document.getElementById('paToTop');
    const counterWrap = document.getElementById('paCounter');

    const countedPanels = panels.filter(p => p.dataset.panel !== undefined);
    if(counterTotal) counterTotal.textContent = String(countedPanels.length).padStart(2, '0');

    let dots = [];
    let current = 0;
    let locked = false;
    let scrollFrameId = null;

    const SCROLL_DURATION = 320;
    const WHEEL_THRESHOLD = 8;

    function easeInOutCubic(t){
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animateScrollTo(targetY, onDone){
        if(scrollFrameId !== null){ cancelAnimationFrame(scrollFrameId); scrollFrameId = null; }
        const startY = window.scrollY;
        const diff = targetY - startY;
        if(Math.abs(diff) < 1){ onDone(); return; }
        const startTime = performance.now();
        function step(now){
            const t = Math.min((now - startTime) / SCROLL_DURATION, 1);
            window.scrollTo({top: startY + diff * easeInOutCubic(t), left:0, behavior:'auto'});
            if(t < 1){ scrollFrameId = requestAnimationFrame(step); }
            else { scrollFrameId = null; onDone(); }
        }
        scrollFrameId = requestAnimationFrame(step);
    }

    dots = panels.map((panel, i) => {
        if(!dotsWrap) return null;
        const dot = document.createElement('button');
        dot.className = 'pa-dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', panel.dataset.label || `Ir a la sección ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
        return dot;
    });

    function setActive(index){
        current = index;
        const activePanel = panels[index];

        panels.forEach(panel => panel.classList.remove('is-active'));
        activePanel.classList.add('is-active');
        dots.forEach((dot, i) => dot && dot.classList.toggle('is-active', i === index));

        const countedIndex = countedPanels.indexOf(activePanel);
        if(counterCurrent){
            counterCurrent.textContent = countedIndex >= 0
                ? String(countedIndex + 1).padStart(2, '0')
                : '—';
        }
        if(prevBtn) prevBtn.disabled = index === 0;
        if(nextBtn) nextBtn.disabled = index === panels.length - 1;
        // El hero siempre es panels[0]: ahí abajo ya está el indicador de
        // "scroll" propio, y mostrarlo junto al paginador los hace pisarse.
        if(toTopBtn) toTopBtn.classList.toggle('show', index > 0);
        if(counterWrap) counterWrap.classList.toggle('show', index > 0);

        history.replaceState(null, '', activePanel.id ? `#${activePanel.id}` : location.pathname);
    }

    let unlockTimer = null;
    function goTo(index){
        index = Math.max(0, Math.min(panels.length - 1, index));
        if(index === current || locked) return;

        setActive(index);

        if(prefersReducedMotion){
            panels[index].scrollIntoView({behavior:'auto', block:'start'});
            return;
        }

        locked = true;
        const targetY = panels[index].getBoundingClientRect().top + window.scrollY;
        animateScrollTo(targetY, () => { locked = false; });

        // Red de seguridad: si la animación nunca llega a completarse
        // (pestaña en segundo plano, etc.), "locked" no queda trabado.
        clearTimeout(unlockTimer);
        unlockTimer = setTimeout(() => { locked = false; }, SCROLL_DURATION + 400);
    }

    // En touch (sin scroll-jack) mantenemos dots/contador sincronizados
    // con lo que el usuario esté viendo, sin forzar ningún salto por JS.
    if(isCoarsePointer){
        const syncObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting && entry.intersectionRatio > 0.55){
                    const idx = panels.indexOf(entry.target);
                    if(idx > -1 && idx !== current) setActive(idx);
                }
            });
        }, {threshold:[0.55]});
        panels.forEach(panel => syncObserver.observe(panel));
    }

    const initialIndex = Math.max(0, panels.findIndex(p => p.id === location.hash.replace('#', '')));
    setActive(initialIndex);
    if(initialIndex > 0){
        requestAnimationFrame(() => panels[initialIndex].scrollIntoView({behavior: 'auto', block: 'start'}));
    }

    if(!isCoarsePointer){
        window.addEventListener('wheel', (e) => {
            if(Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
            e.preventDefault();
            if(locked) return;
            goTo(current + (e.deltaY > 0 ? 1 : -1));
        }, {passive:false});
    }

    window.addEventListener('keydown', (e) => {
        if(['ArrowDown','PageDown'].includes(e.key)){ e.preventDefault(); goTo(current + 1); }
        else if(['ArrowUp','PageUp'].includes(e.key)){ e.preventDefault(); goTo(current - 1); }
    });

    if(prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if(nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
    if(toTopBtn) toTopBtn.addEventListener('click', () => goTo(0));

    if(isCoarsePointer){
        const SWIPE_THRESHOLD = 40;
        const ignoreSwipeFrom = 'a, button, .pa-dots, .pa-counter, header, .nav-links, .hamburger';
        let touchActive = false;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchLastY = 0;

        track.addEventListener('touchstart', (e) => {
            if(e.touches.length !== 1 || e.target.closest(ignoreSwipeFrom)){
                touchActive = false;
                return;
            }
            touchActive = true;
            touchStartX = e.touches[0].clientX;
            touchStartY = touchLastY = e.touches[0].clientY;
        }, {passive:true});

        track.addEventListener('touchmove', (e) => {
            if(!touchActive || e.touches.length !== 1) return;
            touchLastY = e.touches[0].clientY;
            const dx = e.touches[0].clientX - touchStartX;
            const dy = touchLastY - touchStartY;
            if(Math.abs(dx) > Math.abs(dy)) return;

            e.preventDefault();
            if(locked) return;
            if(Math.abs(dy) > SWIPE_THRESHOLD){
                goTo(current + (dy < 0 ? 1 : -1));
                touchStartY = touchLastY;
            }
        }, {passive:false});

        track.addEventListener('touchend', () => { touchActive = false; }, {passive:true});
    }
})();

/* =====================================================================
   FONDO DE MALLA QUE SIGUE AL MOUSE
   Mismo efecto que ".porque" en index.html / Portfolio Animado: malla
   triangular casi invisible que se revela con un brillo alrededor del
   cursor. Se usa en los paneles con fondo negro más oscuro (data-pa-grid).
   ===================================================================== */
function initMouseGrid(canvas){
    const section = canvas.closest('.pa-panel');
    if(!section) return;
    const ctx = canvas.getContext('2d');
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const staticCanvas = document.createElement('canvas');
    const staticCtx = staticCanvas.getContext('2d');

    let width, height;

    function getCellSize(){
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
        // drawImage sobre un canvas fuente de 0x0 (sección aún sin layout)
        // tira InvalidStateError — se evita el frame en vez de arriesgarse.
        if(staticCanvas.width === 0 || staticCanvas.height === 0) return;
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
            ? `rgba(31, 201, 195, ${alpha})`
            : `rgba(47, 111, 237, ${alpha})`;
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
}

document.querySelectorAll('[data-pa-grid]').forEach(initMouseGrid);
