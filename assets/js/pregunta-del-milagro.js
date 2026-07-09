/* ============================================================
   E2 — Pregunta del milagro (de Shazer, Beyebach)
   Construye una visión concreta y observable de la vida sin el
   problema. La pantalla 6 es el puente entre imaginación y
   acción: conecta el milagro con las excepciones reales.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    document.querySelectorAll("[data-siguiente]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            Faro.Screens.show(btn.getAttribute("data-siguiente"));
        });
    });

    var resumenTexto = "";

    $("btn-terminar").addEventListener("click", function () {
        var esc = Faro.Util.escapeHtml;
        var partes = [];
        var despertar = $("campo-despertar").value.trim();
        var manana = $("campo-manana").value.trim();
        var persona = $("campo-persona").value.trim();
        var dia = $("campo-dia").value.trim();
        var puente = $("campo-puente").value.trim();

        if (despertar) partes.push("Al despertar, lo primero diferente sería: " + despertar + ".");
        if (manana) partes.push("Durante la mañana: " + manana + ".");
        if (persona) partes.push("La primera persona en notarlo: " + persona + ".");
        if (dia) partes.push("Y en el resto del día: " + dia + ".");
        resumenTexto = partes.join(" ");

        var html = "<p>" + esc(resumenTexto) + "</p>";
        if (puente) {
            html += '<p class="font-medium" style="color: var(--color-success);">Y hay algo de esto que YA está pasando: ' +
                esc(puente) + ". El milagro no parte de cero.</p>";
        }
        $("resumen-milagro").innerHTML = html || "<p>No escribiste nada esta vez. Puedes volver cuando quieras.</p>";
        Faro.Screens.show("s-final");
    });

    $("btn-guardar").addEventListener("click", function () {
        Faro.Store.push("album", {
            tipo: "milagro",
            titulo: "Mi vida después del milagro",
            texto: resumenTexto,
            fecha: new Date().toISOString()
        }, 200);
        Faro.Util.trackToolUse("e2", "Pregunta del milagro");
        $("guardado").classList.remove("hidden");
    });
})();
