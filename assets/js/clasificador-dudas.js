/* ============================================================
   D6 — Clasificador decidible/indecidible (Nardone)
   Las dudas decidibles se resuelven con información (→ herramientas
   de evidencia). Las indecidibles no tienen respuesta lógica
   posible (→ defusión / dejar de responder).
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };
    var duda = "";

    $("btn-1").addEventListener("click", function () {
        duda = $("campo-duda").value.trim();
        if (!duda) return;
        $("eco-duda").textContent = "“" + duda + "”";
        Faro.Screens.show("s-2");
    });

    function registrar(tipo) {
        Faro.Store.push("d6-registros", {
            fecha: new Date().toISOString(),
            duda: duda,
            tipo: tipo
        }, 200);
        Faro.Util.trackToolUse("d6", "Clasificador de dudas");
    }

    $("btn-si").addEventListener("click", function () {
        registrar("decidible");
        Faro.Screens.show("s-decidible");
    });

    $("btn-no").addEventListener("click", function () {
        registrar("indecidible");
        Faro.Screens.show("s-indecidible");
    });

    /* "No estoy seguro/a" muestra la ayuda y deja elegir de nuevo */
    $("btn-nose").addEventListener("click", function () {
        $("ayuda").classList.remove("hidden");
    });

    document.querySelectorAll("[data-volver]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            $("campo-duda").value = "";
            $("ayuda").classList.add("hidden");
            Faro.Screens.show("s-1");
        });
    });
})();
