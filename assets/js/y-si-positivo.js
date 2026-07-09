/* ============================================================
   D4 — "¿Y si...?" Positivo
   Inversión del catastrofismo: pesimista (automático) →
   optimista (opuesto) → realista (probable). Tres escenarios
   lado a lado diluyen la certeza del único futuro temido.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };
    var datos = {};

    $("btn-1").addEventListener("click", function () {
        datos.pesimista = $("campo-pesimista").value.trim();
        if (!datos.pesimista) return;
        Faro.Screens.show("s-2");
    });

    $("btn-2").addEventListener("click", function () {
        datos.optimista = $("campo-optimista").value.trim();
        if (!datos.optimista) return;
        Faro.Screens.show("s-3");
    });

    $("btn-3").addEventListener("click", function () {
        datos.realista = $("campo-realista").value.trim();
        if (!datos.realista) return;

        $("texto-pesimista").textContent = datos.pesimista;
        $("texto-optimista").textContent = datos.optimista;
        $("texto-realista").textContent = datos.realista;

        Faro.Store.push("d4-registros", {
            fecha: new Date().toISOString(),
            pesimista: datos.pesimista,
            optimista: datos.optimista,
            realista: datos.realista
        }, 200);
        Faro.Util.trackToolUse("d4", "¿Y si...? Positivo");

        Faro.Screens.show("s-final");
    });

    document.querySelectorAll(".escenario").forEach(function (card) {
        card.addEventListener("click", function () {
            var tipo = card.getAttribute("data-tipo");
            var r = $("respuesta-final");
            if (tipo === "pesimista") {
                r.textContent = "Estabas viviendo el escenario pesimista como si fuera un hecho. Pero es solo uno de tres — y no el más probable.";
            } else if (tipo === "optimista") {
                r.textContent = "Interesante: estabas contando con el mejor escenario. Tener presente el realista te prepara sin quitarte la esperanza.";
            } else {
                r.textContent = "Estabas parado/a en el realista. Ese es justo el lugar desde donde se pueden tomar decisiones con calma.";
            }
            r.classList.remove("hidden");
        });
    });

    $("btn-otro").addEventListener("click", function () {
        ["campo-pesimista", "campo-optimista", "campo-realista"].forEach(function (id) { $(id).value = ""; });
        $("respuesta-final").classList.add("hidden");
        Faro.Screens.show("s-1");
    });
})();
