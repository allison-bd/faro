/* ============================================================
   C3 — Ejercicio de externalización (White & Epston)
   El problema deja de ser identidad ("soy ansioso") y pasa a
   ser un personaje con nombre. El nombre elegido se reutiliza
   en la Carta de despedida (E3).
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };
    var datos = {};

    $("btn-1").addEventListener("click", function () {
        var nombre = $("campo-nombre").value.trim();
        if (!nombre) return;
        datos.nombre = nombre;
        document.querySelectorAll(".nombre-problema").forEach(function (el) {
            el.textContent = nombre;
        });
        Faro.Screens.show("s-2");
    });

    document.querySelectorAll("[data-siguiente]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            Faro.Screens.show(btn.getAttribute("data-siguiente"));
        });
    });

    document.querySelectorAll("#chips-fuerza .faro-chip").forEach(function (chip) {
        chip.addEventListener("click", function () { chip.classList.toggle("selected"); });
    });

    $("btn-terminar").addEventListener("click", function () {
        datos.dice = $("campo-dice").value.trim();
        datos.intenta = $("campo-intenta").value.trim();
        datos.fuerza = [];
        document.querySelectorAll("#chips-fuerza .faro-chip.selected").forEach(function (c) {
            datos.fuerza.push(c.textContent);
        });
        var otro = $("campo-fuerza-otro").value.trim();
        if (otro) datos.fuerza.push(otro);
        datos.pierde = $("campo-pierde").value.trim();
        datos.debilitan = $("campo-debilitan").value.trim();
        datos.decir = $("campo-decir").value.trim();

        var partes = ["Has llamado a tu problema " + datos.nombre + "."];
        if (datos.fuerza.length) partes.push("Aparece más " + datos.fuerza.map(function (f) { return f.toLowerCase(); }).join(", ") + ".");
        if (datos.pierde) partes.push("Pierde fuerza cuando " + minuscula(datos.pierde) + ".");
        if (datos.debilitan) partes.push("Las cosas que ya haces y que lo debilitan son: " + minuscula(datos.debilitan) + ".");
        if (datos.decir) partes.push("Y lo que le dirías directamente es: “" + datos.decir + "”.");
        $("texto-resumen").textContent = partes.join(" ");

        Faro.Screens.show("s-resumen");
    });

    function minuscula(t) {
        return t.charAt(0).toLowerCase() + t.slice(1);
    }

    $("btn-guardar").addEventListener("click", function () {
        datos.fecha = new Date().toISOString();
        Faro.Store.set("c3-externalizacion", datos);
        Faro.Store.push("album", {
            tipo: "externalizacion",
            titulo: "Externalización: " + datos.nombre,
            texto: $("texto-resumen").textContent,
            fecha: datos.fecha
        }, 200);
        Faro.Util.trackToolUse("c3", "Ejercicio de externalización");
        $("guardado").classList.remove("hidden");
    });
})();
