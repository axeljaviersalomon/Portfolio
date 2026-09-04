/* =====================================================================
   PORTFOLIO ANIMADO — navegación por paneles (scroll-snap "manejado")
   Independiente de script.js: esta página no tiene formulario de
   contacto, filtros de portfolio ni el resto de elementos de index.html,
   así que reimplementa solo lo que necesita (menú mobile, header on
   scroll, luz de cursor) más la lógica propia de paneles.
   ===================================================================== */

/* ---------- Menú móvil (igual que en index.html) ---------- */
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

/* ---------- Aviso antes de abrir demos sin backend conectado ---------- */
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

/* =====================================================================
   TARJETAS 3D — el logo de cada proyecto "mira" hacia el mouse
   Mismo recurso que el tilt 3D de las cards del portfolio clásico
   (perspective + rotateX/rotateY vía custom properties, ver script.js),
   pero acá sigue la posición del mouse en TODA la pantalla en vez de
   solo al pasar por encima: encaja mejor con el formato "un proyecto a
   pantalla completa". Solo se calcula para la tarjeta del panel activo
   (las demás están fuera de pantalla, no vale la pena tocarlas).
   ===================================================================== */
(function(){
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!hasFinePointer || prefersReducedMotion) return;

    const MAX_TILT = 14; // grados: más pronunciado que el tilt del portfolio clásico (6°) a propósito
    const state = Array.from(document.querySelectorAll('.pa-media-frame')).map(frame => ({
        frame, rx: 0, ry: 0, gx: 50, gy: 50
    }));
    if(!state.length) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    function clamp(value, min, max){
        return Math.max(min, Math.min(max, value));
    }

    function loop(){
        state.forEach(s => {
            const panel = s.frame.closest('.pa-panel');
            if(!panel || !panel.classList.contains('is-active')){
                // Panel fuera de pantalla: relaja la tarjeta a su posición
                // neutral en vez de dejarla "congelada" en el último ángulo.
                s.rx += (0 - s.rx) * 0.12;
                s.ry += (0 - s.ry) * 0.12;
            } else {
                const r = s.frame.getBoundingClientRect();
                const cx = r.left + r.width / 2;
                const cy = r.top + r.height / 2;
                const px = clamp((targetX - cx) / (r.width * 1.4), -1, 1);
                const py = clamp((targetY - cy) / (r.height * 1.4), -1, 1);
                s.rx += (-py * MAX_TILT - s.rx) * 0.1;
                s.ry += (px * MAX_TILT - s.ry) * 0.1;
                s.gx += (50 + px * 40 - s.gx) * 0.1;
                s.gy += (50 + py * 40 - s.gy) * 0.1;
            }
            s.frame.style.setProperty('--rx', s.rx.toFixed(2) + 'deg');
            s.frame.style.setProperty('--ry', s.ry.toFixed(2) + 'deg');
            s.frame.style.setProperty('--glow-x', s.gx.toFixed(1) + '%');
            s.frame.style.setProperty('--glow-y', s.gy.toFixed(1) + '%');
        });
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
})();

/* =====================================================================
   TARJETAS 3D EN MOBILE — sin mouse no hay hacia dónde "mirar", así que
   en touch la tarjeta activa hace su propio vaivén 3D (seno suave) más
   un "golpe" de entrada al llegar a un proyecto nuevo (más marcado y en
   la dirección del swipe, luego se amortigua solo). Reutiliza las
   mismas custom properties (--rx/--ry/--glow-x/--glow-y) que el tilt de
   desktop de arriba, así que no hace falta tocar el CSS de la tarjeta
   para nada de esto. Un solo rAF para las 14 tarjetas (solo escribe
   estilos en la activa) para que el costo en un celular sea mínimo.
   ===================================================================== */
