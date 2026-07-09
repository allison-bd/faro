/* ============================================================
   D1 — Registro diario de estado de ánimo (Burns)
   Los 5 pasos: situación → emociones (0-100) → pensamientos
   automáticos → distorsiones → alternativa realista + credibilidad.
   El registro rompe la fusión evento-emoción insertando el
   pensamiento intermedio.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    var EMOCIONES = ["Ansiedad", "Tristeza", "Rabia", "Culpa", "Vergüenza", "Frustración", "Miedo"];

    var DISTORSIONES = [
        { nombre: "Todo o nada", desc: "Sin puntos medios: perfecto o fracaso." },
        { nombre: "Generalización excesiva", desc: "Un hecho puntual se vuelve 'siempre' o 'nunca'." },
        { nombre: "Filtro mental", desc: "Solo lo negativo pasa el filtro." },
        { nombre: "Descartar lo positivo", desc: "Lo bueno 'no cuenta' o fue suerte." },
        { nombre: "Saltar a conclusiones", desc: "Leer mentes o adivinar el futuro en negativo." },
        { nombre: "Magnificación / minimización", desc: "Errores con lupa, logros con telescopio al revés." },
        { nombre: "Razonamiento emocional", desc: "Lo siento, por lo tanto es verdad." },
        { nombre: "Afirmaciones \"debería\"", desc: "Reglas rígidas que generan culpa." },
        { nombre: "Poner etiquetas", desc: "'Soy un fracaso' en vez de 'cometí un error'." },
        { nombre: "Inculpación", desc: "Toda la culpa para ti, o toda para otros." }
    ];

    var registro = {};

    /* ---------- Paso 2: emociones activables con slider 0-100 ---------- */
    function pintarEmociones() {
        var cont = $("lista-emociones");
        cont.innerHTML = "";
        EMOCIONES.forEach(function (nombre) { agregarEmocion(cont, nombre); });
    }

    function agregarEmocion(cont, nombre) {
        var fila = document.createElement("div");
        fila.className = "faro-option-card p-3";
        fila.setAttribute("data-emocion", nombre);
        fila.innerHTML =
            '<div class="flex items-center justify-between gap-3">' +
            '<span class="font-medium text-base-content">' + Faro.Util.escapeHtml(nombre) + "</span>" +
            '<input type="checkbox" class="toggle toggle-primary toggle-sm activar-emocion" aria-label="Sentí ' + Faro.Util.escapeHtml(nombre) + '">' +
            "</div>" +
            '<div class="control-intensidad hidden mt-3 space-y-1">' +
            '<input type="range" class="faro-slider intensidad" min="0" max="100" value="50" aria-label="Intensidad de ' + Faro.Util.escapeHtml(nombre) + '">' +
            '<p class="text-sm text-right" style="color: var(--faro-text-muted);"><span class="valor-intensidad">50</span>%</p>' +
            "</div>";

        fila.querySelector(".activar-emocion").addEventListener("change", function () {
            fila.querySelector(".control-intensidad").classList.toggle("hidden", !this.checked);
        });
        fila.querySelector(".intensidad").addEventListener("input", function () {
            fila.querySelector(".valor-intensidad").textContent = this.value;
        });
        cont.appendChild(fila);
    }

    /* "Otra" emoción: al escribir, se agrega como fila activable */
    $("campo-otra-emocion").addEventListener("change", function () {
        var nombre = this.value.trim();
        if (!nombre) return;
        agregarEmocion($("lista-emociones"), nombre);
        var fila = $("lista-emociones").lastElementChild;
        fila.querySelector(".activar-emocion").checked = true;
        fila.querySelector(".control-intensidad").classList.remove("hidden");
        this.value = "";
    });

    /* ---------- Paso 4: distorsiones ---------- */
    function pintarDistorsiones() {
        var cont = $("lista-distorsiones");
        cont.innerHTML = "";
        DISTORSIONES.forEach(function (d) {
            var card = document.createElement("button");
            card.className = "faro-option-card p-3 text-left";
            card.setAttribute("data-nombre", d.nombre);
            card.innerHTML = '<span class="font-semibold text-primary block text-base">' + d.nombre + "</span>" +
                '<span class="text-sm" style="color: var(--faro-text-secondary);">' + d.desc + "</span>";
            card.addEventListener("click", function () { card.classList.toggle("selected"); });
            cont.appendChild(card);
        });
    }

    pintarEmociones();
    pintarDistorsiones();

    /* ---------- Navegación ---------- */
    document.querySelectorAll("[data-siguiente]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            Faro.Screens.show(btn.getAttribute("data-siguiente"));
        });
    });

    $("slider-credibilidad").addEventListener("input", function () {
        $("valor-credibilidad").textContent = this.value;
    });

    /* ---------- Guardar y resumir ---------- */
    $("btn-terminar").addEventListener("click", function () {
        registro.fecha = new Date().toISOString();
        registro.situacion = $("campo-situacion").value.trim();
        registro.pensamientos = $("campo-pensamientos").value.trim();
        registro.alternativa = $("campo-alternativa").value.trim();
        registro.credibilidad = parseInt($("slider-credibilidad").value, 10);

        registro.emociones = [];
        document.querySelectorAll("[data-emocion]").forEach(function (fila) {
            if (fila.querySelector(".activar-emocion").checked) {
                registro.emociones.push({
                    nombre: fila.getAttribute("data-emocion"),
                    intensidad: parseInt(fila.querySelector(".intensidad").value, 10)
                });
            }
        });

        registro.distorsiones = [];
        document.querySelectorAll("#lista-distorsiones .selected").forEach(function (c) {
            registro.distorsiones.push(c.getAttribute("data-nombre"));
        });

        Faro.Store.push("d1-registros", registro, 300);
        Faro.Util.trackToolUse("d1", "Registro de estado de ánimo");

        pintarResumen();
        Faro.Screens.show("s-resumen");
    });

    function bloque(titulo, contenido) {
        return '<div class="faro-option-card p-4"><p class="text-xs font-semibold uppercase tracking-wide" style="color: var(--faro-text-muted);">' +
            titulo + '</p><p class="text-base mt-1 text-base-content">' + contenido + "</p></div>" +
            '<p class="text-center text-primary" aria-hidden="true">↓</p>';
    }

    function pintarResumen() {
        var esc = Faro.Util.escapeHtml;
        var html = "";
        html += bloque("Situación", esc(registro.situacion || "—"));
        html += bloque("Emociones", registro.emociones.length
            ? registro.emociones.map(function (e) { return esc(e.nombre) + " " + e.intensidad + "%"; }).join(" · ")
            : "—");
        html += bloque("Pensamiento", esc(registro.pensamientos || "—"));
        html += bloque("Trampas detectadas", registro.distorsiones.length ? registro.distorsiones.map(esc).join(", ") : "Ninguna marcada");
        html += '<div class="faro-option-card p-4" style="border-color: var(--color-success);"><p class="text-xs font-semibold uppercase tracking-wide" style="color: var(--color-success);">Alternativa realista · ' +
            registro.credibilidad + '% de credibilidad</p><p class="text-base mt-1 text-base-content">' + esc(registro.alternativa || "—") + "</p></div>";
        $("resumen-cadena").innerHTML = html;
    }

    /* ---------- Historial con patrones ---------- */
    $("link-historial").addEventListener("click", mostrarHistorial);
    $("btn-historial-2").addEventListener("click", mostrarHistorial);

    function mostrarHistorial() {
        var registros = Faro.Store.get("d1-registros", []);
        $("historial-vacio").classList.toggle("hidden", registros.length > 0);

        /* patrones: distorsiones recurrentes + evolución de credibilidad */
        var cont = $("patrones");
        cont.innerHTML = "";
        if (registros.length >= 3) {
            var cuenta = {};
            registros.forEach(function (r) {
                (r.distorsiones || []).forEach(function (d) { cuenta[d] = (cuenta[d] || 0) + 1; });
            });
            var html = "";
            Object.keys(cuenta).sort(function (a, b) { return cuenta[b] - cuenta[a]; }).slice(0, 2).forEach(function (d) {
                var pct = Math.round(cuenta[d] / registros.length * 100);
                if (pct >= 50) {
                    html += '<p class="text-base" style="color: var(--faro-text-secondary);"><strong>' +
                        Faro.Util.escapeHtml(d) + "</strong> aparece en el " + pct + "% de tus registros.</p>";
                }
            });
            var primeros = registros.slice(0, 3).reduce(function (s, r) { return s + (r.credibilidad || 0); }, 0) / Math.min(3, registros.length);
            var ultimos = registros.slice(-3).reduce(function (s, r) { return s + (r.credibilidad || 0); }, 0) / Math.min(3, registros.length);
            if (registros.length >= 6 && ultimos > primeros + 10) {
                html += '<p class="text-base" style="color: var(--faro-text-secondary);">Tus pensamientos alternativos son cada vez más creíbles para ti: de ' +
                    Math.round(primeros) + "% a " + Math.round(ultimos) + "% en promedio.</p>";
            }
            if (html) cont.innerHTML = '<h3 class="font-semibold text-lg text-base-content">Patrones</h3>' + html;
        }

        var lista = $("lista-registros");
        lista.innerHTML = "";
        registros.slice().reverse().slice(0, 15).forEach(function (r) {
            var det = document.createElement("details");
            det.className = "faro-option-card p-4";
            det.innerHTML =
                '<summary class="cursor-pointer font-medium text-base-content">' + Faro.Util.formatDateTime(r.fecha) +
                (r.situacion ? " · " + Faro.Util.escapeHtml(r.situacion.slice(0, 40)) + (r.situacion.length > 40 ? "…" : "") : "") + "</summary>" +
                '<div class="mt-3 space-y-1 text-base" style="color: var(--faro-text-secondary);">' +
                (r.pensamientos ? "<p><strong>Pensamiento:</strong> " + Faro.Util.escapeHtml(r.pensamientos) + "</p>" : "") +
                (r.distorsiones && r.distorsiones.length ? "<p><strong>Trampas:</strong> " + r.distorsiones.map(Faro.Util.escapeHtml).join(", ") + "</p>" : "") +
                (r.alternativa ? "<p><strong>Alternativa (" + r.credibilidad + "%):</strong> " + Faro.Util.escapeHtml(r.alternativa) + "</p>" : "") +
                "</div>";
            lista.appendChild(det);
        });

        Faro.Screens.show("s-historial");
    }
})();
