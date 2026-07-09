/* ============================================================
   D2 — Escala de la catástrofe (magnificación, Burns)
   Calificar la gravedad sentida, examinar la evidencia,
   recalificar. Ver el número bajar es terapéutico; el historial
   hace evidente el patrón "siempre baja".
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

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

        Faro.Store.push("d2-registros", {
            fecha: new Date().toISOString(),
            situacion: $("campo-situacion").value.trim(),
            sentida: sentida,
            evaluada: evaluada
        }, 200);
        Faro.Util.trackToolUse("d2", "Escala de la catástrofe");

        $("num-sentida").textContent = sentida;
        $("num-evaluada").textContent = evaluada;
        setTimeout(function () {
            $("barra-sentida").style.height = Math.max(sentida * 10, 4) + "%";
            $("barra-evaluada").style.height = Math.max(evaluada * 10, 4) + "%";
        }, 300);

        var dif = sentida - evaluada;
        var msj;
        if (dif > 0) {
            msj = "Tu percepción emocional: " + sentida + ". Tu evaluación con evidencia: " + evaluada +
                ". Diferencia: " + dif + " punto" + (dif === 1 ? "" : "s") + ". La catástrofe se achicó al mirarla de frente.";
        } else if (dif === 0) {
            msj = "Tu percepción emocional y tu evaluación con evidencia coinciden: " + sentida + ". Que lo hayas examinado ya es distinto a solo sentirlo.";
        } else {
            msj = "Esta vez la evidencia te pareció más seria que la emoción. Si la situación es realmente grave, buscar apoyo concreto es el paso que sigue.";
        }
        $("mensaje-final").textContent = msj;
        Faro.Screens.show("s-final");
    });

    $("btn-otra").addEventListener("click", function () {
        $("campo-situacion").value = "";
        ["campo-ev1", "campo-ev2", "campo-ev3"].forEach(function (id) { $(id).value = ""; });
        $("barra-sentida").style.height = "0";
        $("barra-evaluada").style.height = "0";
        Faro.Screens.show("s-1");
    });

    /* ---------- Historial: el patrón "siempre baja" ---------- */
    $("link-historial").addEventListener("click", mostrarHistorial);
    $("btn-historial-2").addEventListener("click", mostrarHistorial);

    function mostrarHistorial() {
        var registros = Faro.Store.get("d2-registros", []);
        $("historial-vacio").classList.toggle("hidden", registros.length > 0);

        var bajaron = registros.filter(function (r) { return r.evaluada < r.sentida; }).length;
        var patron = $("patron-baja");
        if (registros.length >= 3 && bajaron >= registros.length * 0.7) {
            patron.textContent = "En " + bajaron + " de " + registros.length +
                " situaciones, la gravedad bajó al mirarla con evidencia. Tu percepción en caliente tiende a exagerar — y ahora tienes los datos.";
            patron.classList.remove("hidden");
        } else {
            patron.classList.add("hidden");
        }

        var cont = $("lista-registros");
        cont.innerHTML = "";
        registros.slice().reverse().slice(0, 15).forEach(function (r) {
            var div = document.createElement("div");
            div.className = "faro-option-card p-4";
            div.innerHTML =
                '<p class="text-sm" style="color: var(--faro-text-muted);">' + Faro.Util.formatDate(r.fecha) + "</p>" +
                '<p class="font-medium text-base-content mt-1">' + Faro.Util.escapeHtml(r.situacion || "Sin descripción") + "</p>" +
                '<p class="text-base mt-1" style="color: var(--faro-text-secondary);">Sentida: ' + r.sentida + " → Evaluada: " + r.evaluada + "</p>";
            cont.appendChild(div);
        });

        Faro.Screens.show("s-historial");
    }
})();