(function(){
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!isCoarsePointer || prefersReducedMotion) return;
    if(!document.querySelector('.pa-media-frame')) return;

    const SWAY = 6;   // grados del vaivén de reposo
    const KICK = 14;  // grados extra del golpe de entrada, se amortigua rápido
    let activeFrame = null;
    let kick = 0;
    let t = 0;

    document.addEventListener('pa:panel-active', (e) => {
        activeFrame = e.detail && e.detail.frame;
        kick = KICK * (e.detail && e.detail.dir === 'up' ? -1 : 1);
    });

    function loop(){
        t += 0.02;
        kick *= 0.92;
        if(activeFrame){
            const rx = Math.sin(t) * SWAY * 0.5;
            const ry = Math.sin(t * 0.7) * SWAY + kick;
            activeFrame.style.setProperty('--rx', rx.toFixed(2) + 'deg');
            activeFrame.style.setProperty('--ry', ry.toFixed(2) + 'deg');
            activeFrame.style.setProperty('--glow-x', (50 + ry * 1.3).toFixed(1) + '%');
            activeFrame.style.setProperty('--glow-y', (50 + rx * 1.3).toFixed(1) + '%');
        }
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
})();

/* =====================================================================
   TARJETA CLICKEABLE — abre el proyecto entero, no solo el botón
   Con el scroll-jack activo, bajar el dedo/mouse justo hasta "Ver
   demo ↗" puede sentirse incómodo (el gesto compite con el cambio de
   panel). La tarjeta ya tiene todo el espacio y el brillo como para
   funcionar como affordance de link: clickearla dispara el mismo <a>
   real de "Ver sitio en vivo"/"Ver demo" del panel, así se respeta el
   confirm() de las demos sin backend (ver el listener de "data-demo"
   más arriba) en vez de duplicar esa lógica acá.
   ===================================================================== */
document.querySelectorAll('.pa-media-frame').forEach(frame => {
    const link = frame.closest('.pa-panel-inner')?.querySelector('.pa-actions .pf-link');
    if(!link) return;
    frame.classList.add('pa-media-frame--clickable');
    frame.setAttribute('role', 'link');
    frame.setAttribute('tabindex', '0');
    frame.setAttribute('aria-label', link.textContent.trim());
    frame.addEventListener('click', () => link.click());
    frame.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); link.click(); }
    });
});

/* =====================================================================
   NAVEGACIÓN POR PANELES
   Scroll-snap "manejado" por JS: cada gesto de rueda/trackpad avanza o
   retrocede UN proyecto entero, con una animación propia (rAF + easing),
   bastante más corta que el scroll "smooth" nativo del navegador — eso
   es lo que antes hacía sentir una pausa larga entre proyecto y
   proyecto. El bloqueo dura apenas lo que dura la animación, así que el
   recorrido se siente rápido pero sigue saltando de a un proyecto por
   vez (no un scroll libre/continuo). En touch (mobile) se deja el
   scroll nativo libre, con snap suave por CSS como apoyo.
   ===================================================================== */
