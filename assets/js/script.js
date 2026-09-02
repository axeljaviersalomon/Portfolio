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
function animateCounters(){
    document.querySelectorAll('.stat-number').forEach(stat => {
        const target = parseInt(stat.dataset.count, 10);
        let current = 0;
        const step = Math.max(target/50, 1);
        const obs = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting){
                const tick = () => {
                    current += step;
                    if(current < target){
                        stat.textContent = Math.floor(current) + '+';
                        requestAnimationFrame(tick);
                    } else {
                        stat.textContent = target + '+';
                    }
                };
                tick();
                obs.unobserve(stat);
            }
        }, {threshold:0.5});
        obs.observe(stat);
    });
}
animateCounters();

/* ---------- Filtros de portfolio ---------- */
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioCards = document.querySelectorAll('.portfolio-card');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        portfolioCards.forEach(card => {
            const match = filter === 'all' || card.dataset.cat === filter;
            card.style.display = match ? '' : 'none';
        });
    });
});

/* ---------- Flechas de paginación (scroll suave al portfolio) ---------- */
document.getElementById('nextArrow').addEventListener('click', () => {
    document.getElementById('portfolio').scrollIntoView({behavior:'smooth'});
});
document.getElementById('prevArrow').addEventListener('click', () => {
    document.getElementById('portfolio').scrollIntoView({behavior:'smooth'});
});

/* ---------- Formulario de contacto ---------- */
document.getElementById('contactForm').addEventListener('submit', function(e){
    e.preventDefault();
    const fd = new FormData(this);
    const data = Object.fromEntries(fd.entries());

    if(!data.nombre || !data.email || !data.empresa || !data['tipo-proyecto'] || !data.presupuesto || !data.descripcion){
        alert('Por favor completá todos los campos requeridos.');
        return;
    }

    console.log('Datos del formulario:', data);
    alert('¡Gracias por tu solicitud! Te voy a responder en menos de 24 horas.');
    this.reset();

    // Aquí podés integrar tu backend, EmailJS, Google Sheets, etc.
});

/* =====================================================================
   BOTÓN FLOTANTE DE WHATSAPP — burbuja de mensaje con aparición diferida
   ===================================================================== */
(function(){
    const bubble = document.getElementById('waBubble');
    const closeBtn = document.getElementById('waBubbleClose');
    const waButton = document.getElementById('waButton');
    const STORAGE_KEY = 'waBubbleDismissed';

    // Muestra la burbuja a los pocos segundos, solo si el usuario no la cerró antes
    let bubbleShown = false;
    function showBubble(){
        if(bubbleShown) return;
        if(sessionStorage.getItem(STORAGE_KEY) === '1') return;
        bubble.classList.add('show');
        bubbleShown = true;
    }
    setTimeout(showBubble, 3500);

    function hideBubble(){
        bubble.classList.remove('show');
        sessionStorage.setItem(STORAGE_KEY, '1');
    }

    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        hideBubble();
    });

    // Al hacer clic en el botón de WhatsApp, ocultamos la burbuja también
    waButton.addEventListener('click', hideBubble);
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
