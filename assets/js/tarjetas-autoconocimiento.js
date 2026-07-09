/* ============================================================
   C8 — Tarjetas de autoconocimiento
   Preguntas aleatorias, sin estructura ni compromiso. La
   aleatoriedad evita la anticipación; el álbum acumula
   autoconocimiento sin resistencia.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    var BANCO = {
        "Emociones": [
            "Nombra 3 cosas que te provoquen enojo",
            "¿Cuándo fue la última vez que lloraste y por qué?",
            "¿Qué te genera calma?",
            "¿Cómo actúas cuando estás nervioso/a?",
            "¿Qué emoción te cuesta más expresar?",
            "¿Qué te hace reír sin falta?",
            "¿Dónde sientes la tristeza en tu cuerpo?",
            "¿Qué haces cuando algo te frustra?"
        ],
        "Identidad": [
            "Descríbete en 3 palabras",
            "¿Cómo te describiría tu mejor amigo/a?",
            "¿Qué te hace diferente a la mayoría de la gente?",
            "Si no tuvieras miedo, ¿qué harías?",
            "¿Qué opinión tuya ha cambiado en los últimos años?",
            "¿Qué parte de ti te gustaría que más gente conociera?",
            "¿En qué momento del día eres más tú?",
            "¿Qué te define mejor: lo que piensas, lo que sientes o lo que haces?"
        ],
        "Recursos": [
            "Nombra 3 logros propios",
            "¿Qué se te da bien?",
            "¿Qué haces solo por ti mismo/a?",
            "¿En qué momento reciente fuiste valiente?",
            "¿Qué has superado que antes creías imposible?",
            "¿Qué habilidad tuya sorprende a los demás?",
            "¿Qué consejo das seguido... que también te sirve a ti?",
            "¿Qué te ayuda a levantarte cuando estás en el suelo?"
        ],
        "Relaciones": [
            "¿A quién llamarías a las 3 AM?",
            "¿Qué valoras más de las personas?",
            "¿Cómo demuestras cariño?",
            "¿Qué necesitas de los demás?",
            "¿Quién te conoce de verdad?",
            "¿Qué relación te gustaría cuidar más?",
            "¿Qué aprendiste de alguien que ya no está en tu vida?",
            "¿A quién le debes un gracias que todavía no has dado?"
        ]
    };

    var preguntaActual = null;
    var usadas = [];

    function preguntaAleatoria() {
        var todas = [];
        Object.keys(BANCO).forEach(function (cat) {
            BANCO[cat].forEach(function (p) {
                todas.push({ categoria: cat, pregunta: p });
            });
        });
        var disponibles = todas.filter(function (p) { return usadas.indexOf(p.pregunta) === -1; });
        if (disponibles.length === 0) { usadas = []; disponibles = todas; }
        var elegida = disponibles[Math.floor(Math.random() * disponibles.length)];
        usadas.push(elegida.pregunta);
        return elegida;
    }

    var tarjeta = $("tarjeta");

    function nuevaPregunta() {
        preguntaActual = preguntaAleatoria();
        /* voltear de vuelta, cambiar contenido, voltear */
        tarjeta.classList.remove("volteada");
        setTimeout(function () {
            $("categoria-tarjeta").textContent = preguntaActual.categoria;
            $("pregunta-tarjeta").textContent = preguntaActual.pregunta;
            tarjeta.classList.add("volteada");
            $("zona-respuesta").classList.remove("hidden");
            $("campo-respuesta").value = "";
            $("guardado").classList.add("hidden");
        }, 380);
    }

    tarjeta.addEventListener("click", function () {
        if (!tarjeta.classList.contains("volteada")) nuevaPregunta();
    });
    tarjeta.setAttribute("role", "button");
    tarjeta.setAttribute("tabindex", "0");
    tarjeta.addEventListener("keydown", function (e) {
        if ((e.key === "Enter" || e.key === " ") && !tarjeta.classList.contains("volteada")) {
            e.preventDefault();
            nuevaPregunta();
        }
    });

    $("btn-otra").addEventListener("click", nuevaPregunta);
    $("btn-saltar").addEventListener("click", nuevaPregunta);

    $("btn-guardar").addEventListener("click", function () {
        var respuesta = $("campo-respuesta").value.trim();
        if (!respuesta || !preguntaActual) return;
        Faro.Store.push("c8-album", {
            fecha: new Date().toISOString(),
            categoria: preguntaActual.categoria,
            pregunta: preguntaActual.pregunta,
            respuesta: respuesta
        }, 500);
        Faro.Util.trackToolUse("c8", "Tarjetas de autoconocimiento");
        $("guardado").classList.remove("hidden");
    });

    /* ---------- Álbum agrupado por categoría ---------- */
    $("btn-album").addEventListener("click", function () {
        var album = Faro.Store.get("c8-album", []);
        $("album-vacio").classList.toggle("hidden", album.length > 0);

        var porCategoria = {};
        album.forEach(function (e) {
            if (!porCategoria[e.categoria]) porCategoria[e.categoria] = [];
            porCategoria[e.categoria].push(e);
        });

        var cont = $("album-contenido");
        cont.innerHTML = "";
        Object.keys(BANCO).forEach(function (cat) {
            if (!porCategoria[cat]) return;
            var seccion = document.createElement("div");
            seccion.innerHTML = '<h3 class="font-semibold text-lg text-primary mb-2">' + cat + "</h3>";
            porCategoria[cat].slice().reverse().forEach(function (e) {
                var div = document.createElement("div");
                div.className = "faro-option-card p-4 mb-2";
                div.innerHTML =
                    '<p class="font-medium text-base-content">' + Faro.Util.escapeHtml(e.pregunta) + "</p>" +
                    '<p class="text-base mt-1" style="color: var(--faro-text-secondary);">' + Faro.Util.escapeHtml(e.respuesta) + "</p>" +
                    '<p class="text-xs mt-1" style="color: var(--faro-text-muted);">' + Faro.Util.formatDate(e.fecha) + "</p>";
                seccion.appendChild(div);
            });
            cont.appendChild(seccion);
        });

        Faro.Screens.show("s-album");
    });

    $("btn-volver").addEventListener("click", function () {
        Faro.Screens.show("s-juego");
    });
})();
