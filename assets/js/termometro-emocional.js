/* ============================================================
   B2 — Termómetro emocional (escala 0-10)
   La pieza central es la pregunta adaptativa: la herramienta
   responde distinto según dónde se ubique la persona
   (Cade & O'Hanlon, Beyebach).
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    /* Lógica adaptativa por rango — textos exactos del catálogo */
    function preguntaPara(valor) {
        if (valor <= 2) return {
            texto: "Estás pasando un momento muy difícil. ¿Cómo has logrado seguir adelante a pesar de todo?",
            crisis: true
        };
        if (valor <= 4) return { texto: "No estás en tu mejor momento, pero estás aquí. ¿Qué necesitarías para subir un punto?" };
        if (valor <= 6) return { texto: "¿Qué cosas te han ayudado a estar aquí y no más abajo?" };
        if (valor <= 8) return { texto: "Vas bien. ¿Qué hiciste para llegar aquí?" };
        return { texto: "¿Qué aprendiste de estos buenos días que puedas usar cuando vengan días difíciles?" };
    }

    var slider = $("slider-animo");

    function refrescarPregunta() {
        var valor = parseInt(slider.value, 10);
        $("valor-animo").textContent = valor;
        var caja = $("pregunta-adaptativa");
        caja.classList.add("cambiando");
        setTimeout(function () {
            var p = preguntaPara(valor);
            $("texto-pregunta").textContent = p.texto;
            $("enlaces-crisis").classList.toggle("hidden", !p.crisis);
            caja.classList.remove("cambiando");
        }, 250);
    }

    slider.addEventListener("input", function () {
        $("valor-animo").textContent = slider.value;
    });
    slider.addEventListener("change", refrescarPregunta);
    refrescarPregunta();

    /* ---------- Guardar ---------- */
    $("btn-guardar").addEventListener("click", function () {
        var valor = parseInt(slider.value, 10);
        Faro.Store.push("b2-registros", {
            fecha: new Date().toISOString(),
            valor: valor,
            respuesta: $("respuesta").value.trim()
        }, 400);
        Faro.Util.trackToolUse("b2", "Termómetro emocional");

        $("confirmacion").textContent = "Registrado. Volver mañana también cuenta.";
        $("confirmacion").classList.remove("hidden");
        $("respuesta").value = "";
    });

    /* ---------- Historial ---------- */
    $("btn-historial").addEventListener("click", function () {
        pintarHistorial();
        Faro.Screens.show("s-historial");
    });
    $("btn-volver").addEventListener("click", function () {
        Faro.Screens.show("s-registro");
    });

    function pintarHistorial() {
        var registros = Faro.Store.get("b2-registros", []);
        var svg = $("grafico-linea");
        var sinDatos = $("sin-datos");
        var msj = $("mensaje-cambio");
        msj.classList.add("hidden");

        if (registros.length < 2) {
            svg.parentElement.classList.add("hidden");
            sinDatos.classList.remove("hidden");
        } else {
            svg.parentElement.classList.remove("hidden");
            sinDatos.classList.add("hidden");
            dibujarLinea(svg, registros.slice(-30));
            mensajeDeCambio(registros);
        }
        pintarLista(registros);
    }

    /* Mensaje contextual SOLO si hay mejora (si no, no se dice nada negativo) */
    function mensajeDeCambio(registros) {
        var hoy = registros[registros.length - 1];
        var hace14 = null;
        var limite = Date.now() - 14 * 86400000;
        for (var i = 0; i < registros.length; i++) {
            if (new Date(registros[i].fecha).getTime() >= limite) { hace14 = registros[i]; break; }
        }
        if (!hace14 || hace14 === hoy) return;

        var dias = Math.round((new Date(hoy.fecha) - new Date(hace14.fecha)) / 86400000);
        if (hoy.valor > hace14.valor && dias >= 3) {
            var cuando = dias >= 12 ? "Hace 2 semanas" : "Hace " + dias + " días";
            var msj = $("mensaje-cambio");
            msj.textContent = cuando + " estabas en " + hace14.valor + ". Hoy estás en " + hoy.valor + ". Eso es un cambio real.";
            msj.classList.remove("hidden");
        }
    }

    /* Línea suave (curva con puntos de control simples) */
    function dibujarLinea(svg, datos) {
        var W = 560, H = 180, PAD = 16;
        var n = datos.length;
        var puntos = datos.map(function (r, i) {
            return {
                x: PAD + (W - 2 * PAD) * (n === 1 ? 0.5 : i / (n - 1)),
                y: H - PAD - (H - 2 * PAD) * (r.valor / 10)
            };
        });

        var d = "M " + puntos[0].x + " " + puntos[0].y;
        for (var i = 1; i < n; i++) {
            var xm = (puntos[i - 1].x + puntos[i].x) / 2;
            d += " C " + xm + " " + puntos[i - 1].y + ", " + xm + " " + puntos[i].y + ", " + puntos[i].x + " " + puntos[i].y;
        }

        svg.innerHTML =
            '<line x1="' + PAD + '" y1="' + (H - PAD) + '" x2="' + (W - PAD) + '" y2="' + (H - PAD) + '" stroke="var(--faro-border)" stroke-width="1.5"/>' +
            '<line x1="' + PAD + '" y1="' + PAD + '" x2="' + (W - PAD) + '" y2="' + PAD + '" stroke="var(--faro-border-subtle)" stroke-width="1" stroke-dasharray="4 4"/>' +
            '<path d="' + d + '" fill="none" stroke="var(--color-primary)" stroke-width="3" stroke-linecap="round"/>' +
            puntos.map(function (p) {
                return '<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="var(--color-accent)"/>';
            }).join("");
    }

    function pintarLista(registros) {
        var cont = $("lista-animo");
        cont.innerHTML = "";
        registros.slice().reverse().slice(0, 10).forEach(function (r) {
            var div = document.createElement("div");
            div.className = "faro-option-card p-4";
            div.innerHTML =
                '<p class="font-semibold text-primary">' + r.valor + "/10 · " +
                '<span class="font-normal text-sm" style="color: var(--faro-text-muted);">' + Faro.Util.formatDateTime(r.fecha) + "</span></p>" +
                (r.respuesta ? '<p class="text-base mt-1" style="color: var(--faro-text-secondary);">' + Faro.Util.escapeHtml(r.respuesta) + "</p>" : "");
            cont.appendChild(div);
        });
    }
})();
