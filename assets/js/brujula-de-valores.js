/* ============================================================
   C7 — Brújula de valores (ACT)
   6 áreas de vida × 4 preguntas. Visualización radar hexagonal
   y compromisos semanales. Las áreas bajas se presentan como
   "espacio para crecer", nunca como problemas.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    function svg(contenido) {
        return '<svg width="56" height="56" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + contenido + "</svg>";
    }

    var AREAS = [
        { id: "relaciones", nombre: "Relaciones", sub: "Pareja, familia, amistades", icono: svg('<circle cx="17" cy="18" r="6"/><circle cx="31" cy="18" r="6"/><path d="M8 38c1-6 4-9 9-9s8 3 9 9M22 38c1-6 4-9 9-9s8 3 9 9" opacity="0.8"/>') },
        { id: "trabajo", nombre: "Trabajo / estudios", sub: "Lo que construyes cada día", icono: svg('<rect x="8" y="16" width="32" height="22" rx="3"/><path d="M18 16v-4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4M8 26h32"/>') },
        { id: "salud", nombre: "Salud y cuerpo", sub: "Tu casa más permanente", icono: svg('<path d="M24 40l-13-11c-4.5-4-5-10 .5-13.5C16 12.5 21 14 24 18c3-4 8-5.5 12.5-2.5 5.5 3.5 5 9.5.5 13.5z"/><path d="M12 24h7l3-5 4 9 3-4h7"/>') },
        { id: "crecimiento", nombre: "Crecimiento personal", sub: "Quién estás llegando a ser", icono: svg('<path d="M24 40V22"/><path d="M24 22c0-8 5-13 13-13 0 8-5 13-13 13zM24 28c0-6-4-10-10-10 0 6 4 10 10 10z" opacity="0.85"/>') },
        { id: "diversion", nombre: "Diversión y tiempo libre", sub: "Lo que te devuelve energía", icono: svg('<circle cx="24" cy="24" r="16"/><path d="M17 21h.01M31 21h.01" stroke-width="3"/><path d="M16 29c2.5 3 5 4.5 8 4.5s5.5-1.5 8-4.5"/>') },
        { id: "espiritualidad", nombre: "Espiritualidad / sentido", sub: "Lo que le da rumbo a todo", icono: svg('<circle cx="24" cy="24" r="16"/><path d="M24 8v6M24 34v6M8 24h6M34 24h6"/><circle cx="24" cy="24" r="4" fill="currentColor" stroke="none"/>') }
    ];

    var idx = 0;
    var respuestas = [];

    $("slider-area").addEventListener("input", function () {
        $("valor-area").textContent = this.value;
    });

    /* Si hay una brújula guardada, ofrecer verla */
    var guardada = Faro.Store.get("c7-brujula", null);
    if (guardada) $("btn-ver-brujula").classList.remove("hidden");

    $("btn-empezar").addEventListener("click", function () {
        idx = 0;
        respuestas = [];
        pintarArea();
        Faro.Screens.show("s-area");
        Faro.Util.trackToolUse("c7", "Brújula de valores");
    });

    $("btn-ver-brujula").addEventListener("click", function () {
        respuestas = guardada.areas;
        mostrarRadar();
    });

    function pintarArea() {
        var a = AREAS[idx];
        $("area-posicion").textContent = "Área " + (idx + 1) + " de 6 · " + a.sub;
        $("area-icono").innerHTML = a.icono;
        $("area-nombre").textContent = a.nombre;
        $("campo-persona").value = "";
        $("campo-direccion").value = "";
        $("campo-accion").value = "";
        $("slider-area").value = 5;
        $("valor-area").textContent = "5";
        /* repintar el relleno del slider tras el reset programático */
        $("slider-area").dispatchEvent(new Event("input"));

        var pantalla = $("s-area");
        pantalla.classList.remove("active");
        void pantalla.offsetWidth;
        pantalla.classList.add("active");
    }

    $("btn-area-seguir").addEventListener("click", function () {
        respuestas.push({
            id: AREAS[idx].id,
            nombre: AREAS[idx].nombre,
            persona: $("campo-persona").value.trim(),
            direccion: $("campo-direccion").value.trim(),
            nivel: parseInt($("slider-area").value, 10),
            accion: $("campo-accion").value.trim()
        });
        idx++;
        if (idx < AREAS.length) {
            pintarArea();
        } else {
            mostrarRadar();
        }
    });

    /* ---------- Radar hexagonal ---------- */
    function punto(centro, radio, anguloIdx) {
        var ang = (Math.PI / 180) * (-90 + anguloIdx * 60);
        return [centro + radio * Math.cos(ang), centro + radio * Math.sin(ang)];
    }

    function poligono(centro, radio) {
        var pts = [];
        for (var i = 0; i < 6; i++) pts.push(punto(centro, radio, i).join(","));
        return pts.join(" ");
    }

    function mostrarRadar() {
        var C = 120, R = 82;
        var svgEl = $("radar");
        var html = "";

        /* rejilla */
        [0.25, 0.5, 0.75, 1].forEach(function (f) {
            html += '<polygon points="' + poligono(C, R * f) + '" fill="none" stroke="var(--faro-border)" stroke-width="1"/>';
        });
        for (var i = 0; i < 6; i++) {
            var p = punto(C, R, i);
            html += '<line x1="' + C + '" y1="' + C + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="var(--faro-border-subtle)" stroke-width="1"/>';
        }

        /* polígono de niveles */
        var pts = respuestas.map(function (r, i) {
            return punto(C, R * (r.nivel / 10), i).join(",");
        }).join(" ");
        html += '<polygon points="' + pts + '" fill="color-mix(in srgb, var(--color-primary) 30%, transparent)" stroke="var(--color-primary)" stroke-width="2.5" stroke-linejoin="round"/>';

        /* puntos y etiquetas */
        respuestas.forEach(function (r, i) {
            var pv = punto(C, R * (r.nivel / 10), i);
            html += '<circle cx="' + pv[0] + '" cy="' + pv[1] + '" r="4" fill="var(--color-accent)"/>';
            var pe = punto(C, R + 22, i);
            var etiqueta = r.nombre.split(" ")[0].replace("/", "");
            html += '<text x="' + pe[0] + '" y="' + pe[1] + '" text-anchor="middle" font-size="11" fill="var(--faro-text-secondary)">' + etiqueta + "</text>";
        });

        svgEl.innerHTML = html;

        /* lectura textual (accesibilidad: el radar nunca es la única vía) */
        $("lectura-radar").innerHTML = respuestas.map(function (r) {
            return "<p><strong>" + r.nombre + ":</strong> " + r.nivel + "/10" +
                (r.direccion ? " — " + Faro.Util.escapeHtml(r.direccion) : "") + "</p>";
        }).join("");

        /* compromisos */
        var lista = $("lista-compromisos");
        lista.innerHTML = "";
        var hayCompromisos = false;
        respuestas.forEach(function (r) {
            if (!r.accion) return;
            hayCompromisos = true;
            var li = document.createElement("li");
            li.className = "faro-option-card p-3 flex items-center gap-3";
            li.innerHTML = '<svg class="text-primary shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>' +
                '<span><span class="text-sm block" style="color: var(--faro-text-muted);">' + r.nombre + '</span><span class="text-base text-base-content">' + Faro.Util.escapeHtml(r.accion) + "</span></span>";
            lista.appendChild(li);
        });
        if (!hayCompromisos) {
            lista.innerHTML = '<li class="text-base" style="color: var(--faro-text-muted);">No escribiste acciones esta vez. Puedes volver cuando quieras.</li>';
        }

        Faro.Screens.show("s-radar");
    }

    $("btn-guardar").addEventListener("click", function () {
        Faro.Store.set("c7-brujula", {
            fecha: new Date().toISOString(),
            areas: respuestas
        });
        $("guardado").classList.remove("hidden");
    });
})();
