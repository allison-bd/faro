/* ============================================================
   B4 — Tarea de predicción (Burns: adivinación del porvenir)
   Cada noche se predice; a la noche siguiente se registra la
   realidad. La acumulación de pares "predije X, fue Y" debilita
   la credibilidad del pensamiento catastrófico.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };
    var registros = Faro.Store.get("b4-registros", []);
    var pendiente = null;

    /* ¿Hay una predicción sin resolver? (hecha antes de hoy) */
    for (var i = registros.length - 1; i >= 0; i--) {
        if (!registros[i].resuelto) { pendiente = registros[i]; break; }
    }
    var hoy = Faro.Util.todayKey();
    var pendienteDeOtroDia = pendiente && Faro.Util.todayKey(new Date(pendiente.fecha)) !== hoy;

    if (pendienteDeOtroDia) {
        $("objetivo-pendiente").textContent = pendiente.objetivo;
        Faro.Screens.show("s-resolver");
    } else if (pendiente) {
        /* La predicción de hoy ya está hecha: mostrarla como guardada */
        $("prediccion-guardada").classList.remove("hidden");
        $("prediccion-guardada").textContent = "Ya tienes una predicción para mañana: \"" + pendiente.objetivo + "\". Vuelve mañana en la noche a registrar qué pasó.";
        $("btn-predecir").disabled = true;
        $("btn-predecir").style.opacity = "0.5";
        Faro.Screens.show("s-predecir");
    } else {
        Faro.Screens.show("s-predecir");
    }

    /* Sliders */
    $("slider-real").addEventListener("input", function () { $("valor-real").textContent = this.value; });
    $("slider-prediccion").addEventListener("input", function () { $("valor-prediccion").textContent = this.value; });

    /* ---------- Resolver la predicción pendiente ---------- */
    $("btn-resolver").addEventListener("click", function () {
        pendiente.resuelto = true;
        pendiente.quePaso = $("campo-que-paso").value.trim();
        pendiente.real = parseInt($("slider-real").value, 10);
        pendiente.fechaResolucion = new Date().toISOString();
        Faro.Store.set("b4-registros", registros);
        Faro.Util.trackToolUse("b4", "Tarea de predicción");

        /* Comparación visual inmediata */
        $("num-prediccion").textContent = pendiente.prediccion;
        $("num-real").textContent = pendiente.real;
        setTimeout(function () {
            $("barra-prediccion").style.height = Math.max(pendiente.prediccion * 10, 4) + "%";
            $("barra-real").style.height = Math.max(pendiente.real * 10, 4) + "%";
        }, 300);

        var msj;
        if (pendiente.real > pendiente.prediccion) {
            msj = "Predijiste " + pendiente.prediccion + " y fue " + pendiente.real + ". Tu mente subestimó lo que podías hacer.";
        } else if (pendiente.real === pendiente.prediccion) {
            msj = "Predijiste " + pendiente.prediccion + " y fue exactamente eso. Dato guardado: cada registro suma evidencia.";
        } else {
            msj = "Esta vez fue " + pendiente.real + ", menos que el " + pendiente.prediccion + " que predijiste. También es un dato — un día no define el patrón.";
        }
        $("mensaje-comparacion").textContent = msj;
        Faro.Screens.show("s-comparacion");
    });

    $("btn-nueva-prediccion").addEventListener("click", function () {
        Faro.Screens.show("s-predecir");
    });

    /* ---------- Nueva predicción ---------- */
    $("btn-predecir").addEventListener("click", function () {
        var objetivo = $("campo-objetivo").value.trim();
        if (!objetivo) return;

        registros.push({
            fecha: new Date().toISOString(),
            objetivo: objetivo,
            prediccion: parseInt($("slider-prediccion").value, 10),
            resuelto: false
        });
        Faro.Store.set("b4-registros", registros);
        Faro.Util.trackToolUse("b4", "Tarea de predicción");

        $("campo-objetivo").value = "";
        $("prediccion-guardada").textContent = "Guardada. Mañana en la noche registrarás qué pasó de verdad.";
        $("prediccion-guardada").classList.remove("hidden");
        $("btn-predecir").disabled = true;
        $("btn-predecir").style.opacity = "0.5";
    });

    /* ---------- Historial ---------- */
    $("btn-historial-1").addEventListener("click", mostrarHistorial);
    $("btn-historial-2").addEventListener("click", mostrarHistorial);
    $("btn-volver").addEventListener("click", function () { Faro.Screens.show("s-predecir"); });

    function mostrarHistorial() {
        var resueltos = registros.filter(function (r) { return r.resuelto; });
        $("historial-vacio").classList.toggle("hidden", resueltos.length > 0);

        var cont = $("grafico-pares");
        cont.innerHTML = "";
        resueltos.slice(-12).forEach(function (r) {
            var par = document.createElement("div");
            par.className = "flex items-end gap-0.5 shrink-0";
            par.title = "\"" + r.objetivo + "\" — predijiste " + r.prediccion + ", fue " + r.real;
            par.innerHTML =
                '<div style="width:16px;border-radius:5px 5px 0 0;background:color-mix(in srgb, var(--color-primary) 40%, transparent);height:' + Math.max(r.prediccion * 10, 4) + '%"></div>' +
                '<div style="width:16px;border-radius:5px 5px 0 0;background:var(--color-primary);height:' + Math.max(r.real * 10, 4) + '%"></div>';
            cont.appendChild(par);
        });

        /* El patrón: ¿cuántas veces la realidad superó la predicción? */
        var superadas = resueltos.filter(function (r) { return r.real > r.prediccion; }).length;
        var concl = $("conclusion-patron");
        if (resueltos.length >= 3 && superadas > resueltos.length / 2) {
            concl.textContent = "En " + superadas + " de " + resueltos.length +
                " predicciones, la realidad superó lo que tu mente anticipaba. Tus predicciones negativas no son confiables — y eso es una buena noticia.";
            concl.classList.remove("hidden");
        } else {
            concl.classList.add("hidden");
        }

        var lista = $("lista-predicciones");
        lista.innerHTML = "";
        resueltos.slice().reverse().slice(0, 10).forEach(function (r) {
            var div = document.createElement("div");
            div.className = "faro-option-card p-4";
            div.innerHTML =
                '<p class="font-medium text-base-content">' + Faro.Util.escapeHtml(r.objetivo) + "</p>" +
                '<p class="text-base" style="color: var(--faro-text-secondary);">Predicción: ' + r.prediccion + " · Realidad: " + r.real +
                (r.quePaso ? ' · "' + Faro.Util.escapeHtml(r.quePaso) + '"' : "") + "</p>";
            lista.appendChild(div);
        });

        Faro.Screens.show("s-historial");
    }
})();
