/* ============================================================
   B3 — Diario de excepciones (Cade & O'Hanlon, Beyebach)
   Registra momentos en que el problema NO está. Si la persona
   responde "no", NO se insiste en lo positivo: se cambia a modo
   afrontamiento (validar sin invalidar).
   Con 5+ registros, detecta recurrencias (recursos reales).
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };
    var registro = {};

    /* ---------- Entrada: la ramificación clínica ---------- */
    $("btn-si").addEventListener("click", function () {
        registro = { tipo: "excepcion", fecha: new Date().toISOString() };
        Faro.Screens.show("s-cuando");
    });
    $("btn-no").addEventListener("click", function () {
        registro = { tipo: "afrontamiento", fecha: new Date().toISOString() };
        Faro.Screens.show("s-no-1");
    });

    /* Navegación genérica */
    document.querySelectorAll("[data-siguiente]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            Faro.Screens.show(btn.getAttribute("data-siguiente"));
        });
    });

    /* ---------- Ruta SÍ ---------- */
    document.querySelectorAll(".opcion-cuando").forEach(function (chip) {
        chip.addEventListener("click", function () {
            registro.cuando = chip.textContent;
            Faro.Screens.show("s-haciendo");
        });
    });

    document.querySelectorAll(".opcion-quien").forEach(function (card) {
        card.addEventListener("click", function () {
            var valor = card.getAttribute("data-valor");
            document.querySelectorAll(".opcion-quien").forEach(function (c) { c.classList.remove("selected"); });
            card.classList.add("selected");
            if (valor === "con-alguien") {
                $("campo-quien").classList.remove("hidden");
                $("btn-quien-seguir").classList.remove("hidden");
                registro.quien = "Con alguien";
            } else {
                registro.quien = valor;
                Faro.Screens.show("s-diferente");
            }
        });
    });
    $("btn-quien-seguir").addEventListener("click", function () {
        var nombre = $("campo-quien").value.trim();
        if (nombre) registro.quien = "Con " + nombre;
        registro.quienNombre = nombre;
        Faro.Screens.show("s-diferente");
    });

    $("btn-terminar-si").addEventListener("click", function () {
        registro.haciendo = $("campo-haciendo").value.trim();
        registro.diferente = $("campo-diferente").value.trim();
        registro.como = $("campo-como").value.trim();
        registro.cualidad = $("campo-cualidad").value.trim();

        Faro.Store.push("b3-registros", registro, 300);
        Faro.Util.trackToolUse("b3", "Diario de excepciones");

        var resumen = "Hoy tu excepción fue: " +
            (registro.haciendo || "un momento mejor") +
            (registro.cuando ? " (" + registro.cuando.toLowerCase() + ")" : "") + ".";
        if (registro.cualidad) {
            resumen += " Lo lograste gracias a tu " + registro.cualidad + ".";
        } else if (registro.como) {
            resumen += " Y lo lograste tú: " + registro.como + ".";
        }
        $("texto-resumen").textContent = resumen;
        Faro.Screens.show("s-resumen");
    });

    /* ---------- Ruta NO (afrontamiento) ---------- */
    $("btn-terminar-no").addEventListener("click", function () {
        registro.afrontamiento = $("campo-afrontamiento").value.trim();
        Faro.Store.push("b3-registros", registro, 300);
        Faro.Util.trackToolUse("b3", "Diario de excepciones");
        Faro.Screens.show("s-no-3");
    });

    /* ---------- Historial con detección de patrones ---------- */
    $("btn-historial").addEventListener("click", mostrarHistorial);
    $("btn-ver-patrones").addEventListener("click", mostrarHistorial);

    function mostrarHistorial() {
        var registros = Faro.Store.get("b3-registros", []);
        var excepciones = registros.filter(function (r) { return r.tipo === "excepcion"; });

        $("historial-vacio").classList.toggle("hidden", registros.length > 0);
        pintarPatrones(excepciones);
        pintarLista(registros);
        Faro.Screens.show("s-historial");
    }

    /* Recurrencias: actividades y personas que se repiten 3+ veces */
    var VACIAS = ["cuando", "estaba", "estuve", "con", "una", "unas", "unos", "para", "porque", "aunque", "sobre", "donde", "como", "algo", "hacer", "hice", "muy", "más", "mas", "del", "las", "los", "que", "por", "mis", "sus"];

    function pintarPatrones(excepciones) {
        var cont = $("patrones");
        cont.innerHTML = "";
        if (excepciones.length < 5) {
            if (excepciones.length > 0) {
                cont.innerHTML = '<p class="text-base text-center" style="color: var(--faro-text-muted);">Con ' +
                    (5 - excepciones.length) + " registro(s) más, Faro empezará a mostrarte qué se repite en tus buenos momentos.</p>";
            }
            return;
        }

        var html = '<h3 class="font-semibold text-lg text-base-content">Lo que se repite en tus buenos momentos</h3>';
        var hallazgos = 0;

        /* Actividades recurrentes */
        var palabras = {};
        excepciones.forEach(function (r) {
            String(r.haciendo || "").toLowerCase().split(/[^a-záéíóúñü]+/).forEach(function (w) {
                if (w.length > 3 && VACIAS.indexOf(w) === -1) {
                    palabras[w] = (palabras[w] || 0) + 1;
                }
            });
        });
        Object.keys(palabras).sort(function (a, b) { return palabras[b] - palabras[a]; }).slice(0, 2).forEach(function (w) {
            if (palabras[w] >= 3) {
                html += '<p class="text-base" style="color: var(--faro-text-secondary);">Has registrado ' +
                    palabras[w] + ' veces que "' + Faro.Util.escapeHtml(w) + '" aparece en tus momentos buenos.</p>';
                hallazgos++;
            }
        });

        /* Personas recurrentes */
        var personas = {};
        excepciones.forEach(function (r) {
            if (r.quienNombre) {
                var n = r.quienNombre.trim();
                personas[n] = (personas[n] || 0) + 1;
            }
        });
        Object.keys(personas).forEach(function (n) {
            if (personas[n] >= 3) {
                html += '<p class="text-base" style="color: var(--faro-text-secondary);">Los momentos buenos suelen ocurrir cuando estás con <strong>' +
                    Faro.Util.escapeHtml(n) + "</strong>.</p>";
                hallazgos++;
            }
        });

        /* Momento del día recurrente */
        var momentos = {};
        excepciones.forEach(function (r) {
            if (r.cuando) momentos[r.cuando] = (momentos[r.cuando] || 0) + 1;
        });
        Object.keys(momentos).forEach(function (m) {
            if (momentos[m] >= 3 && momentos[m] >= excepciones.length * 0.5) {
                html += '<p class="text-base" style="color: var(--faro-text-secondary);">Tus excepciones se concentran en la <strong>' +
                    m.toLowerCase() + "</strong>.</p>";
                hallazgos++;
            }
        });

        if (hallazgos > 0) {
            html += '<p class="text-base mt-1" style="color: var(--faro-text-secondary);">Esto no es casualidad: son recursos tuyos que puedes usar a propósito.</p>';
            cont.innerHTML = html;
        }
    }

    function pintarLista(registros) {
        var cont = $("lista-excepciones");
        cont.innerHTML = "";
        registros.slice().reverse().slice(0, 20).forEach(function (r) {
            var div = document.createElement("div");
            div.className = "faro-option-card p-4";
            if (r.tipo === "excepcion") {
                div.innerHTML =
                    '<p class="text-sm" style="color: var(--faro-text-muted);">' + Faro.Util.formatDate(r.fecha) + (r.cuando ? " · " + r.cuando : "") + "</p>" +
                    '<p class="font-medium text-base-content mt-1">' + Faro.Util.escapeHtml(r.haciendo || "Un momento mejor") + "</p>" +
                    (r.como ? '<p class="text-base mt-1" style="color: var(--faro-text-secondary);"><strong>Cómo:</strong> ' + Faro.Util.escapeHtml(r.como) + "</p>" : "") +
                    (r.cualidad ? '<p class="text-base" style="color: var(--faro-text-secondary);"><strong>Cualidad:</strong> ' + Faro.Util.escapeHtml(r.cualidad) + "</p>" : "");
            } else {
                div.innerHTML =
                    '<p class="text-sm" style="color: var(--faro-text-muted);">' + Faro.Util.formatDate(r.fecha) + " · día difícil</p>" +
                    (r.afrontamiento ? '<p class="text-base mt-1" style="color: var(--faro-text-secondary);"><strong>Cómo seguiste adelante:</strong> ' + Faro.Util.escapeHtml(r.afrontamiento) + "</p>" : "");
            }
            cont.appendChild(div);
        });
    }
})();