(function(){
    const track = document.getElementById('paTrack');
    if(!track) return;

    // "allPanels" nunca cambia: intro + los 14 proyectos + outro, en su
    // orden real en el documento. "panels" es el subconjunto VISIBLE en
    // cada momento (varía con el filtro activo) y es lo que usa toda la
    // navegación de acá abajo (dots, contador, flechas, wheel, teclado).
    const allPanels = Array.from(track.querySelectorAll('.pa-panel'));
    if(!allPanels.length) return;
    let panels = allPanels.slice();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const dotsWrap = document.getElementById('paDots');
    const counterCurrent = document.getElementById('paCounterCurrent');
    const counterTotal = document.getElementById('paCounterTotal');
    const prevBtn = document.getElementById('paPrevBtn');
    const nextBtn = document.getElementById('paNextBtn');
    const filterBar = document.getElementById('paFilters');
    const filterBtns = filterBar ? Array.from(filterBar.querySelectorAll('.filter-btn')) : [];

    let dots = [];
    let current = 0;
    let activePanel = panels[0];
    let locked = false;
    let scrollFrameId = null;
    let syncObserver = null;

    // Duración corta a propósito: es lo que evita la "pausa larga" entre
    // proyectos que había antes con el scroll smooth nativo del navegador.
    const SCROLL_DURATION = 320;
    const WHEEL_THRESHOLD = 8; // ignora el ruido de scroll mínimo del trackpad

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
            // behavior:'auto' es clave acá: "html" tiene scroll-behavior:smooth
            // global (ver styles.css), así que sin esto cada uno de estos ~60
            // scrollTo() por segundo dispara SU PROPIA animación suave nativa
            // por encima del easing manual de acá — dos animaciones peleando
            // por el mismo scroll, y el resultado es que se queda "corto" y se
            // siente trabado (medido: pedir scrollTo(0,900) terminaba clavado
            // cerca de 96px). Con "auto" cada frame salta directo a su valor y
            // el único easing que se ve es el nuestro.
            window.scrollTo({top: startY + diff * easeInOutCubic(t), left:0, behavior:'auto'});
            if(t < 1){ scrollFrameId = requestAnimationFrame(step); }
            else { scrollFrameId = null; onDone(); }
        }
        scrollFrameId = requestAnimationFrame(step);
    }

    // Reconstruye los puntos de navegación lateral para el subconjunto
    // visible actual (se llama de nuevo cada vez que cambia el filtro)
    function rebuildDots(){
        if(!dotsWrap) return;
        dotsWrap.innerHTML = '';
        dots = panels.map((panel, i) => {
            const dot = document.createElement('button');
            dot.className = 'pa-dot';
            dot.type = 'button';
            dot.setAttribute('aria-label', panel.dataset.label || `Ir a la sección ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(dot);
            return dot;
        });
    }

    function setActive(index){
        const dir = index >= current ? 'down' : 'up';
        current = index;
        activePanel = panels[index];

        allPanels.forEach(panel => panel.classList.remove('is-active'));
        activePanel.classList.add('is-active');
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));

        // Aviso desacoplado para quien le interese qué tarjeta quedó activa y
        // desde qué dirección se llegó (lo usa el tilt 3D de mobile, más abajo
        // en este archivo, para dar un "golpe" de entrada en vez de solo el
        // vaivén de reposo). Un CustomEvent en vez de acoplar directo evita que
        // la navegación tenga que saber que ese efecto existe.
        const frame = activePanel.querySelector('.pa-media-frame');
        if(frame) document.dispatchEvent(new CustomEvent('pa:panel-active', {detail:{frame, dir}}));

        const visibleProjectPanels = panels.filter(p => p.dataset.project !== undefined);
        if(counterTotal) counterTotal.textContent = String(visibleProjectPanels.length).padStart(2, '0');
        const projectIndex = visibleProjectPanels.indexOf(activePanel);
        if(counterCurrent){
            counterCurrent.textContent = projectIndex >= 0
                ? String(projectIndex + 1).padStart(2, '0')
                : '—';
        }
        if(prevBtn) prevBtn.disabled = index === 0;
        if(nextBtn) nextBtn.disabled = index === panels.length - 1;

        history.replaceState(null, '', activePanel.id ? `#${activePanel.id}` : location.pathname);
    }

    let unlockTimer = null;
    function goTo(index, force){
        index = Math.max(0, Math.min(panels.length - 1, index));
        if((index === current && !force) || (locked && !force)) return;

        setActive(index);

        if(prefersReducedMotion){
            panels[index].scrollIntoView({behavior:'auto', block:'start'});
            return;
        }

        locked = true;
        const targetY = panels[index].getBoundingClientRect().top + window.scrollY;
        animateScrollTo(targetY, () => { locked = false; });

        // Red de seguridad: si por lo que sea (pestaña en segundo plano,
        // el navegador pausando requestAnimationFrame, etc.) la animación
        // nunca llega a completarse, "locked" no puede quedar trabado en
        // true para siempre — eso freezaría toda la navegación (wheel,
        // dots, flechas, touch) hasta refrescar la página.
        clearTimeout(unlockTimer);
        unlockTimer = setTimeout(() => { locked = false; }, SCROLL_DURATION + 400);
    }

    // En touch (sin scroll-jack) mantenemos los dots/contador sincronizados
    // con lo que el usuario esté viendo, sin forzar ningún salto por JS.
    // Se vuelve a armar cada vez que cambia el subconjunto visible.
    function setupSyncObserver(){
        if(!isCoarsePointer) return;
        if(syncObserver) syncObserver.disconnect();
        syncObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting && entry.intersectionRatio > 0.55){
                    const idx = panels.indexOf(entry.target);
                    if(idx > -1 && idx !== current) setActive(idx);
                }
            });
        }, {threshold:[0.55]});
        panels.forEach(panel => syncObserver.observe(panel));
    }

    /* ---------- Filtros por categoría ---------- */
    // Oculta/muestra los paneles de proyecto (intro y outro son siempre
    // visibles) y recalcula todo lo que depende del subconjunto visible.
    function applyFilter(category){
        allPanels.forEach(panel => {
            if(panel.dataset.project === undefined) return;
            const match = category === 'all' || panel.dataset.cat === category;
            panel.style.display = match ? '' : 'none';
        });
        panels = allPanels.filter(panel => panel.style.display !== 'none');

        rebuildDots();
        setupSyncObserver();

        // Elegir categoría lleva directo al primer proyecto que matchea
        // (más interactivo que quedarse quieto en el intro). "Todos"
        // respeta la posición actual si sigue siendo válida.
        let nextIndex = category === 'all' ? panels.indexOf(activePanel) : -1;
        if(nextIndex === -1){
            nextIndex = panels.findIndex(p => p.dataset.project !== undefined);
            if(nextIndex === -1) nextIndex = 0;
        }
        goTo(nextIndex, true);

        filterBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === category));
    }

    if(filterBtns.length){
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
        });
    }

    rebuildDots();

    // Activa el panel inicial (respeta el #hash si la página se abrió con uno)
    const initialIndex = Math.max(0, panels.findIndex(p => p.id === location.hash.replace('#', '')));
    setActive(initialIndex);
    if(initialIndex > 0){
        requestAnimationFrame(() => panels[initialIndex].scrollIntoView({behavior: 'auto', block: 'start'}));
    }

    // El scroll-jack solo aplica a puntero fino (desktop): en touch se deja
    // el scroll nativo libre, con el snap suave de portfolio-animado.css
    // como apoyo.
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

    // Flechitas del contador: misma navegación de a un proyecto por vez
    if(prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if(nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

    // En touch usábamos el scroll nativo libre + una corrección "a mano"
    // al soltar (settleToNearestPanel). En la práctica eso competía con
    // el scroll con inercia del propio navegador: mientras el dedo ya
    // soltó pero el momentum seguía moviendo la página, el scrollTo()
    // correctivo se sumaba a esa inercia y el resultado se sentía
    // trabado/tironeado en vez de un salto limpio de un proyecto al
    // siguiente. La solución es la misma que en desktop: nada de scroll
    // nativo, el gesto (acá un swipe vertical en vez de la rueda) se
    // intercepta con preventDefault y goTo() hace SIEMPRE la animación
    // corta propia — así el recorrido se siente idéntico en mobile y en
    // desktop, como pasar diapositivas.
    if(isCoarsePointer){
        const SWIPE_THRESHOLD = 40; // px mínimos para "gastar" el gesto en un cambio de panel
        const ignoreSwipeFrom = 'a, button, .pa-dots, .pa-counter, .pa-filters, header, .nav-links, .hamburger';
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
            if(Math.abs(dx) > Math.abs(dy)) return; // gesto horizontal: no es navegación de paneles

            e.preventDefault();
            if(locked) return;
            if(Math.abs(dy) > SWIPE_THRESHOLD){
                goTo(current + (dy < 0 ? 1 : -1));
                // Reinicia el gesto desde acá: un swipe largo y continuo
                // (sin levantar el dedo) puede seguir avanzando varios
                // proyectos, igual que pasa con la rueda en desktop.
                touchStartY = touchLastY;
            }
        }, {passive:false});

        track.addEventListener('touchend', () => { touchActive = false; }, {passive:true});
    }

    setupSyncObserver();
})();

/* =====================================================================
   FONDO DE MALLA QUE SIGUE AL MOUSE
   Mismo efecto que ".porque" en index.html (ver script.js): malla
   triangular casi invisible que se revela con un brillo alrededor del
   cursor. Se usa en el panel intro y en todos los paneles de proyecto
   que tienen el fondo negro más oscuro (ver portfolio-animado.css y el
   HTML: data-pa-grid), para que ese fondo sea siempre el interactivo.
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
