/* ============================================================
   C9 — Red de apoyo estructurada
   Mapeo por función (no solo nombres): revela vacíos y recursos.
   Los contactos de angustia y momentos difíciles alimentan el
   paso 6 del Protocolo de crisis (clave "crisis-contacts").
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    var FUNCIONES = [
        { id: "consejo", pregunta: "¿A quién acudes para un consejo?", etiqueta: "Consejo", color: "var(--color-primary)", telefono: false },
        { id: "angustia", pregunta: "¿A quién acudes cuando te sientes angustiado/a?", etiqueta: "Angustia", color: "var(--color-error)", telefono: true },
        { id: "noticias", pregunta: "¿A quién llamas para compartir una buena noticia?", etiqueta: "Buenas noticias", color: "var(--color-accent)", telefono: false },
        { id: "celebrar", pregunta: "¿Con quién celebras?", etiqueta: "Celebrar", color: "var(--color-success)", telefono: false },
        { id: "dificiles", pregunta: "¿Quién sientes que está ahí en los momentos difíciles?", etiqueta: "Momentos difíciles", color: "var(--color-secondary)", telefono: true },
        { id: "terapeuta", pregunta: "¿Tienes un/a terapeuta o profesional de salud mental?", etiqueta: "Profesional", color: "var(--faro-accent-purple)", telefono: true, opcional: true }
    ];

    var idx = 0;
    var red = {};

    var guardado = Faro.Store.get("red-apoyo", null);
    if (guardado) $("btn-ver-mapa").classList.remove("hidden");

    $("btn-empezar").addEventListener("click", function () {
        idx = 0;
        red = {};
        FUNCIONES.forEach(function (f) { red[f.id] = []; });
        pintarFuncion();
        Faro.Screens.show("s-funcion");
        Faro.Util.trackToolUse("c9", "Red de apoyo");
    });

    $("btn-ver-mapa").addEventListener("click", function () {
        red = guardado.funciones;
        mostrarMapa(false);
    });

    function pintarFuncion() {
        var f = FUNCIONES[idx];
        $("funcion-posicion").textContent = (idx + 1) + " de " + FUNCIONES.length + " · " + f.etiqueta;
        $("funcion-pregunta").textContent = f.pregunta;
        $("campo-persona-telefono").classList.toggle("hidden", !f.telefono);
        $("campo-persona-nombre").value = "";
        $("campo-persona-relacion").value = "";
        $("campo-persona-telefono").value = "";
        refrescarPersonas();

        var pantalla = $("s-funcion");
        pantalla.classList.remove("active");
        void pantalla.offsetWidth;
        pantalla.classList.add("active");
    }

    function refrescarPersonas() {
        var f = FUNCIONES[idx];
        var cont = $("personas-agregadas");
        cont.innerHTML = "";
        red[f.id].forEach(function (p, i) {
            var chip = document.createElement("span");
            chip.className = "faro-chip selected";
            chip.innerHTML = Faro.Util.escapeHtml(p.name) +
                ' <button aria-label="Quitar a ' + Faro.Util.escapeHtml(p.name) + '" style="font-weight:bold;margin-left:4px;">✕</button>';
            chip.querySelector("button").addEventListener("click", function () {
                red[f.id].splice(i, 1);
                refrescarPersonas();
            });
            cont.appendChild(chip);
        });
    }

    $("btn-agregar-persona").addEventListener("click", function () {
        var f = FUNCIONES[idx];
        var nombre = $("campo-persona-nombre").value.trim();
        if (!nombre) return;
        red[f.id].push({
            name: nombre,
            relation: $("campo-persona-relacion").value.trim(),
            phone: $("campo-persona-telefono").value.trim()
        });
        $("campo-persona-nombre").value = "";
        $("campo-persona-relacion").value = "";
        $("campo-persona-telefono").value = "";
        refrescarPersonas();
    });

    $("btn-funcion-seguir").addEventListener("click", function () {
        idx++;
        if (idx < FUNCIONES.length) {
            pintarFuncion();
        } else {
            guardarYMostrar();
        }
    });

    function guardarYMostrar() {
        Faro.Store.set("red-apoyo", { fecha: new Date().toISOString(), funciones: red });

        /* Contactos para el paso 6 del Protocolo de crisis:
           primero angustia, luego momentos difíciles, luego profesional */
        var contactos = [];
        ["angustia", "dificiles", "terapeuta"].forEach(function (fid) {
            (red[fid] || []).forEach(function (p) {
                if (!contactos.some(function (c) { return c.name === p.name; })) {
                    contactos.push(p);
                }
            });
        });
        Faro.Store.set("crisis-contacts", contactos);

        mostrarMapa(true);
    }

    /* ---------- Mapa radial ---------- */
    function mostrarMapa() {
        var C = 170, R = 118;
        var svgEl = $("mapa");
        var personas = [];
        FUNCIONES.forEach(function (f) {
            (red[f.id] || []).forEach(function (p) {
                personas.push({ persona: p, funcion: f });
            });
        });

        var html = "";
        personas.forEach(function (item, i) {
            var ang = (Math.PI * 2 * i / Math.max(personas.length, 1)) - Math.PI / 2;
            var x = C + R * Math.cos(ang);
            var y = C + R * Math.sin(ang);
            html += '<line x1="' + C + '" y1="' + C + '" x2="' + x + '" y2="' + y + '" stroke="' + item.funcion.color + '" stroke-width="2" opacity="0.6"/>';
            html += '<circle cx="' + x + '" cy="' + y + '" r="17" fill="var(--faro-card-bg)" stroke="' + item.funcion.color + '" stroke-width="2.5"/>';
            html += '<text x="' + x + '" y="' + (y + 4) + '" text-anchor="middle" font-size="12" font-weight="600" fill="var(--color-base-content)">' +
                Faro.Util.escapeHtml(item.persona.name.slice(0, 2)) + "</text>";
            html += '<text x="' + x + '" y="' + (y + 31) + '" text-anchor="middle" font-size="10" fill="var(--faro-text-secondary)">' +
                Faro.Util.escapeHtml(item.persona.name.length > 10 ? item.persona.name.slice(0, 9) + "…" : item.persona.name) + "</text>";
        });

        /* el centro al final, encima de las líneas */
        html += '<circle cx="' + C + '" cy="' + C + '" r="26" fill="var(--color-primary)"/>';
        html += '<text x="' + C + '" y="' + (C + 5) + '" text-anchor="middle" font-size="13" font-weight="700" fill="var(--color-primary-content)">Yo</text>';
        svgEl.innerHTML = html;

        /* leyenda por color */
        $("leyenda").innerHTML = FUNCIONES.map(function (f) {
            return '<span class="inline-flex items-center gap-1"><span style="display:inline-block;width:10px;height:10px;border-radius:9999px;background:' + f.color + ';"></span> ' + f.etiqueta + "</span>";
        }).join("");

        /* lectura textual del mapa */
        $("lectura-mapa").innerHTML = FUNCIONES.map(function (f) {
            var nombres = (red[f.id] || []).map(function (p) { return Faro.Util.escapeHtml(p.name); });
            return nombres.length ? "<p><strong>" + f.etiqueta + ":</strong> " + nombres.join(", ") + "</p>" : "";
        }).join("");

        /* vacíos señalados con suavidad */
        var cont = $("vacios");
        cont.innerHTML = "";
        FUNCIONES.forEach(function (f) {
            if ((red[f.id] || []).length === 0 && !f.opcional) {
                var mensajes = {
                    consejo: "No indicaste a nadie para pedir consejo. ¿Hay alguien que podrías considerar?",
                    angustia: "No indicaste a nadie para momentos de angustia. ¿Hay alguien que podrías considerar?",
                    noticias: "No indicaste a nadie para compartir buenas noticias. ¿Hay alguien que podrías considerar?",
                    celebrar: "No indicaste a nadie con quien celebrar. ¿Hay alguien que podrías considerar?",
                    dificiles: "No indicaste a nadie para los momentos difíciles. ¿Hay alguien que podrías considerar?"
                };
                cont.innerHTML += '<p class="text-base p-3 rounded-xl" style="background: var(--faro-warning-bg); color: var(--color-warning);">' + mensajes[f.id] + "</p>";
            }
        });

        Faro.Screens.show("s-mapa");
    }

    $("btn-rehacer").addEventListener("click", function () {
        Faro.Screens.show("s-entrada");
    });
})();
