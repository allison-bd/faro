/* ============================================================
   D5 — Probabilidad real (Burns, técnica cuantitativa)
   Del razonamiento emocional ("lo siento, va a pasar") al
   razonamiento con datos. La diferencia entre porcentajes hace
   visible la distorsión.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    $("btn-1").addEventListener("click", function () {
        if (!$("campo-temor").value.trim()) return;
        Faro.Screens.show("s-2");
    });

    document.querySelectorAll("[data-siguiente]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            Faro.Screens.show(btn.getAttribute("data-siguiente"));
        });
    });

    $("slider-sentida").addEventListener("input", function () { $("valor-sentida").textContent = this.value; });
    $("slider-evaluada").addEventListener("input", function () { $("valor-evaluada").textContent = this.value; });

    $("btn-terminar").addEventListener("click", function () {
        var sentida = parseInt($("slider-sentida").value, 10);
        var evaluada = parseInt($("slider-evaluada").value, 10);

        Faro.Store.push("d5-registros", {
            fecha: new Date().toISOString(),
            temor: $("campo-temor").value.trim(),
            sentida: sentida,
            evaluada: evaluada
        }, 200);
        Faro.Util.trackToolUse("d5", "Probabilidad real");

        $("num-sentida").textContent = sentida + "%";
        $("num-evaluada").textContent = evaluada + "%";

        var dif = sentida - evaluada;
        var msj;
        if (dif >= 15) {
            msj = "Tu mente te decía que había un " + sentida + "% de probabilidad. Con la evidencia, parece ser " + evaluada +
                "%. La diferencia entre lo que sientes y lo que sabes es de " + dif + " puntos.";
        } else if (dif > 0) {
            msj = "Sentida: " + sentida + "%. Evaluada: " + evaluada + "%. La diferencia es pequeña, pero existe — y ahora la conoces.";
        } else if (dif === 0) {
            msj = "Tu sensación y tu evaluación coinciden en " + sentida + "%. Haberlo examinado con hechos ya cambia cómo lo cargas.";
        } else {
            msj = "Con la evidencia, la probabilidad te parece mayor de lo que sentías. Si el riesgo es real, planificar qué hacer es más útil que temer.";
        }
        $("mensaje-final").textContent = msj;
        Faro.Screens.show("s-final");
    });

    $("btn-otro").addEventListener("click", function () {
        ["campo-temor", "campo-ev1", "campo-ev2", "campo-ev3"].forEach(function (id) { $(id).value = ""; });
        Faro.Screens.show("s-1");
    });
})();
