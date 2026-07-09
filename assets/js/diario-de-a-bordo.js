/* ============================================================
   A4 — Diario de a bordo (registro DURANTE la crisis)
   Formulario deliberadamente "farragoso" (Nardone): completarlo
   activa la corteza y desactiva la escalada. La comparación
   inicio/fin hace visible el efecto.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };
    var registro = { sintomas: [] };

    /* Fecha y hora se autocompletan — el usuario no hace nada */
    var ahora = new Date();
    $("fecha-hora").textContent =
        ahora.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" }) +
        " · " + ahora.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

    /* Sliders con número grande */
    $("slider-inicial").addEventListener("input", function () {
        $("valor-inicial").textContent = this.value;
    });
    $("slider-final").addEventListener("input", function () {
        $("valor-final").textContent = this.value;
    });

    /* Navegación genérica entre pantallas */
    document.querySelectorAll("[data-siguiente]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            Faro.Screens.show(btn.getAttribute("data-siguiente"));
        });
    });

    /* Pantalla 4: compañía (avanza al elegir) */
    document.querySelectorAll(".opcion-compania").forEach(function (btn) {
        btn.addEventListener("click", function () {
            registro.compania = btn.getAttribute("data-valor");
            Faro.Screens.show("s-5");
        });
    });

    /* Pantalla 6: chips de síntomas */
    document.querySelectorAll("#chips-sintomas .faro-chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
            chip.classList.toggle("selected");
        });
    });

    /* Terminar: guardar y mostrar comparación */
    $("btn-terminar").addEventListener("click", function () {
        registro.fecha = new Date().toISOString();
        registro.inicial = parseInt($("slider-inicial").value, 10);
        registro.final = parseInt($("slider-final").value, 10);
        registro.donde = $("campo-donde").value.trim();
        registro.contexto = $("campo-contexto").value.trim();
        registro.mente = $("campo-mente").value.trim();
        registro.sintomas = [];
        document.querySelectorAll("#chips-sintomas .faro-chip.selected").forEach(function (chip) {
            registro.sintomas.push(chip.textContent);
        });
        var otro = $("campo-otro-sintoma").value.trim();
        if (otro) registro.sintomas.push(otro);

        Faro.Store.push("a4-registros", registro, 300);
        Faro.Util.trackToolUse("a4", "Diario de a bordo");

        var msj = $("mensaje-resultado");
        if (registro.final < registro.inicial) {
            msj.textContent = "Cuando empezaste estabas en " + registro.inicial +
                ". Ahora estás en " + registro.final +
                ". Escribir sobre lo que sientes ayudó a bajar la intensidad.";
            $("enlaces-ayuda").classList.add("hidden");
        } else {
            msj.textContent = "Está bien. A veces toma más tiempo. ¿Quieres probar una herramienta de respiración o grounding?";
            $("enlaces-ayuda").classList.remove("hidden");
        }
        Faro.Screens.show("s-resultado");
    });

    /* ---------- Historial ---------- */
    $("link-historial").addEventListener("click", mostrarHistorial);
    $("btn-ver-historial").addEventListener("click", mostrarHistorial);

    function mostrarHistorial() {
        var registros = Faro.Store.get("a4-registros", []);
        var vacio = $("historial-vacio");
        var contenido = $("historial-contenido");

        if (registros.length === 0) {
            vacio.classList.remove("hidden");
            contenido.classList.add("hidden");
        } else {
            vacio.classList.add("hidden");
            contenido.classList.remove("hidden");
            dibujarBarras(registros);
            detectarPatrones(registros);
            listarRegistros(registros);
        }
        Faro.Screens.show("s-historial");
    }

    /* Barras pareadas: intensidad inicial (clara) vs final (oscura) */
    function dibujarBarras(registros) {
        var cont = $("grafico-barras");
        cont.innerHTML = "";
        registros.slice(-14).forEach(function (r) {
            var par = document.createElement("div");
            par.className = "flex items-end gap-0.5 shrink-0";
            par.title = Faro.Util.formatDateTime(r.fecha) + " — de " + r.inicial + " a " + r.final;

            var b1 = document.createElement("div");
            b1.style.cssText = "width:14px;border-radius:4px 4px 0 0;background:color-mix(in srgb, var(--color-primary) 40%, transparent);height:" + Math.max(r.inicial * 10, 4) + "%";
            var b2 = document.createElement("div");
            b2.style.cssText = "width:14px;border-radius:4px 4px 0 0;background:var(--color-primary);height:" + Math.max(r.final * 10, 4) + "%";

            par.appendChild(b1);
            par.appendChild(b2);
            cont.appendChild(par);
        });
    }

    /* Patrones simples: síntomas más frecuentes y horas recurrentes */
    function detectarPatrones(registros) {
        var cont = $("patrones");
        cont.innerHTML = "";
        if (registros.length < 3) return;

        var frecuencia = {};
        var franjas = { "madrugada (0-6)": 0, "mañana (6-12)": 0, "tarde (12-19)": 0, "noche (19-24)": 0 };

        registros.forEach(function (r) {
            (r.sintomas || []).forEach(function (s) {
                frecuencia[s] = (frecuencia[s] || 0) + 1;
            });
            var h = new Date(r.fecha).getHours();
            if (h < 6) franjas["madrugada (0-6)"]++;
            else if (h < 12) franjas["mañana (6-12)"]++;
            else if (h < 19) franjas["tarde (12-19)"]++;
            else franjas["noche (19-24)"]++;
        });

        var topSintomas = Object.keys(frecuencia).sort(function (a, b) { return frecuencia[b] - frecuencia[a]; }).slice(0, 3);
        var topFranja = Object.keys(franjas).sort(function (a, b) { return franjas[b] - franjas[a]; })[0];

        var html = '<h3 class="font-semibold text-lg text-base-content">Lo que se repite</h3>';
        if (topSintomas.length) {
            html += '<p class="text-base" style="color: var(--faro-text-secondary);">Tus síntomas más frecuentes: <strong>' +
                topSintomas.map(Faro.Util.escapeHtml).join(", ") + "</strong>.</p>";
        }
        if (franjas[topFranja] >= 2) {
            html += '<p class="text-base" style="color: var(--faro-text-secondary);">Tus registros se concentran en la <strong>' +
                topFranja + "</strong>. Conocer tus horas difíciles ayuda a anticiparlas.</p>";
        }
        cont.innerHTML = html;
    }

    function listarRegistros(registros) {
        var cont = $("lista-registros");
        cont.innerHTML = '<h3 class="font-semibold text-lg text-base-content">Registros</h3>';
        registros.slice().reverse().slice(0, 20).forEach(function (r) {
            var det = document.createElement("details");
            det.className = "faro-option-card p-4";
            det.innerHTML =
                '<summary class="cursor-pointer font-medium text-base-content">' +
                Faro.Util.formatDateTime(r.fecha) + " · de " + r.inicial + " a " + r.final + "</summary>" +
                '<div class="mt-3 space-y-1 text-base" style="color: var(--faro-text-secondary);">' +
                (r.donde ? "<p><strong>Dónde:</strong> " + Faro.Util.escapeHtml(r.donde) + "</p>" : "") +
                (r.compania ? "<p><strong>Compañía:</strong> " + Faro.Util.escapeHtml(r.compania) + "</p>" : "") +
                (r.contexto ? "<p><strong>Qué pasaba:</strong> " + Faro.Util.escapeHtml(r.contexto) + "</p>" : "") +
                (r.sintomas && r.sintomas.length ? "<p><strong>Cuerpo:</strong> " + r.sintomas.map(Faro.Util.escapeHtml).join(", ") + "</p>" : "") +
                (r.mente ? "<p><strong>Mente:</strong> " + Faro.Util.escapeHtml(r.mente) + "</p>" : "") +
                "</div>";
            cont.appendChild(det);
        });
    }
})();
