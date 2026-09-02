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

/* ---------- Flechas de paginación (scroll suave al portfolio) ---------- */
document.getElementById('nextArrow').addEventListener('click', () => {
    document.getElementById('portfolio').scrollIntoView({behavior:'smooth'});
});
document.getElementById('prevArrow').addEventListener('click', () => {
    document.getElementById('portfolio').scrollIntoView({behavior:'smooth'});
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
   BOTÓN FLOTANTE DE WHATSAPP — entrada animada + burbuja de mensaje diferida
   ===================================================================== */
(function(){
    const waFloat = document.querySelector('.whatsapp-float');
    const bubble = document.getElementById('waBubble');
    const closeBtn = document.getElementById('waBubbleClose');
    const waButton = document.getElementById('waButton');
    const STORAGE_KEY = 'waBubbleDismissed';

    // El botón redondo aparece con una animación de entrada a los 3 segundos
    setTimeout(() => {
        waFloat.classList.add('wa-visible');
    }, 3000);

    // La burbuja de mensaje aparece a los 8 segundos, solo si el usuario no la cerró antes
    let bubbleShown = false;
    function showBubble(){
        if(bubbleShown) return;
        if(sessionStorage.getItem(STORAGE_KEY) === '1') return;
        bubble.classList.add('show');
        bubbleShown = true;
    }
    setTimeout(showBubble, 15000);

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
