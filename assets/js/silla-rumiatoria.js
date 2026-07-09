/* ============================================================
   D8 — Silla rumiatoria (Isebaert, en Beyebach)
   La clave es la ELECCIÓN: rumiar deliberadamente 10 minutos o
   hacer otra cosa. Ambas salidas son control. La extensión de
   10 minutos extra se permite UNA sola vez.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    var TOTAL_SEG = 10 * 60;
    var CIRC = 578;
    var restante = TOTAL_SEG;
    var intervalo = null;
    var extensionUsada = false;

    $("btn-rumiar").addEventListener("click", function () {
        extensionUsada = false;
        iniciarTimer();
        Faro.Util.trackToolUse("d8", "Silla rumiatoria");
    });

    $("btn-otra-cosa").addEventListener("click", function () {
        Faro.Util.trackToolUse("d8", "Silla rumiatoria");
        Faro.Screens.show("s-cierre-otra");
    });

    function iniciarTimer() {
        restante = TOTAL_SEG;
        pintar();
        Faro.Screens.show("s-timer");
        clearInterval(intervalo);
        intervalo = setInterval(function () {
            restante--;
            pintar();
            if (restante <= 0) {
                clearInterval(intervalo);
                Faro.Util.vibrate([200, 100, 200]);
                alSonar();
            }
        }, 1000);
    }

    function pintar() {
        var m = Math.floor(restante / 60);
        var s = restante % 60;
        $("tiempo").textContent = m + ":" + String(s).padStart(2, "0");
        $("anillo").style.strokeDashoffset = String(CIRC * (1 - restante / TOTAL_SEG));
    }

    function alSonar() {
        /* La extensión solo se ofrece la primera vez */
        $("btn-diez-mas").style.display = extensionUsada ? "none" : "";
        Faro.Screens.show("s-decidir");
    }

    $("btn-parar").addEventListener("click", function () {
        Faro.Screens.show("s-cierre-paro");
    });

    $("btn-diez-mas").addEventListener("click", function () {
        extensionUsada = true;
        iniciarTimer();
    });
})();
