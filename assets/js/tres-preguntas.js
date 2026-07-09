/* ============================================================
   B1 — Tres preguntas para una vida feliz (Isebaert)
   Ritual nocturno de satisfacción. Placeholders que rotan cada
   día, calendario de racha con tonos cálidos, y relectura del
   historial como intervención en sí misma.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    var PLACEHOLDERS = {
        p1: [
            "Ej: Me levanté aunque no tenía ganas",
            "Ej: Preparé comida en vez de pedir delivery",
            "Ej: Respondí ese correo que llevaba días evitando"
        ],
        p2: [
            "Ej: Mi colega me ayudó sin que se lo pidiera",
            "Ej: Alguien me sonrió en la calle",
            "Ej: Un amigo me mandó un mensaje"
        ],
        p3: [
            "Ej: Salí a caminar aunque fuera un rato",
            "Ej: Me acosté a una hora razonable",
            "Ej: Terminé algo que había empezado"
        ]
    };

    /* Placeholder contextual distinto según el día */
    var diaIndice = Math.floor(Date.now() / 86400000);
    ["p1", "p2", "p3"].forEach(function (id) {
        var opciones = PLACEHOLDERS[id];
        $(id).placeholder = opciones[diaIndice % opciones.length];
    });

    var registros = Faro.Store.get("b1-registros", {});
    var hoy = Faro.Util.todayKey();

    /* Si hoy ya se escribió, se muestra lo guardado (editable) */
    if (registros[hoy]) {
        $("p1").value = registros[hoy].r1 || "";
        $("p2").value = registros[hoy].r2 || "";
        $("p3").value = registros[hoy].r3 || "";
        $("ya-guardado").textContent = "Hoy ya escribiste. Puedes editar y volver a guardar.";
        $("ya-guardado").classList.remove("hidden");
    }

    $("btn-guardar").addEventListener("click", function () {
        var r1 = $("p1").value.trim(), r2 = $("p2").value.trim(), r3 = $("p3").value.trim();
        if (!r1 && !r2 && !r3) return;

        registros[hoy] = { r1: r1, r2: r2, r3: r3, hora: new Date().toISOString() };
        Faro.Store.set("b1-registros", registros);
        Faro.Util.trackToolUse("b1", "Tres preguntas para una vida feliz");

        $("ya-guardado").textContent = "Guardado. Que duermas bien.";
        $("ya-guardado").classList.remove("hidden");
    });

    /* ---------- Historial ---------- */
    $("btn-historial").addEventListener("click", function () {
        pintarCalendario();
        pintarLista();
        pintarRacha();
        Faro.Screens.show("s-historial");
    });
    $("btn-volver").addEventListener("click", function () {
        Faro.Screens.show("s-hoy");
    });

    function pintarRacha() {
        /* racha: días consecutivos hacia atrás desde hoy (o ayer) */
        var racha = 0;
        var d = new Date();
        if (!registros[Faro.Util.todayKey(d)]) d.setDate(d.getDate() - 1);
        while (registros[Faro.Util.todayKey(d)]) {
            racha++;
            d.setDate(d.getDate() - 1);
        }
        var total = Object.keys(registros).length;
        if (racha >= 2) {
            $("racha").textContent = "Llevas " + racha + " noches seguidas. " + total + " en total.";
        } else if (total > 0) {
            $("racha").textContent = total + (total === 1 ? " noche registrada." : " noches registradas.");
        } else {
            $("racha").textContent = "Tu primera noche te espera.";
        }
    }

    /* Calendario de 12 semanas, estilo racha con tonos cálidos */
    function pintarCalendario() {
        var cont = $("calendario");
        cont.innerHTML = "";

        var hoyDate = new Date();
        /* empezar 12 semanas atrás, desde lunes */
        var inicio = new Date(hoyDate);
        inicio.setDate(inicio.getDate() - (7 * 11) - ((hoyDate.getDay() + 6) % 7));

        for (var s = 0; s < 12; s++) {
            var col = document.createElement("div");
            col.className = "cal-semana";
            for (var d = 0; d < 7; d++) {
                var fecha = new Date(inicio);
                fecha.setDate(inicio.getDate() + s * 7 + d);
                var clave = Faro.Util.todayKey(fecha);
                var celda = document.createElement("div");
                celda.className = "faro-cal-cell";
                if (fecha > hoyDate) celda.style.visibility = "hidden";
                if (registros[clave]) {
                    celda.classList.add("done");
                    celda.setAttribute("role", "button");
                    celda.setAttribute("aria-label", "Releer " + clave);
                    (function (k) {
                        celda.addEventListener("click", function () { mostrarDia(k); });
                    })(clave);
                }
                if (clave === hoy) celda.classList.add("today");
                col.appendChild(celda);
            }
            cont.appendChild(col);
        }
    }

    function mostrarDia(clave) {
        var r = registros[clave];
        var det = $("dia-detalle");
        det.innerHTML =
            '<p class="font-semibold text-primary">' + Faro.Util.formatDate(clave + "T12:00:00") + "</p>" +
            entrada("Hice", r.r1) + entrada("Alguien hizo por mí", r.r2) + entrada("También hice", r.r3);
        det.classList.remove("hidden");
    }

    function entrada(titulo, texto) {
        if (!texto) return "";
        return '<p class="text-base" style="color: var(--faro-text-secondary);"><strong>' +
            titulo + ":</strong> " + Faro.Util.escapeHtml(texto) + "</p>";
    }

    function pintarLista() {
        var cont = $("lista-completa");
        cont.innerHTML = "";
        var claves = Object.keys(registros).sort().reverse();
        if (claves.length === 0) {
            cont.innerHTML = '<p class="text-base" style="color: var(--faro-text-muted);">Aún no hay registros.</p>';
            return;
        }
        claves.forEach(function (clave) {
            var r = registros[clave];
            var div = document.createElement("div");
            div.innerHTML = '<p class="font-semibold text-primary">' + Faro.Util.formatDate(clave + "T12:00:00") + "</p>" +
                entrada("Hice", r.r1) + entrada("Alguien hizo por mí", r.r2) + entrada("También hice", r.r3);
            cont.appendChild(div);
        });
    }
})();
