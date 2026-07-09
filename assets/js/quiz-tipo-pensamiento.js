/* ============================================================
   C2 — Quiz "¿Qué tipo de pensamiento te atrapa?"
   Los 5 tipos de duda patológica de Nardone, presentados como
   personajes (no diagnósticos). Resultado con manejo de empates
   y herramienta sugerida por tipo.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    function svg(contenido) {
        return '<svg width="72" height="72" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + contenido + "</svg>";
    }

    var TIPOS = [
        {
            id: "inquisidor", nombre: "El Inquisidor",
            escenario: "Después de una conversación normal, tu mente empieza: \"¿Por qué dijiste eso? Fue una estupidez. Seguro piensa que eres idiota.\"",
            descripcion: "Revisa todo lo que dijiste e hiciste buscando errores. Su juicio nunca termina, y siempre te encuentra culpable.",
            ilustracion: svg('<rect x="18" y="8" width="12" height="10" rx="2" transform="rotate(-30 24 13)"/><path d="M20 19L14 36"/><rect x="8" y="36" width="14" height="4" rx="2"/>'),
            enlaces: [
                { href: "cuestionamiento-socratico.html", texto: "Cuestionamiento socrático" },
                { href: "defusion-cognitiva.html", texto: "Defusión cognitiva" }
            ]
        },
        {
            id: "saboteador", nombre: "El Saboteador",
            escenario: "Te ofrecen un nuevo trabajo. Pasas semanas analizando pros y contras. Cada argumento genera un contraargumento. El plazo pasa y no decides.",
            descripcion: "Analiza cada opción hasta que decidir se vuelve imposible. El exceso de análisis es su trampa: parece prudencia, pero paraliza.",
            ilustracion: svg('<path d="M24 8v6M24 14l-11 5v3h22v-3z" /><path d="M13 22c0 4-2 6-5 6 3 0 5 2 5 6M35 22c0 4 2 6 5 6-3 0-5 2-5 6" opacity="0.7"/><path d="M24 14v22M16 40h16"/>'),
            enlaces: [
                { href: "constructor-de-objetivos.html", texto: "Constructor de objetivos" },
                { href: "clasificador-dudas.html", texto: "Clasificador decidible/indecidible" }
            ]
        },
        {
            id: "perseguidor", nombre: "El Perseguidor",
            escenario: "Te ascienden. En vez de alegrarte: \"No soy capaz. Van a descubrir que no sé lo que hago.\"",
            descripcion: "Convierte cada logro en una amenaza: tarde o temprano \"descubrirán\" que no eres suficiente. Nunca deja que lo ganado se disfrute.",
            ilustracion: svg('<circle cx="24" cy="17" r="9"/><path d="M18 15c1-2 3-3 6-3M15 33c2-4 5-6 9-6s7 2 9 6" opacity="0.8"/><path d="M33 10l6-2-2 6" opacity="0.6"/><path d="M10 40h28"/>'),
            enlaces: [
                { href: "quiz-fortalezas.html", texto: "Quiz de fortalezas" },
                { href: "y-si-positivo.html", texto: "\"¿Y si...?\" positivo" }
            ]
        },
        {
            id: "delegador", nombre: "El Delegador",
            escenario: "Antes de comprar algo, preguntas a 3 personas. Antes de responder un correo, se lo muestras a alguien. No puedes elegir qué cenar sin consultar.",
            descripcion: "Te convence de que tu criterio no basta y te hace consultar cada decisión con otros. Cada consulta debilita un poco más tu confianza.",
            ilustracion: svg('<circle cx="14" cy="14" r="5"/><circle cx="34" cy="14" r="5"/><circle cx="24" cy="34" r="6"/><path d="M17 18l5 11M31 18l-5 11" stroke-dasharray="3 3"/>'),
            enlaces: [
                { href: "brujula-de-valores.html", texto: "Brújula de valores" }
            ]
        },
        {
            id: "catastrofista", nombre: "El Catastrofista",
            escenario: "Tu hijo sale con amigos. Tu mente construye: \"¿Y si tiene un accidente? ¿Y si le ofrecen drogas?\" Escenarios cada vez peores, uno tras otro.",
            descripcion: "Encadena escenarios cada vez peores. Cada \"¿y si...?\" alimenta al siguiente, como una bola de nieve que crece cuesta abajo.",
            ilustracion: svg('<circle cx="15" cy="12" r="4"/><circle cx="25" cy="22" r="6" opacity="0.85"/><circle cx="32" cy="36" r="9" opacity="0.7"/><path d="M8 44l32-2" opacity="0.5"/>'),
            enlaces: [
                { href: "escala-catastrofe.html", texto: "Escala de la catástrofe" },
                { href: "probabilidad-real.html", texto: "Probabilidad real" }
            ]
        }
    ];

    var idx = 0;
    var puntajes = {};

    $("btn-empezar").addEventListener("click", function () {
        idx = 0;
        puntajes = {};
        pintarTipo();
        Faro.Screens.show("s-tipo");
        Faro.Util.trackToolUse("c2", "Quiz tipo de pensamiento");
    });

    function pintarTipo() {
        var t = TIPOS[idx];
        $("tipo-posicion").textContent = (idx + 1) + " de " + TIPOS.length;
        $("tipo-ilustracion").innerHTML = t.ilustracion;
        $("tipo-nombre").textContent = t.nombre;
        $("tipo-escenario").textContent = t.escenario;
        $("tipo-descripcion").textContent = t.descripcion;
    }

    document.querySelectorAll(".tipo-respuesta").forEach(function (btn) {
        btn.addEventListener("click", function () {
            puntajes[TIPOS[idx].id] = parseInt(btn.getAttribute("data-puntos"), 10);
            idx++;
            if (idx < TIPOS.length) {
                var pantalla = $("s-tipo");
                pantalla.classList.remove("active");
                void pantalla.offsetWidth;
                pantalla.classList.add("active");
                pintarTipo();
            } else {
                mostrarResultado();
            }
        });
    });

    function mostrarResultado() {
        var max = 0;
        TIPOS.forEach(function (t) { if (puntajes[t.id] > max) max = puntajes[t.id]; });
        var ganadores = TIPOS.filter(function (t) { return puntajes[t.id] === max && max > 0; });

        var titulo = $("resultado-titulo");
        var detalle = $("resultado-detalle");
        var enlaces = $("resultado-enlaces");
        detalle.innerHTML = "";
        enlaces.innerHTML = "";

        if (ganadores.length === 0) {
            titulo.textContent = "Ningún patrón parece dominarte";
            detalle.innerHTML = '<p class="faro-instruction text-center" style="color: var(--faro-text-secondary);">Eso es buena señal. Si algún día notas que tu mente da demasiadas vueltas, vuelve aquí para identificar quién habla.</p>';
        } else if (ganadores.length === 1) {
            titulo.textContent = "Tu patrón principal parece ser: " + ganadores[0].nombre;
        } else {
            titulo.textContent = "Parece que tienes dos patrones activos: " +
                ganadores.slice(0, 2).map(function (g) { return g.nombre; }).join(" y ");
        }

        ganadores.slice(0, 2).forEach(function (g) {
            detalle.innerHTML += '<div class="faro-option-card p-4">' +
                '<p class="font-semibold text-primary">' + g.nombre + "</p>" +
                '<p class="text-base" style="color: var(--faro-text-secondary);">' + g.descripcion + "</p></div>";
            g.enlaces.forEach(function (e) {
                enlaces.innerHTML += '<a href="' + e.href + '" class="faro-btn-big faro-btn-primary">' + e.texto + "</a>";
            });
        });

        if (ganadores.length > 0) {
            Faro.Store.set("c2-resultado", {
                fecha: new Date().toISOString(),
                tipos: ganadores.map(function (g) { return g.nombre; })
            });
        }
        Faro.Screens.show("s-resultado");
    }

    $("btn-repetir").addEventListener("click", function () {
        Faro.Screens.show("s-entrada");
    });
})();
