/* ============================================================
   D7 — Media hora rumiatoria / peor fantasía
   Prescripción paradójica (Nardone, Burns, Beyebach): 30 minutos
   dedicados DELIBERADAMENTE a preocuparse. Dos variantes:
   - Peor fantasía: ojos cerrados, provocarse el peor miedo.
   - Escritura rumiatoria: escribir sin filtro; ritual de cierre
     con lectura en voz alta y borrado opcional.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    var TOTAL_SEG = 30 * 60;
    var CIRC = 578; /* 2πr con r=92 */

    var variante = null;
    var restante = TOTAL_SEG;
    var intervalo = null;

    $("btn-fantasia").addEventListener("click", function () { iniciar("fantasia"); });
    $("btn-escritura").addEventListener("click", function () { iniciar("escritura"); });

    function iniciar(v) {
        variante = v;
        restante = TOTAL_SEG;

        if (v === "fantasia") {
            $("instruccion-sesion").textContent =
                "Cierra los ojos. Intenta provocarte el peor miedo que puedas imaginar. Si no logras sentir miedo, está bien — es lo que le pasa a la mayoría.";
            $("campo-escritura").classList.add("hidden");
        } else {
            $("instruccion-sesion").textContent =
                "Escribe todo lo negativo que se te ocurra. No filtres, no ordenes, no edites. Si se agotan las ideas antes de los 30 minutos, quédate sentado/a mirando la pantalla.";
            $("campo-escritura").classList.remove("hidden");
            $("campo-escritura").value = "";
        }

        Faro.Screens.show("s-sesion");
        pintarTiempo();
        clearInterval(intervalo);
        intervalo = setInterval(tic, 1000);
    }

    function tic() {
        restante--;
        pintarTiempo();
        if (restante <= 0) {
            clearInterval(intervalo);
            Faro.Util.vibrate([200, 100, 200]);
            terminarSesion();
        }
    }

    function pintarTiempo() {
        var m = Math.floor(restante / 60);
        var s = restante % 60;
        $("tiempo-restante").textContent = m + ":" + String(s).padStart(2, "0");
        /* el anillo se vacía a medida que pasa la media hora */
        $("anillo-timer").style.strokeDashoffset = String(CIRC * (1 - restante / TOTAL_SEG));
    }

    $("btn-detener").addEventListener("click", function () {
        clearInterval(intervalo);
        terminarSesion();
    });

    function terminarSesion() {
        if (variante === "fantasia") {
            Faro.Screens.show("s-fin-fantasia");
        } else {
            $("ritual-leer").classList.remove("hidden");
            $("ritual-borrar").classList.add("hidden");
            $("ritual-fin").classList.add("hidden");
            Faro.Screens.show("s-fin-escritura");
        }
    }

    /* ---------- Cierre fantasía ---------- */
    $("btn-guardar-fantasia").addEventListener("click", function () {
        guardarSesion($("nota-fantasia").value.trim());
        $("btn-guardar-fantasia").textContent = "Sesión guardada";
        $("btn-guardar-fantasia").disabled = true;
    });

    /* ---------- Ritual de cierre de escritura ---------- */
    $("leer-si").addEventListener("click", pasarABorrar);
    $("leer-no").addEventListener("click", pasarABorrar);

    function pasarABorrar() {
        $("ritual-leer").classList.add("hidden");
        $("ritual-borrar").classList.remove("hidden");
    }

    $("borrar-si").addEventListener("click", function () {
        $("campo-escritura").value = "";
        finalizarRitual("Borrado. Lo que escribiste ya cumplió su función: salir de tu cabeza.");
    });
    $("borrar-no").addEventListener("click", function () {
        finalizarRitual("Conservado. A veces releerlo después, en frío, muestra cuánto exagera la mente.");
    });

    function finalizarRitual(mensaje) {
        $("ritual-borrar").classList.add("hidden");
        $("mensaje-ritual").textContent = mensaje;
        $("ritual-fin").classList.remove("hidden");
    }

    $("btn-guardar-escritura").addEventListener("click", function () {
        guardarSesion($("nota-escritura").value.trim());
        $("btn-guardar-escritura").textContent = "Sesión guardada";
        $("btn-guardar-escritura").disabled = true;
    });

    function guardarSesion(nota) {
        Faro.Store.push("d7-sesiones", {
            fecha: new Date().toISOString(),
            variante: variante === "fantasia" ? "Peor fantasía" : "Escritura rumiatoria",
            minutos: Math.round((TOTAL_SEG - restante) / 60),
            nota: nota
        }, 200);
        Faro.Util.trackToolUse("d7", "Media hora rumiatoria");
    }

    /* ---------- Registro ---------- */
    $("btn-registro").addEventListener("click", function () {
        var sesiones = Faro.Store.get("d7-sesiones", []);
        $("registro-vacio").classList.toggle("hidden", sesiones.length > 0);
        var cont = $("lista-sesiones");
        cont.innerHTML = "";
        sesiones.slice().reverse().forEach(function (s) {
            var div = document.createElement("div");
            div.className = "faro-option-card p-4";
            div.innerHTML =
                '<p class="font-medium text-base-content">' + s.variante + " · " + s.minutos + " min</p>" +
                '<p class="text-sm" style="color: var(--faro-text-muted);">' + Faro.Util.formatDateTime(s.fecha) + "</p>" +
                (s.nota ? '<p class="text-base mt-1" style="color: var(--faro-text-secondary);">' + Faro.Util.escapeHtml(s.nota) + "</p>" : "");
            cont.appendChild(div);
        });
        Faro.Screens.show("s-registro");
    });

    $("btn-volver").addEventListener("click", function () {
        Faro.Screens.show("s-entrada");
    });
})();
