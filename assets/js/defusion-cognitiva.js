/* ============================================================
   C5 — Defusión cognitiva (ACT, Hayes & Twohig)
   11 técnicas. Cada una se APLICA en pantalla al pensamiento
   que escribió la persona — no es teoría, es experiencia.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };
    var esc = function (t) { return Faro.Util.escapeHtml(t); };
    var pensamiento = "";
    var tecnicaActual = null;

    /* aplicar(p) devuelve el HTML que pone la técnica en práctica */
    var TECNICAS = [
        {
            id: 1, nombre: "Tu mente como objeto externo",
            linea: "Tu mente no eres tú: es algo que puedes observar.",
            aplicar: function (p) {
                return frase("Dite a ti mismo/a:") +
                    grande("“Ahí está mi mente otra vez, preocupándose.”") +
                    frase("Y mira lo que dice, desde afuera:") +
                    tarjeta("Tu mente dice: “" + esc(p) + "”");
            }
        },
        {
            id: 2, nombre: "Agradecerle a tu mente",
            linea: "Responder con amabilidad irónica le baja el volumen.",
            aplicar: function (p) {
                return tarjeta("Tu mente dice: “" + esc(p) + "”") +
                    grande("“¡Gran trabajo de preocupación hoy! ¡Gracias por la idea!”") +
                    frase("Tu mente hace lo que fue diseñada para hacer. Solo que lo hace de más.");
            }
        },
        {
            id: 3, nombre: "Aceptar el contenido",
            linea: "Dejar de pelear también es una opción.",
            aplicar: function (p) {
                return tarjeta("“" + esc(p) + "”") +
                    grande("¿Puedes simplemente decirle “ok, está bien que estés ahí” a este pensamiento, sin pelearlo?");
            }
        },
        {
            id: 4, nombre: "Lenguaje de observador",
            linea: "Cambiar el lenguaje crea distancia.",
            aplicar: function (p) {
                return frase("En vez de vivirlo desde adentro, obsérvalo:") +
                    grande("“Me estoy dando cuenta de que estoy teniendo este pensamiento: " + esc(p) + "”");
            }
        },
        {
            id: 5, nombre: "“Estoy teniendo el pensamiento de que...”",
            linea: "Las mismas palabras, una experiencia distinta.",
            aplicar: function (p) {
                return grande("Estoy teniendo el pensamiento de que " + esc(minuscula(p))) +
                    frase("Léelo un par de veces. Son las mismas palabras — pero ya no son una sentencia: son un evento mental.");
            }
        },
        {
            id: 6, nombre: "Pensamientos como anuncios",
            linea: "Están ahí, los ves, pero no necesitas hacer clic.",
            aplicar: function (p) {
                return frase("Imagina que tus pensamientos negativos son los anuncios que aparecen mientras navegas:") +
                    '<div id="banner-anuncio" class="p-5 text-left">' +
                    '<button id="cerrar-banner" class="absolute top-2 right-3 text-xl font-bold" aria-label="Cerrar anuncio" style="color: var(--faro-text-muted);">✕</button>' +
                    '<p class="text-xs uppercase tracking-wide" style="color: var(--faro-text-muted);">Publicidad</p>' +
                    '<p class="font-semibold text-base-content mt-1">' + esc(p) + "</p>" +
                    "</div>" +
                    frase("Puedes cerrarlo. O dejarlo ahí y seguir navegando tu día.");
            },
            despues: function () {
                var btn = document.getElementById("cerrar-banner");
                if (btn) btn.addEventListener("click", function () {
                    document.getElementById("banner-anuncio").classList.add("cerrado");
                });
            }
        },
        {
            id: 7, nombre: "Tu mente como contestadora",
            linea: "Puedes escuchar el mensaje sin devolver la llamada.",
            aplicar: function (p) {
                return tarjeta("📞 “Hola, soy tu mente. ¿Te acuerdas de que tienes que preocuparte hoy? Te dejo el mensaje: " + esc(minuscula(p)) + "”") +
                    grande("Puedes escuchar el mensaje sin devolver la llamada.");
            }
        },
        {
            id: 8, nombre: "Pedir MÁS pensamientos negativos",
            linea: "Al pedir más, el pensamiento pierde fuerza (paradoja).",
            aplicar: function (p) {
                return tarjeta("Tu mente dice: “" + esc(p) + "”") +
                    grande("“¿Es todo lo que tienes? Dame más. Hazlo peor.”") +
                    '<textarea id="campo-peores" class="faro-textarea" placeholder="Intenta escribir versiones aún peores..."></textarea>' +
                    frase("La mayoría no puede — y le da risa. Esa risa es la defusión funcionando.");
            }
        },
        {
            id: 9, nombre: "Cantar el pensamiento",
            linea: "Es difícil tomar en serio algo que suena chistoso.",
            aplicar: function (p) {
                return frase("Ahora cántalo con la melodía del cumpleaños feliz:") +
                    grande("🎵 " + esc(p) + " 🎵") +
                    frase("Si prefieres, usa cualquier canción que te parezca ridícula. En voz alta funciona mejor.");
            }
        },
        {
            id: 10, nombre: "Escribirlo en una etiqueta",
            linea: "Llevarlo puesto hasta que pierda poder.",
            aplicar: function (p) {
                return frase("Escribe tu peor autoevaluación en una etiqueta y llévala puesta un día. Sin explicar a nadie.") +
                    '<div class="inline-block px-6 py-3 rounded-lg font-semibold text-lg" style="background: var(--faro-warning-bg); color: var(--color-warning); border: 2px solid var(--color-warning); transform: rotate(-2deg);">' + esc(p) + "</div>" +
                    frase("Cuando sientas que ya no tiene poder sobre ti, quítatela.");
            }
        },
        {
            id: 11, nombre: "Pensar y hacer lo contrario",
            linea: "La acción demuestra que el pensamiento no es una orden.",
            aplicar: function (p) {
                return tarjeta("Tu mente dice: “" + esc(p) + "”") +
                    grande("Haz deliberadamente lo contrario, ahora, aunque sea en pequeño.") +
                    frase("Si dice “no puedo moverme”, muévete. Si dice “no puedo hablar”, habla. La acción contradice el pensamiento.");
            }
        }
    ];

    function frase(t) { return '<p class="faro-instruction" style="color: var(--faro-text-secondary);">' + t + "</p>"; }
    function grande(t) { return '<p class="font-display text-2xl leading-snug text-base-content">' + t + "</p>"; }
    function tarjeta(t) { return '<p class="p-4 rounded-xl text-base text-left" style="background: var(--faro-border-subtle); color: var(--color-base-content);">' + t + "</p>"; }
    function minuscula(t) { return t.charAt(0).toLowerCase() + t.slice(1); }

    /* ---------- Flujo ---------- */
    $("btn-ver-tecnicas").addEventListener("click", function () {
        pensamiento = $("campo-pensamiento").value.trim();
        if (!pensamiento) return;
        pintarCarrusel();
        Faro.Screens.show("s-tecnicas");
        Faro.Util.trackToolUse("c5", "Defusión cognitiva");
    });

    document.querySelectorAll("[data-volver]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            Faro.Screens.show(btn.getAttribute("data-volver"));
        });
    });

    function pintarCarrusel() {
        var favoritas = Faro.Store.get("c5-favoritas", []);
        var cont = $("lista-tecnicas");
        cont.innerHTML = "";

        var ordenadas = TECNICAS.slice().sort(function (a, b) {
            return (favoritas.indexOf(a.id) !== -1 ? 0 : 1) - (favoritas.indexOf(b.id) !== -1 ? 0 : 1);
        });

        ordenadas.forEach(function (t) {
            var esFav = favoritas.indexOf(t.id) !== -1;
            var card = document.createElement("button");
            card.className = "faro-option-card w-full p-4 text-left flex items-center justify-between gap-3";
            card.innerHTML =
                "<span>" +
                '<span class="font-semibold text-primary block">' + t.nombre + "</span>" +
                '<span class="text-sm" style="color: var(--faro-text-secondary);">' + t.linea + "</span>" +
                "</span>" +
                (esFav ? '<svg class="shrink-0 text-primary" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" aria-label="Favorita"><path d="M19 14c1.5-1.5 3-3.2 3-5.2A4.8 4.8 0 0 0 13.6 5l-1.6 1.6L10.4 5A4.8 4.8 0 0 0 2 8.8c0 2 1.5 3.7 3 5.2l7 6.5z"/></svg>' : "");
            card.addEventListener("click", function () { probar(t); });
            cont.appendChild(card);
        });
    }

    function probar(t) {
        tecnicaActual = t;
        $("apl-nombre").textContent = t.nombre;
        $("zona-aplicacion").innerHTML = t.aplicar(pensamiento);
        if (t.despues) t.despues();
        $("bloque-feedback").classList.remove("hidden");
        $("bloque-favorita").classList.add("hidden");
        Faro.Screens.show("s-aplicacion");
    }

    /* ---------- Feedback ---------- */
    $("fb-si").addEventListener("click", function () {
        $("bloque-feedback").classList.add("hidden");
        $("bloque-favorita").classList.remove("hidden");
    });
    $("fb-no").addEventListener("click", function () {
        pintarCarrusel();
        Faro.Screens.show("s-tecnicas");
    });
    $("fb-otra").addEventListener("click", function () {
        pintarCarrusel();
        Faro.Screens.show("s-tecnicas");
    });

    $("fav-si").addEventListener("click", function () {
        var favoritas = Faro.Store.get("c5-favoritas", []);
        if (favoritas.indexOf(tecnicaActual.id) === -1) {
            favoritas.push(tecnicaActual.id);
            Faro.Store.set("c5-favoritas", favoritas);
        }
        pintarCarrusel();
        Faro.Screens.show("s-tecnicas");
    });
    $("fav-no").addEventListener("click", function () {
        pintarCarrusel();
        Faro.Screens.show("s-tecnicas");
    });
})();
