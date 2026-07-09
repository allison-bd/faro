/* ============================================================
   E6 — Ejercicio de fantasía del futuro (Nardone)
   Escritura libre sobre 7 años adelante, sin lógica ni
   evaluación de posibilidad. El timer es solo referencia,
   nunca obligación. Se guarda en el Álbum.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    /* ---------- Timer opcional de referencia ---------- */
    var minutos = 10;
    var restante = minutos * 60;
    var intervalo = null;

    $("chk-timer").addEventListener("change", function () {
        $("control-timer").classList.toggle("hidden", !this.checked);
        if (this.checked) {
            iniciarTimer();
        } else {
            clearInterval(intervalo);
        }
    });

    document.querySelectorAll(".opcion-min").forEach(function (chip) {
        chip.addEventListener("click", function () {
            document.querySelectorAll(".opcion-min").forEach(function (c) { c.classList.remove("selected"); });
            chip.classList.add("selected");
            minutos = parseInt(chip.getAttribute("data-min"), 10);
            iniciarTimer();
        });
    });

    function iniciarTimer() {
        clearInterval(intervalo);
        restante = minutos * 60;
        pintar();
        intervalo = setInterval(function () {
            if (restante > 0) {
                restante--;
                pintar();
            } else {
                clearInterval(intervalo);
            }
        }, 1000);
    }

    function pintar() {
        var m = Math.floor(restante / 60);
        var s = restante % 60;
        $("tiempo-ref").textContent = m + ":" + String(s).padStart(2, "0");
    }

    /* ---------- Guardar en el Álbum ---------- */
    $("btn-guardar").addEventListener("click", function () {
        var texto = $("campo-fantasia").value.trim();
        if (!texto) return;

        Faro.Store.push("album", {
            tipo: "fantasia-futuro",
            titulo: "Dónde me veo en 7 años",
            texto: texto,
            fecha: new Date().toISOString()
        }, 200);
        Faro.Util.trackToolUse("e6", "Fantasía del futuro");

        clearInterval(intervalo);
        Faro.Screens.show("s-cierre");
    });

    $("btn-releer").addEventListener("click", function () {
        Faro.Screens.show("s-escritura");
    });
})();
