/* ============================================================
   C1 — Identificador de distorsiones cognitivas (Burns)
   Modo educativo: carrusel de las 10 con ejemplos e ilustración.
   Modo aplicado: marcar las trampas presentes en un pensamiento
   propio y recibir la pregunta desafiante específica de cada una.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    function svg(contenido) {
        return '<svg width="72" height="72" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + contenido + "</svg>";
    }

    var DISTORSIONES = [
        {
            id: "todo-nada", nombre: "Todo o nada",
            descripcion: "Ver las cosas en categorías absolutas, sin puntos medios.",
            ejemplos: ['"Si no saco un 7, fue un fracaso"', '"Si no es perfecto, no sirve"'],
            desafio: "¿Hay algún punto medio entre el éxito total y el fracaso total?",
            ilustracion: svg('<circle cx="24" cy="24" r="16"/><path d="M24 8a16 16 0 0 1 0 32z" fill="currentColor" stroke="none" opacity="0.85"/>')
        },
        {
            id: "generalizacion", nombre: "Generalización excesiva",
            descripcion: "Convertir un hecho puntual en un patrón sin fin.",
            ejemplos: ['"Siempre me pasa lo mismo"', '"Nunca voy a poder"'],
            desafio: "¿\"Siempre\" y \"nunca\" son literalmente ciertos? ¿Hubo alguna vez en que fue distinto?",
            ilustracion: svg('<circle cx="12" cy="24" r="3" fill="currentColor"/><circle cx="22" cy="24" r="3" opacity="0.7" fill="currentColor"/><circle cx="32" cy="24" r="3" opacity="0.45" fill="currentColor"/><circle cx="42" cy="24" r="3" opacity="0.25" fill="currentColor"/><path d="M12 15c8-6 22-6 30 0" stroke-dasharray="3 4"/>')
        },
        {
            id: "filtro", nombre: "Filtro mental",
            descripcion: "Quedarse solo con lo negativo, aunque sea una gota entre mucho bueno.",
            ejemplos: ["20 comentarios buenos y 1 malo → solo recuerdas el malo", "Un día completo bien, y solo pesa el mal momento"],
            desafio: "Si hicieras la lista completa —lo bueno y lo malo— ¿qué proporción tendría cada lado?",
            ilustracion: svg('<path d="M14 8h20l-3 30a4 4 0 0 1-4 3h-6a4 4 0 0 1-4-3z"/><circle cx="24" cy="14" r="2.5" fill="currentColor"/><path d="M24 16c-4 8-6 12-6 16a6 6 0 0 0 12 0c0-4-2-8-6-16z" fill="currentColor" opacity="0.35" stroke="none"/>')
        },
        {
            id: "descartar", nombre: "Descartar lo positivo",
            descripcion: "Restarle valor a lo bueno: no cuenta, fue casualidad.",
            ejemplos: ['"Me fue bien, pero fue suerte"', '"Me felicitaron por ser amables, no porque lo hice bien"'],
            desafio: "Si fue \"suerte\", ¿por qué aparece justo cuando tú haces el trabajo?",
            ilustracion: svg('<path d="M24 8l4 8.5 9 1.2-6.5 6.2 1.6 8.9L24 28.5l-8.1 4.3 1.6-8.9L11 17.7l9-1.2z"/><line x1="10" y1="40" x2="38" y2="12" stroke-width="2.5"/>')
        },
        {
            id: "conclusiones", nombre: "Saltar a conclusiones",
            descripcion: "Leer mentes o adivinar el futuro, siempre en negativo.",
            ejemplos: ['"Seguro piensa que soy un idiota" (lectura mental)', '"Va a salir todo mal" (adivinación)'],
            desafio: "¿Cuántas de tus predicciones negativas pasadas se cumplieron realmente?",
            ilustracion: svg('<circle cx="24" cy="22" r="12"/><path d="M17 38h14M20 34h8"/><path d="M20 18q4-4 8 0" opacity="0.6"/>')
        },
        {
            id: "magnificacion", nombre: "Magnificación / minimización",
            descripcion: "Tus errores con lupa, tus logros con telescopio al revés.",
            ejemplos: ["Un error pequeño se siente gigante", "Un logro grande se siente insignificante"],
            desafio: "Si un amigo hiciera exactamente lo mismo, ¿lo verías igual de grave?",
            ilustracion: svg('<circle cx="17" cy="17" r="10"/><line x1="24" y1="24" x2="34" y2="34"/><circle cx="38" cy="38" r="4" opacity="0.5"/>')
        },
        {
            id: "emocional", nombre: "Razonamiento emocional",
            descripcion: "Tratar lo que sientes como prueba de lo que es real.",
            ejemplos: ['"Me siento en peligro, por lo tanto estoy en peligro"', '"Me siento inútil, así que debo serlo"'],
            desafio: "¿Sientes lo mismo cuando estás descansado/a que cuando estás cansado/a? ¿El sentimiento cambia aunque los hechos no?",
            ilustracion: svg('<path d="M22 14c-2-3-6-4-8.5-1.5C10 16 11 20 14 23l8 7 8-7c3-3 4-7 .5-10.5C28 10 24 11 22 14z"/><path d="M36 20h6M36 26h6"/>')
        },
        {
            id: "deberia", nombre: 'Afirmaciones "debería"',
            descripcion: "Reglas rígidas contra ti mismo/a que solo generan culpa.",
            ejemplos: ['"Debería ser más fuerte"', '"No debería sentir esto"'],
            desafio: "¿Quién dictó esa regla? ¿Le exigirías lo mismo a alguien que quieres?",
            ilustracion: svg('<rect x="12" y="8" width="24" height="32" rx="3"/><path d="M17 16h10M17 22h14M17 28h8"/><path d="M31 33l3 3 5-6" stroke-width="2.5"/>')
        },
        {
            id: "etiquetas", nombre: "Poner etiquetas",
            descripcion: "Convertir un hecho puntual en una identidad completa.",
            ejemplos: ['"Soy un fracaso" en vez de "cometí un error"', '"Soy débil" en vez de "hoy me costó"'],
            desafio: "¿Un error te convierte en eso? ¿Qué diría la evidencia completa de quién eres?",
            ilustracion: svg('<path d="M10 24 22 12h14v14L24 38a3 3 0 0 1-4 0l-10-10a3 3 0 0 1 0-4z"/><circle cx="30" cy="18" r="2.5" fill="currentColor"/>')
        },
        {
            id: "inculpacion", nombre: "Inculpación",
            descripcion: "Toda la culpa para ti, o toda para otros.",
            ejemplos: ['"Todo esto es culpa mía"', '"Todo esto es culpa de los demás"'],
            desafio: "¿Qué parte dependía realmente de ti y qué parte no? ¿El 100% es honesto?",
            ilustracion: svg('<circle cx="24" cy="24" r="16"/><path d="M24 8v32" stroke-dasharray="3 4"/><path d="M14 20l6 4-6 4M34 20l-6 4 6 4"/>')
        }
    ];

    /* ---------- Navegación general ---------- */
    document.querySelectorAll("[data-volver]").forEach(function (btn) {
        btn.addEventListener("click", function () { Faro.Screens.show("s-entrada"); });
    });

    /* ---------- MODO EDUCATIVO ---------- */
    var eduIdx = 0;
    var eduRespuestas = {};

    $("btn-educativo").addEventListener("click", function () {
        eduIdx = 0;
        eduRespuestas = {};
        pintarTarjetaEdu();
        Faro.Screens.show("s-educativo");
        Faro.Util.trackToolUse("c1", "Identificador de distorsiones");
    });

    function pintarTarjetaEdu() {
        var d = DISTORSIONES[eduIdx];
        $("edu-posicion").textContent = (eduIdx + 1) + " de " + DISTORSIONES.length;
        $("edu-ilustracion").innerHTML = d.ilustracion;
        $("edu-nombre").textContent = d.nombre;
        $("edu-descripcion").textContent = d.descripcion;
        $("edu-ejemplos").innerHTML = d.ejemplos.map(function (e) {
            return '<p class="text-base italic p-3 rounded-xl" style="background: var(--faro-border-subtle); color: var(--faro-text-secondary);">' + e + "</p>";
        }).join("");
        document.querySelectorAll(".edu-respuesta").forEach(function (c) { c.classList.remove("selected"); });
    }

    document.querySelectorAll(".edu-respuesta").forEach(function (chip) {
        chip.addEventListener("click", function () {
            eduRespuestas[DISTORSIONES[eduIdx].id] = chip.getAttribute("data-nivel");
            eduIdx++;
            if (eduIdx < DISTORSIONES.length) {
                /* re-animar la tarjeta */
                var pantalla = $("s-educativo");
                pantalla.classList.remove("active");
                void pantalla.offsetWidth;
                pantalla.classList.add("active");
                pintarTarjetaEdu();
            } else {
                mostrarResultadoEdu();
            }
        });
    });

    function mostrarResultadoEdu() {
        var mucho = DISTORSIONES.filter(function (d) { return eduRespuestas[d.id] === "mucho"; });
        var aveces = DISTORSIONES.filter(function (d) { return eduRespuestas[d.id] === "aveces"; });
        var principales = mucho.length > 0 ? mucho : aveces;
        var cont = $("edu-resultado");

        if (principales.length === 0) {
            cont.innerHTML = '<p class="faro-instruction text-center" style="color: var(--faro-text-secondary);">No marcaste ninguna como frecuente. Aún así, conocerlas te ayuda a detectarlas cuando aparezcan.</p>';
        } else {
            cont.innerHTML = principales.map(function (d) {
                return '<div class="faro-option-card p-4"><p class="font-semibold text-primary">' + d.nombre + '</p>' +
                    '<p class="text-base" style="color: var(--faro-text-secondary);">' + d.descripcion + "</p></div>";
            }).join("");
            Faro.Store.set("c1-frecuentes", principales.map(function (d) { return d.nombre; }));
        }
        Faro.Screens.show("s-edu-final");
    }

    /* ---------- MODO APLICADO ---------- */
    $("btn-aplicado").addEventListener("click", function () {
        pintarTarjetasAplicado();
        Faro.Screens.show("s-aplicado");
        Faro.Util.trackToolUse("c1", "Identificador de distorsiones");
    });

    function pintarTarjetasAplicado() {
        var cont = $("tarjetas-aplicado");
        cont.innerHTML = "";
        DISTORSIONES.forEach(function (d) {
            var card = document.createElement("button");
            card.className = "faro-option-card p-3 text-left";
            card.setAttribute("data-id", d.id);
            card.innerHTML = '<span class="font-semibold text-primary block text-base">' + d.nombre + "</span>" +
                '<span class="text-sm" style="color: var(--faro-text-secondary);">' + d.descripcion + "</span>";
            card.addEventListener("click", function () { card.classList.toggle("selected"); });
            cont.appendChild(card);
        });
    }

    $("btn-analizar").addEventListener("click", function () {
        var pensamiento = $("campo-pensamiento").value.trim();
        var marcadas = [];
        document.querySelectorAll("#tarjetas-aplicado .selected").forEach(function (c) {
            marcadas.push(c.getAttribute("data-id"));
        });
        if (marcadas.length === 0) return;

        $("eco-pensamiento").textContent = pensamiento ? '"' + pensamiento + '"' : "";
        var cont = $("preguntas-desafio");
        cont.innerHTML = "";
        DISTORSIONES.filter(function (d) { return marcadas.indexOf(d.id) !== -1; }).forEach(function (d) {
            var div = document.createElement("div");
            div.className = "faro-option-card p-4";
            div.innerHTML = '<p class="font-semibold text-primary">' + d.nombre + "</p>" +
                '<p class="faro-instruction mt-1 text-base-content">' + d.desafio + "</p>";
            cont.appendChild(div);
        });
        Faro.Screens.show("s-aplicado-final");
    });
})();
