/* ============================================================
   D3 — 3 Alternativas
   La visión de túnel se rompe generando obligatoriamente 3
   explicaciones distintas. El botón no se activa hasta que las
   3 estén escritas (el 3 es intencional: establece un patrón).
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };
    var negativa = "";

    $("btn-1").addEventListener("click", function () {
        negativa = $("campo-negativa").value.trim();
        if (!negativa) return;
        Faro.Screens.show("s-2");
    });

    /* El botón se habilita solo con las 3 alternativas llenas */
    var campos = ["campo-alt1", "campo-alt2", "campo-alt3"];
    function verificar() {
        var completas = campos.every(function (id) { return $(id).value.trim().length > 0; });
        var btn = $("btn-2");
        btn.disabled = !completas;
        btn.style.opacity = completas ? "1" : "0.5";
    }
    campos.forEach(function (id) {
        $(id).addEventListener("input", verificar);
    });

    $("btn-ayuda").addEventListener("click", function () {
        $("ayudas").classList.toggle("hidden");
    });

    $("btn-2").addEventListener("click", function () {
        var interpretaciones = [
            { texto: negativa, esNegativa: true },
            { texto: $("campo-alt1").value.trim(), esNegativa: false },
            { texto: $("campo-alt2").value.trim(), esNegativa: false },
            { texto: $("campo-alt3").value.trim(), esNegativa: false }
        ];

        var cont = $("tarjetas-interpretaciones");
        cont.innerHTML = "";
        interpretaciones.forEach(function (interp, i) {
            var card = document.createElement("button");
            card.className = "faro-option-card w-full p-4 text-left";
            card.innerHTML =
                '<span class="text-xs font-semibold uppercase tracking-wide block" style="color: var(--faro-text-muted);">' +
                (i === 0 ? "Tu interpretación automática" : "Alternativa " + i) + "</span>" +
                '<span class="text-base text-base-content">' + Faro.Util.escapeHtml(interp.texto) + "</span>";
            card.addEventListener("click", function () {
                cont.querySelectorAll(".faro-option-card").forEach(function (c) { c.classList.remove("selected"); });
                card.classList.add("selected");

                var reflexion = $("reflexion-final");
                if (interp.esNegativa) {
                    reflexion.textContent = "Elegiste la interpretación automática. Puede ser la correcta — pero ahora sabes que hay al menos 3 lecturas más, igual de posibles.";
                } else {
                    reflexion.textContent = "Elegiste una alternativa como la más probable. Fíjate: la que te habías creído automáticamente era la negativa. Tu primera interpretación no siempre es la más realista.";
                }
                reflexion.classList.remove("hidden");

                Faro.Store.push("d3-registros", {
                    fecha: new Date().toISOString(),
                    negativa: negativa,
                    alternativas: [interpretaciones[1].texto, interpretaciones[2].texto, interpretaciones[3].texto],
                    elegida: interp.texto
                }, 200);
                Faro.Util.trackToolUse("d3", "3 Alternativas");
            });
            cont.appendChild(card);
        });

        Faro.Screens.show("s-final");
    });

    $("btn-otra").addEventListener("click", function () {
        $("campo-negativa").value = "";
        campos.forEach(function (id) { $(id).value = ""; });
        $("reflexion-final").classList.add("hidden");
        verificar();
        Faro.Screens.show("s-1");
    });
})();
