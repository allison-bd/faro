/* ============================================================
   E3 — Carta de despedida al problema (contra-documento,
   White & Epston / Beyebach). Si la persona ya hizo la
   externalización (C3), el nombre del problema se sugiere solo.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };
    var datos = {};

    /* Nombre desde C3 si existe */
    var externalizacion = Faro.Store.get("c3-externalizacion", null);
    if (externalizacion && externalizacion.nombre) {
        $("campo-nombre").value = externalizacion.nombre;
        $("nombre-sugerido").textContent = "Usamos el nombre que le diste en el ejercicio de externalización. Puedes cambiarlo.";
        $("nombre-sugerido").classList.remove("hidden");
    }

    $("btn-1").addEventListener("click", function () {
        var nombre = $("campo-nombre").value.trim();
        if (!nombre) return;
        datos.nombre = nombre;
        Faro.Screens.show("s-2");
    });

    document.querySelectorAll("[data-siguiente]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            Faro.Screens.show(btn.getAttribute("data-siguiente"));
        });
    });

    var cartaTexto = "";

    $("btn-terminar").addEventListener("click", function () {
        datos.hecho = $("campo-hecho").value.trim();
        datos.porque = $("campo-porque").value.trim();
        datos.quiero = $("campo-quiero").value.trim();
        datos.despido = $("campo-despido").value.trim();

        var lineas = ["Querida/o " + datos.nombre + ":"];
        if (datos.hecho) lineas.push("\nDurante este tiempo, me has hecho " + datos.hecho + ".");
        if (datos.porque) lineas.push("\nPero ya no necesito que estés, porque " + datos.porque + ".");
        if (datos.quiero) lineas.push("\nLo que quiero para mi vida ahora es " + datos.quiero + ".");
        if (datos.despido) lineas.push("\nMe despido porque " + datos.despido + ".");
        lineas.push("\nAdiós.");
        cartaTexto = lineas.join("");

        $("carta-completa").textContent = cartaTexto;
        Faro.Screens.show("s-carta");
    });

    $("btn-guardar").addEventListener("click", function () {
        Faro.Store.push("album", {
            tipo: "carta-despedida",
            titulo: "Carta de despedida a " + datos.nombre,
            texto: cartaTexto,
            fecha: new Date().toISOString()
        }, 200);
        Faro.Util.trackToolUse("e3", "Carta de despedida");
        $("guardado").classList.remove("hidden");
    });

    $("btn-de-nuevo").addEventListener("click", function () {
        ["campo-hecho", "campo-porque", "campo-quiero", "campo-despido"].forEach(function (id) { $(id).value = ""; });
        $("guardado").classList.add("hidden");
        Faro.Screens.show("s-1");
    });
})();
