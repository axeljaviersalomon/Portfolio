/* =============================================================================
   PROXY DE GEMINI PARA EL ASISTENTE VIRTUAL DEL PORTFOLIO
   =============================================================================

   QUÉ ES ESTE ARCHIVO
   Este es el código de un Cloudflare Worker: un pequeño servidor gratuito
   que vive en la nube de Cloudflare, NO en GitHub Pages. Su único trabajo
   es recibir los mensajes del chat de tu web, agregar la clave secreta de
   Gemini (que él guarda de forma segura), pedirle la respuesta a Google, y
   devolvértela. Así, la clave nunca aparece en el código público del sitio.

   NO SUBAS ESTE ARCHIVO A TU REPO DE GITHUB. Va aparte, directo en el
   panel de Cloudflare (ver instrucciones en el README del proyecto).

   ============================================================================= */

/* -----------------------------------------------------------------------
   1. CONFIGURACIÓN QUE SÍ PODÉS EDITAR ACÁ
   ----------------------------------------------------------------------- */

// Dominio(s) desde los que se permite llamar a este proxy. Ajustá esto a
// tu dominio real. Bloquea que OTROS sitios usen tu proxy y tu cuota
// gratuita sin permiso (protección por CORS, la aplica el navegador).
const ALLOWED_ORIGINS = [
    'https://axeljaviersalomon.github.io',
];

// Modelo de Gemini a usar. gemini-2.0-flash-lite es el más generoso en
// cuota gratuita (miles de solicitudes/día). Podés cambiarlo si querés
// más calidad de respuesta a cambio de menos cuota diaria.
const GEMINI_MODEL = 'gemini-2.0-flash-lite';

// Tope de tokens de salida por respuesta: mantiene las respuestas breves
// (más rápidas, más baratas en cuota, y más aptas para un chat flotante).
const MAX_OUTPUT_TOKENS = 220;

// El "cerebro" del asistente: quién es, qué sabe, y cómo debe responder.
// Ajustá este texto libremente para reflejar mejor tu forma de trabajar.
const SYSTEM_INSTRUCTION = `Sos el asistente virtual del portfolio de Axel Salomon, desarrollador web freelance.

Información sobre Axel y sus servicios:
- Ofrece desarrollo web a medida: diseño, frontend, backend, e-commerce, SEO/performance, y soporte post-lanzamiento.
- Portfolio con proyectos reales en rubros de salud/bienestar, hotelería, coaching/eventos, negocios/real estate y educación online.
- Trabaja con WordPress, WooCommerce, y también desarrollo a medida en HTML/CSS/JavaScript puro (sin frameworks pesados) cuando el proyecto lo requiere.
- El contacto principal para presupuestos es el formulario de la sección "Contacto" del sitio, o WhatsApp.
- Puede coordinar también trabajo de identidad de marca en conjunto con otros profesionales, aunque no es su especialidad principal.

Reglas de respuesta:
- Respondé siempre en español, con un tono cercano pero profesional.
- Sé conciso: máximo 3-4 oraciones por respuesta, salvo que te pidan explícitamente más detalle.
- Si preguntan por precios exactos, aclará que depende del proyecto y sugerí completar el formulario de contacto o escribir por WhatsApp para un presupuesto a medida.
- Si preguntan algo que no tiene que ver con desarrollo web, el portfolio, o los servicios de Axel, respondé amablemente que no podés ayudar con eso y redirigí la conversación a en qué sí podés ayudar.
- Nunca inventes datos que no tengas (precios exactos, plazos exactos, tecnologías que no se mencionan acá). Si no sabés algo puntual, decilo y sugerí preguntarle directo a Axel.`;

/* -----------------------------------------------------------------------
   2. LÓGICA DEL PROXY (en general no hace falta tocar esto)
   ----------------------------------------------------------------------- */

function corsHeaders(origin){
    const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

export default {
    async fetch(request, env){
        const origin = request.headers.get('Origin') || '';

        // Preflight de CORS (el navegador lo manda antes del POST real)
        if(request.method === 'OPTIONS'){
            return new Response(null, { headers: corsHeaders(origin) });
        }

        if(request.method !== 'POST'){
            return new Response(JSON.stringify({ error: 'Método no permitido' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
            });
        }

        // Solo aceptar pedidos desde los orígenes permitidos
        if(!ALLOWED_ORIGINS.includes(origin)){
            return new Response(JSON.stringify({ error: 'Origen no autorizado' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
            });
        }

        try{
            const body = await request.json();
            const history = Array.isArray(body.history) ? body.history : [];

            if(history.length === 0){
                return new Response(JSON.stringify({ error: 'Falta el mensaje' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
                });
            }

            // Convertir el historial del chat al formato que espera Gemini
            const contents = history.map(turn => ({
                role: turn.role === 'user' ? 'user' : 'model',
                parts: [{ text: String(turn.text || '').slice(0, 1000) }], // tope defensivo por mensaje
            }));

            const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

            const geminiResponse = await fetch(geminiURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
                    contents,
                    generationConfig: {
                        maxOutputTokens: MAX_OUTPUT_TOKENS,
                        temperature: 0.7,
                    },
                }),
            });

            if(!geminiResponse.ok){
                const errText = await geminiResponse.text();
                console.error('Error de Gemini:', geminiResponse.status, errText);

                // Si se agotó la cuota gratuita diaria, avisamos con un mensaje claro
                if(geminiResponse.status === 429){
                    return new Response(JSON.stringify({
                        reply: 'El asistente alcanzó su límite de uso gratuito por hoy. Escribime directo por WhatsApp mientras tanto 🙂'
                    }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
                    });
                }

                return new Response(JSON.stringify({ error: 'Error al consultar Gemini' }), {
                    status: 502,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
                });
            }

            const data = await geminiResponse.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
                || 'No pude generar una respuesta esta vez. Probá reformular tu pregunta.';

            return new Response(JSON.stringify({ reply }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
            });

        } catch(err){
            console.error('Error inesperado en el proxy:', err);
            return new Response(JSON.stringify({ error: 'Error interno del proxy' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
            });
        }
    },
};
