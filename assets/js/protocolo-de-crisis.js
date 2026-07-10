/* ============================================================
   Protocolo de crisis — escalamiento secuencial
   Del cuerpo a la mente: fisiología → sentidos → respiración
   → frases → visualización → contacto humano → profesional.
   ============================================================ */

(function () {
    "use strict";

    var TOTAL_PASOS = 7;

    function irA(paso) {
        var id = paso === "cierre" ? "s-cierre"
            : paso === "entrada" ? "s-entrada"
            : "s-paso-" + paso;
        Faro.Screens.show(id);
        actualizarProgreso(paso);
    }

    function actualizarProgreso(paso) {
        var dots = document.getElementById("progress-dots");
        var label = document.getElementById("progress-label");
        var linea = document.getElementById("linea-emergencia");
        var esPaso = typeof paso === "number" || /^\d+$/.test(paso);

        dots.classList.toggle("hidden", !esPaso);
        dots.classList.toggle("flex", esPaso);
        linea.classList.toggle("hidden", !esPaso);

        if (esPaso) {
            var n = parseInt(paso, 10);
            dots.querySelectorAll(".dot").forEach(function (dot, i) {
                dot.style.background = i < n ? "var(--color-primary)" : "var(--faro-border)";
            });
            label.textContent = "Paso " + n + " de " + TOTAL_PASOS;
        }
    }

    /* Paso 6: contactos precargados desde Red de apoyo (C9) */
    function cargarContactos() {
        var lista = document.getElementById("contacto-lista");
        var vacio = document.getElementById("contacto-vacio");
        var contactos = Faro.Store.get("crisis-contacts", []);

        if (!contactos || contactos.length === 0) {
            vacio.classList.remove("hidden");
            return;
        }

        contactos.slice(0, 3).forEach(function (c) {
            var nombre = Faro.Util.escapeHtml(c.name);
            var relacion = c.relation ? Faro.Util.escapeHtml(c.relation) : "";
            var tel = c.phone ? String(c.phone).replace(/[^\d+]/g, "") : "";

            var card = document.createElement(tel ? "a" : "div");
            card.className = "faro-option-card block p-5 text-center";
            if (tel) card.href = "tel:" + tel;
            card.innerHTML =
                '<span class="font-semibold text-lg text-primary">' + nombre + "</span>" +
                (relacion ? '<span class="block text-base mt-1" style="color: var(--faro-text-secondary);">' + relacion + "</span>" : "") +
                (tel ? '<span class="mt-2 inline-flex items-center gap-2 font-semibold text-base-content">' +
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3A19.5 19.5 0 0 1 5.1 13 19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0 1 22 16.9z"/></svg>' +
                    "Llamar</span>" : "");
            lista.appendChild(card);
        });
    }

    document.querySelectorAll("[data-goto]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            var destino = btn.getAttribute("data-goto");
            irA(/^\d+$/.test(destino) ? parseInt(destino, 10) : destino);
        });
    });

    cargarContactos();
    Faro.Util.trackToolUse("protocolo", "Protocolo de crisis");

    /* Quien llega desde "Necesito ayuda ahora" ya declaró su intención:
       se salta la pantalla de entrada y parte directo en el paso 1.
       Quien llega desde el catálogo (sin hash) conserva la entrada. */
    if (window.location.hash === "#ahora") {
        irA(1);
    }
})();
