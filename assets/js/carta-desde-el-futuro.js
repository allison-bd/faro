/* ============================================================
   E4 — Carta desde el futuro (Yvonne Dolan, en Beyebach)
   El yo futuro que ya superó el problema le escribe al yo
   presente. Variante "Mensaje triple": pasado (compasión),
   presente (reconocimiento), futuro (compromiso).
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };
    var modo = null;       /* "carta" | "triple" */
    var tiempo = "";
    var resultadoTexto = "";
    var resultadoTitulo = "";

    /* ---------- Entrada ---------- */
    $("btn-carta").addEventListener("click", function () {
        modo = "carta";
        Faro.Screens.show("s-tiempo");
    });

    $("btn-triple").addEventListener("click", function () {
        modo = "triple";
        Faro.Screens.show("s-triple");
    });

    /* ---------- Flujo carta: elegir el tiempo ---------- */
    document.querySelectorAll(".opcion-tiempo").forEach(function (btn) {
        btn.addEventListener("click", function () {
            tiempo = btn.getAttribute("data-tiempo");
            $("apertura-carta").textContent =
                "Querido/a yo del presente, te escribo desde " + tiempo + " en el futuro...";
            Faro.Screens.show("s-carta-flujo");
        });
    });

    $("btn-generar-carta").addEventListener("click", function () {
        var sepas = $("campo-sepas").value.trim();
        var ayudo = $("campo-ayudo").value.trim();
        var cualidad = $("campo-cualidad").value.trim();
        var dicho = $("campo-dicho").value.trim();

        var lineas = ["Querido/a yo del presente:", "\nTe escribo desde " + tiempo + " en el futuro."];
        if (sepas) lineas.push("\nLo que quiero que sepas es que " + minuscula(sepas) + ".");
        if (ayudo) lineas.push("\nLo que me ayudó fue " + minuscula(ayudo) + ".");
        if (cualidad) lineas.push("\nLa cualidad tuya que más te sirvió fue " + minuscula(cualidad) + ".");
        if (dicho) lineas.push("\nLo que desearía haberte dicho en ese momento es " + minuscula(dicho) + ".");
        lineas.push("\nCon cariño,\ntu yo de " + tiempo + " más adelante.");

        resultadoTexto = lineas.join("");
        resultadoTitulo = "Carta desde " + tiempo + " en el futuro";
        mostrarResultado();
    });

    /* ---------- Flujo mensaje triple ---------- */
    $("btn-generar-triple").addEventListener("click", function () {
        var pasado = $("campo-pasado").value.trim();
        var presente = $("campo-presente").value.trim();
        var futuro = $("campo-futuro").value.trim();

        var lineas = [];
        if (pasado) lineas.push("Querido/a yo del pasado:\n" + pasado);
        if (presente) lineas.push("\nQuerido/a yo del presente:\n" + presente);
        if (futuro) lineas.push("\nQuerido/a yo del futuro:\n" + futuro);
        if (lineas.length === 0) return;

        resultadoTexto = lineas.join("\n");
        resultadoTitulo = "Mensaje triple";
        mostrarResultado();
    });

    function minuscula(t) {
        return t.charAt(0).toLowerCase() + t.slice(1);
    }

    function mostrarResultado() {
        $("titulo-resultado").textContent = resultadoTitulo;
        $("texto-resultado").textContent = resultadoTexto;
        $("guardado").classList.add("hidden");
        $("btn-guardar").disabled = false;
        $("btn-guardar").style.opacity = "1";
        Faro.Screens.show("s-resultado");
    }

    /* ---------- Guardar en el Álbum de logros ---------- */
    $("btn-guardar").addEventListener("click", function () {
        Faro.Store.push("album", {
            tipo: modo === "carta" ? "carta-futuro" : "mensaje-triple",
            titulo: resultadoTitulo,
            texto: resultadoTexto,
            fecha: new Date().toISOString()
        }, 200);
        Faro.Util.trackToolUse("e4", "Carta desde el futuro");
        $("guardado").classList.remove("hidden");
        $("btn-guardar").disabled = true;
        $("btn-guardar").style.opacity = "0.5";
    });

    $("btn-otra").addEventListener("click", function () {
        ["campo-sepas", "campo-ayudo", "campo-cualidad", "campo-dicho",
         "campo-pasado", "campo-presente", "campo-futuro"].forEach(function (id) {
            $(id).value = "";
        });
        Faro.Screens.show("s-entrada");
    });
})();
