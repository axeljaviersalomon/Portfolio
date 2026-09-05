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

/* ---------- Botón flotante de WhatsApp — entrada animada ---------- */
(function(){
    const waFloat = document.querySelector('.whatsapp-float');
    if(!waFloat) return;
    setTimeout(() => {
        waFloat.classList.add('wa-visible');
    }, 3000);
})();
