/* ============================================================
   FARO — núcleo compartido
   Tema claro/oscuro con persistencia + utilidades comunes
   que usan todas las herramientas.
   ============================================================ */

(function () {
    "use strict";

    /* ---------- TEMA ----------
       El atributo data-theme ya fue aplicado por el snippet inline
       del <head> (anti-parpadeo). Aquí solo se maneja el toggle. */

    var THEME_KEY = "faro-theme";

    function currentTheme() {
        return document.documentElement.getAttribute("data-theme") === "faro-dark"
            ? "faro-dark" : "faro-light";
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* modo privado */ }
        updateToggleIcon();
    }

    var ICON_SUN = '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
    var ICON_MOON = '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>';

    function updateToggleIcon() {
        var btn = document.getElementById("theme-toggle");
        if (!btn) return;
        var svg = btn.querySelector("svg");
        if (!svg) return;
        // Muestra el modo al que se puede cambiar: luna en claro, sol en oscuro
        svg.innerHTML = currentTheme() === "faro-light" ? ICON_MOON : ICON_SUN;
        btn.setAttribute("aria-label",
            currentTheme() === "faro-light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro");
    }

    function initTheme() {
        var btn = document.getElementById("theme-toggle");
        if (btn) {
            btn.addEventListener("click", function () {
                applyTheme(currentTheme() === "faro-light" ? "faro-dark" : "faro-light");
            });
        }
        updateToggleIcon();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initTheme);
    } else {
        initTheme();
    }

    /* ---------- ALMACENAMIENTO ----------
       localStorage con nombres de espacio "faro:*" y JSON seguro.
       (Persistencia local: si algún día hay backend, este es el
       único punto que habría que tocar.) */

    var Store = {
        get: function (key, fallback) {
            try {
                var raw = localStorage.getItem("faro:" + key);
                return raw === null ? (fallback !== undefined ? fallback : null) : JSON.parse(raw);
            } catch (e) {
                return fallback !== undefined ? fallback : null;
            }
        },
        set: function (key, value) {
            try {
                localStorage.setItem("faro:" + key, JSON.stringify(value));
                return true;
            } catch (e) {
                return false;
            }
        },
        remove: function (key) {
            try { localStorage.removeItem("faro:" + key); } catch (e) { /* noop */ }
        },
        /* Agrega una entrada a una lista persistida (historiales) */
        push: function (key, entry, maxEntries) {
            var list = Store.get(key, []);
            if (!Array.isArray(list)) list = [];
            list.push(entry);
            if (maxEntries && list.length > maxEntries) {
                list = list.slice(list.length - maxEntries);
            }
            Store.set(key, list);
            return list;
        }
    };

    /* ---------- UTILIDADES ---------- */

    var Util = {
        /* "2026-07-07" — clave de día local (no UTC) */
        todayKey: function (d) {
            d = d || new Date();
            return d.getFullYear() + "-" +
                String(d.getMonth() + 1).padStart(2, "0") + "-" +
                String(d.getDate()).padStart(2, "0");
        },
        /* "7 de julio, 21:30" — para historiales */
        formatDateTime: function (iso) {
            var d = new Date(iso);
            if (isNaN(d)) return "";
            return d.toLocaleDateString("es-CL", { day: "numeric", month: "long" }) +
                ", " + d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
        },
        formatDate: function (iso) {
            var d = new Date(iso);
            if (isNaN(d)) return "";
            return d.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
        },
        escapeHtml: function (str) {
            return String(str == null ? "" : str)
                .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        },
        /* Marca el uso de una herramienta (alimenta E5 Plan de emergencia) */
        trackToolUse: function (toolId, toolName) {
            var uses = Store.get("tool-uses", {});
            if (!uses[toolId]) uses[toolId] = { name: toolName, count: 0, last: null };
            uses[toolId].name = toolName;
            uses[toolId].count += 1;
            uses[toolId].last = new Date().toISOString();
            Store.set("tool-uses", uses);
        },
        /* Vibración suave si el dispositivo la soporta (nunca obligatoria) */
        vibrate: function (pattern) {
            if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) { /* noop */ } }
        },
        prefersReducedMotion: function () {
            return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        }
    };

    /* ---------- RELLENO DE SLIDERS ----------
       La paleta define pista + relleno hasta el thumb (sliderFill).
       Se pinta con un degradado en dos pasos según el valor; usa
       var() para adaptarse solo al cambio de tema. Los sliders con
       data-no-fill se excluyen (el termómetro B2 usa su propio
       gradiente de escala completa, según su ficha). */

    function pintarRellenoSlider(slider) {
        var min = parseFloat(slider.min || "0");
        var max = parseFloat(slider.max || "100");
        var pct = max > min ? ((slider.value - min) / (max - min)) * 100 : 0;
        slider.style.background = "linear-gradient(to right, var(--faro-slider-fill) " +
            pct + "%, var(--faro-slider-track) " + pct + "%)";
    }

    function initRellenoSliders(raiz) {
        (raiz || document).querySelectorAll('input[type="range"].faro-slider:not([data-no-fill])')
            .forEach(function (s) {
                if (s.dataset.fillInit) return;
                s.dataset.fillInit = "1";
                pintarRellenoSlider(s);
                s.addEventListener("input", function () { pintarRellenoSlider(s); });
            });
    }

    function initSliders() {
        initRellenoSliders(document);
        /* Sliders creados por JS después de la carga (ej: emociones
           del Registro Burns) se inicializan al aparecer en el DOM */
        if (window.MutationObserver) {
            new MutationObserver(function (mutaciones) {
                for (var i = 0; i < mutaciones.length; i++) {
                    if (mutaciones[i].addedNodes.length) {
                        initRellenoSliders(document);
                        return;
                    }
                }
            }).observe(document.body, { childList: true, subtree: true });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSliders);
    } else {
        initSliders();
    }

    /* ---------- NAVEGACIÓN DE PANTALLAS ----------
       Sistema secuencial que usan casi todas las herramientas:
       secciones .faro-screen, una .active a la vez. */

    var Screens = {
        show: function (id) {
            document.querySelectorAll(".faro-screen.active").forEach(function (el) {
                el.classList.remove("active");
            });
            var target = document.getElementById(id);
            if (target) {
                target.classList.add("active");
                window.scrollTo({ top: 0, behavior: "smooth" });
                /* Accesibilidad: anunciar y enfocar el nuevo contenido */
                var h = target.querySelector("h1, h2, h3, [data-focus]");
                if (h) {
                    h.setAttribute("tabindex", "-1");
                    h.focus({ preventScroll: true });
                }
            }
            return target;
        }
    };

    /* API pública */
    window.Faro = {
        Store: Store,
        Util: Util,
        Screens: Screens,
        applyTheme: applyTheme,
        currentTheme: currentTheme
    };
})();
