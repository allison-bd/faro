/* ============================================================
   C4 — Cuestionamiento socrático (14 preguntas)
   Burns (evidencia) + Beyebach (escalas, afrontamiento) +
   psicología positiva (fortalezas). La persona genera su propia
   evidencia contradictoria — el cambio viene de adentro.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    /* Las 14 preguntas exactas del catálogo. tipo: campo | slider */
    var PREGUNTAS = [
        { texto: "¿Qué pruebas tienes A FAVOR de que este pensamiento sea verdad?", tipo: "campo" },
        { texto: "¿Qué pruebas tienes EN CONTRA?", tipo: "campo" },
        { texto: "Del 0 al 10, ¿cuánto te crees este pensamiento ahora mismo?", tipo: "slider", clave: "inicial" },
        { texto: "¿Qué es lo PEOR que podría pasar?", tipo: "campo" },
        { texto: "¿Y lo MEJOR?", tipo: "campo" },
        { texto: "¿Qué es lo que PROBABLEMENTE va a pasar?", tipo: "campo" },
        { texto: "¿Cómo te afecta emocionalmente esperar lo peor?", tipo: "campo" },
        { texto: "¿Cómo te ayuda enfrentar la situación esperando lo peor?", tipo: "campo" },
        { texto: "¿Cómo te ayudaría enfrentarla con una mente más realista?", tipo: "campo" },
        { texto: "Si lo peor pasara, ¿podrías aguantarlo?", tipo: "campo" },
        { texto: "¿De qué otra manera podrías ver esta situación?", tipo: "campo" },
        { texto: "¿Hay cualidades en ti que estás pasando por alto?", tipo: "campo" },
        { texto: "¿Qué le dirías a tu mejor amigo/a si estuviera en tu situación?", tipo: "campo" },
        { texto: "Ahora, ¿cuál sería una evaluación más realista? Del 0 al 10, ¿cuánto te la crees?", tipo: "slider", clave: "final" }
    ];

    var pensamiento = "";
    var idx = 0;
    var respuestas = [];
    var creencias = { inicial: null, final: null };

    $("btn-empezar").addEventListener("click", function () {
        pensamiento = $("campo-pensamiento").value.trim();
        if (!pensamiento) return;
        idx = 0;
        respuestas = [];
        creencias = { inicial: null, final: null };
        pintarPregunta();
        Faro.Screens.show("s-pregunta");
    });

    $("slider-creencia").addEventListener("input", function () {
        $("valor-slider").textContent = this.value;
    });

    function pintarPregunta() {
        var p = PREGUNTAS[idx];
        $("num-pregunta").textContent = "Pregunta " + (idx + 1) + " de 14";
        $("eco-pensamiento").textContent = "“" + pensamiento + "”";
        $("texto-pregunta").textContent = p.texto;
        $("campo-respuesta").classList.toggle("hidden", p.tipo !== "campo");
        $("bloque-slider").classList.toggle("hidden", p.tipo !== "slider");
        $("campo-respuesta").value = "";
        $("slider-creencia").value = 5;
        $("valor-slider").textContent = "5";
        /* repintar el relleno del slider tras el reset programático */
        $("slider-creencia").dispatchEvent(new Event("input"));

        /* re-animar */
        var pantalla = $("s-pregunta");
        pantalla.classList.remove("active");
        void pantalla.offsetWidth;
        pantalla.classList.add("active");
    }

    $("btn-siguiente").addEventListener("click", function () {
        var p = PREGUNTAS[idx];
        if (p.tipo === "slider") {
            creencias[p.clave] = parseInt($("slider-creencia").value, 10);
            respuestas.push(creencias[p.clave]);
        } else {
            respuestas.push($("campo-respuesta").value.trim());
        }
        idx++;
        if (idx < PREGUNTAS.length) {
            pintarPregunta();
        } else {
            mostrarFinal();
        }
    });

    function mostrarFinal() {
        $("final-pensamiento").textContent = "“" + pensamiento + "”";
        $("num-inicial").textContent = creencias.inicial + "/10";
        $("num-final").textContent = creencias.final + "/10";
        setTimeout(function () {
            $("barra-inicial").style.height = Math.max(creencias.inicial * 10, 4) + "%";
            $("barra-final").style.height = Math.max(creencias.final * 10, 4) + "%";
        }, 300);

        var msj = $("mensaje-final");
        var defusion = $("enlace-defusion");
        if (creencias.final < creencias.inicial) {
            var dif = creencias.inicial - creencias.final;
            msj.textContent = "Tu evaluación bajó de " + creencias.inicial + " a " + creencias.final +
                ". Eso significa que al examinar la evidencia, el pensamiento perdió " + dif + " punto" + (dif === 1 ? "" : "s") + " de credibilidad.";
            defusion.classList.add("hidden");
        } else {
            msj.textContent = "A veces los pensamientos son persistentes. Eso no significa que sean verdaderos — significa que son fuertes. Prueba una herramienta de defusión para cambiar tu relación con el pensamiento en vez de intentar cambiarlo.";
            defusion.classList.remove("hidden");
        }

        Faro.Store.push("c4-registros", {
            fecha: new Date().toISOString(),
            pensamiento: pensamiento,
            inicial: creencias.inicial,
            final: creencias.final
        }, 200);
        Faro.Util.trackToolUse("c4", "Cuestionamiento socrático");
        Faro.Screens.show("s-final");
    }

    $("btn-otro").addEventListener("click", function () {
        $("campo-pensamiento").value = "";
        $("barra-inicial").style.height = "0";
        $("barra-final").style.height = "0";
        Faro.Screens.show("s-entrada");
    });

    /* ---------- Historial ---------- */
    $("btn-historial").addEventListener("click", function () {
        var registros = Faro.Store.get("c4-registros", []);
        $("historial-vacio").classList.toggle("hidden", registros.length > 0);
        var cont = $("lista-historial");
        cont.innerHTML = "";
        registros.slice().reverse().forEach(function (r) {
            var div = document.createElement("div");
            div.className = "faro-option-card p-4";
            div.innerHTML =
                '<p class="text-sm" style="color: var(--faro-text-muted);">' + Faro.Util.formatDate(r.fecha) + "</p>" +
                '<p class="font-medium text-base-content mt-1">“' + Faro.Util.escapeHtml(r.pensamiento) + "”</p>" +
                '<p class="text-base mt-1" style="color: var(--faro-text-secondary);">Credibilidad: ' + r.inicial + " → " + r.final + "</p>";
            cont.appendChild(div);
        });
        Faro.Screens.show("s-historial");
    });

    $("btn-volver").addEventListener("click", function () {
        Faro.Screens.show("s-entrada");
    });
})();
