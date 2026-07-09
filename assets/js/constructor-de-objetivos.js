/* ============================================================
   E1 — Constructor de objetivos (Beyebach, objetivos bien formados)
   4 chequeos: positivo (qué SÍ quieres), concreto (señal visible),
   pequeño (7 días), interaccional (alguien lo notaría).
   El chequeo de positividad solo aparece si el texto está
   formulado en negativo.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };
    var datos = {};

    /* Detección de formulación negativa */
    var PATRONES_NEGATIVOS = /\b(dejar de|deje de|no m[aá]s|evitar|evita|no quiero|no sentir|no tener|no pensar|no estar|sin ansiedad|sin miedo)\b/i;

    $("btn-1").addEventListener("click", function () {
        var deseo = $("campo-deseo").value.trim();
        if (!deseo) return;
        datos.original = deseo;

        if (PATRONES_NEGATIVOS.test(deseo)) {
            Faro.Screens.show("s-2");   /* necesita reformularse en positivo */
        } else {
            datos.positivo = deseo;      /* ya es positivo: se salta la pantalla */
            Faro.Screens.show("s-3");
        }
    });

    $("btn-2").addEventListener("click", function () {
        var positivo = $("campo-positivo").value.trim();
        if (!positivo) return;
        datos.positivo = positivo;
        Faro.Screens.show("s-3");
    });

    $("btn-3").addEventListener("click", function () {
        datos.senal = $("campo-senal").value.trim();
        Faro.Screens.show("s-4");
    });

    /* Chequeo de tamaño */
    $("btn-4-si").addEventListener("click", function () {
        datos.pasoPequeno = null;
        Faro.Screens.show("s-5");
    });
    $("btn-4-no").addEventListener("click", function () {
        $("bloque-paso-pequeno").classList.remove("hidden");
    });
    $("btn-4-paso").addEventListener("click", function () {
        var paso = $("campo-paso").value.trim();
        if (!paso) return;
        datos.pasoPequeno = paso;
        Faro.Screens.show("s-5");
    });

    $("btn-5").addEventListener("click", function () {
        datos.quienNotaria = $("campo-quien").value.trim();
        pintarRefinado();
        Faro.Screens.show("s-final");
    });

    function pintarRefinado() {
        var esc = Faro.Util.escapeHtml;
        var objetivo = datos.pasoPequeno || datos.positivo;
        var html = '<p class="font-display text-xl text-base-content">' + esc(objetivo) + "</p>";
        if (datos.pasoPequeno) {
            html += '<p class="text-base" style="color: var(--faro-text-secondary);"><strong>Primer paso de algo más grande:</strong> ' + esc(datos.positivo) + "</p>";
        }
        if (datos.senal) {
            html += '<p class="text-base" style="color: var(--faro-text-secondary);"><strong>Sabrás que va bien cuando:</strong> ' + esc(datos.senal) + "</p>";
        }
        if (datos.quienNotaria) {
            html += '<p class="text-base" style="color: var(--faro-text-secondary);"><strong>Quién lo notaría:</strong> ' + esc(datos.quienNotaria) + "</p>";
        }
        $("objetivo-refinado").innerHTML = html;
    }

    $("btn-guardar").addEventListener("click", function () {
        Faro.Store.push("e1-compromisos", {
            fecha: new Date().toISOString(),
            original: datos.original,
            objetivo: datos.pasoPequeno || datos.positivo,
            senal: datos.senal,
            quienNotaria: datos.quienNotaria
        }, 100);
        Faro.Util.trackToolUse("e1", "Constructor de objetivos");
        $("guardado").classList.remove("hidden");
    });
})();
