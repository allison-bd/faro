/* ============================================================
   A5 — Declaraciones de seguridad
   Frases de anclaje factual (no pensamiento positivo).
   Las favoritas aparecen primero en visitas futuras.
   El texto "respira" a ritmo 4 s / 4 s como guía pasiva.
   ============================================================ */

(function () {
    "use strict";

    /* Banco de frases — textos exactos del catálogo (15 fuentes profesionales) */
    var BANCO = {
        cuerpo: {
            nombre: "Qué le pasa a mi cuerpo",
            frases: [
                "Mi corazón está acelerado porque mi cuerpo se prepara para una emergencia que no existe",
                "La falta de aire no es real — estoy respirando demasiado rápido, no demasiado poco",
                "El mareo es hiperventilación, no un desmayo. Nunca me he desmayado por esto",
                "Las manos me hormiguean porque respiro rápido. Se pasa solo",
                "Mi cuerpo está haciendo lo que fue diseñado para hacer. Solo que ahora no lo necesita",
                "Esto no es un infarto. Es adrenalina. Es incómodo pero no peligroso",
                "La sensación de irrealidad es mi cerebro protegiéndose. No estoy perdiendo la razón"
            ]
        },
        antes: {
            nombre: "Ya he podido antes",
            frases: [
                "He tenido crisis antes y he sobrevivido a todas",
                "La última vez esto pasó en menos de 20 minutos",
                "La peor parte ya pasó muchas veces y siempre seguí adelante",
                "No existe un registro de alguien que haya muerto por un ataque de pánico",
                "Cada crisis que supero me demuestra que puedo con esto"
            ]
        },
        presente: {
            nombre: "Estoy aquí, estoy a salvo",
            frases: [
                "Ahora mismo estoy a salvo. Estoy en mi casa / en un lugar seguro",
                "No necesito hacer nada. Solo dejar que pase",
                "Esto es solo mi alarma sonando. No hay incendio real",
                "Puedo sentir esto y estar bien al mismo tiempo",
                "No tengo que pelear contra esto. Solo dejarlo pasar",
                "Este momento es temporal. Yo soy permanente"
            ]
        }
    };

    var $ = function (id) { return document.getElementById(id); };
    var categoriaActual = null;
    var frases = [];
    var idx = 0;

    /* Mostrar la tarjeta "Mis frases" solo si existen */
    function refrescarCardMias() {
        var mias = Faro.Store.get("a5-frases-propias", []);
        $("card-mias").classList.toggle("hidden", mias.length === 0);
    }
    refrescarCardMias();

    /* ---------- Selección de categoría ---------- */
    document.querySelectorAll("[data-categoria]").forEach(function (card) {
        card.addEventListener("click", function () {
            abrirCategoria(card.getAttribute("data-categoria"));
        });
    });

    function abrirCategoria(cat) {
        categoriaActual = cat;
        if (cat === "mias") {
            frases = Faro.Store.get("a5-frases-propias", []).slice();
            $("nombre-categoria").textContent = "Mis frases";
        } else {
            frases = BANCO[cat].frases.slice();
            $("nombre-categoria").textContent = BANCO[cat].nombre;
        }

        /* Las favoritas primero */
        var favoritas = Faro.Store.get("a5-favoritas", []);
        frases.sort(function (a, b) {
            var fa = favoritas.indexOf(a) !== -1 ? 0 : 1;
            var fb = favoritas.indexOf(b) !== -1 ? 0 : 1;
            return fa - fb;
        });

        idx = 0;
        mostrarFrase();
        Faro.Screens.show("s-frases");
        Faro.Util.trackToolUse("a5", "Declaraciones de seguridad");
    }

    function mostrarFrase() {
        if (frases.length === 0) {
            $("frase").textContent = "Aún no tienes frases guardadas.";
            $("posicion").textContent = "";
            return;
        }
        var el = $("frase");
        el.style.opacity = "0";
        setTimeout(function () {
            el.textContent = frases[idx];
            el.style.transition = "opacity 0.5s ease";
            el.style.opacity = "1";
        }, 200);
        $("posicion").textContent = (idx + 1) + " de " + frases.length;
        refrescarCorazon();
    }

    function refrescarCorazon() {
        var favoritas = Faro.Store.get("a5-favoritas", []);
        var esFav = favoritas.indexOf(frases[idx]) !== -1;
        $("icono-corazon").setAttribute("fill", esFav ? "currentColor" : "none");
        $("btn-favorita").setAttribute("aria-pressed", String(esFav));
    }

    /* ---------- Navegación (botones + deslizar) ---------- */
    $("btn-siguiente").addEventListener("click", function () {
        idx = (idx + 1) % frases.length;
        mostrarFrase();
    });
    $("btn-anterior").addEventListener("click", function () {
        idx = (idx - 1 + frases.length) % frases.length;
        mostrarFrase();
    });

    var touchX = null;
    document.getElementById("s-frases").addEventListener("touchstart", function (e) {
        touchX = e.touches[0].clientX;
    }, { passive: true });
    document.getElementById("s-frases").addEventListener("touchend", function (e) {
        if (touchX === null) return;
        var dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 60 && frases.length > 0) {
            idx = dx < 0 ? (idx + 1) % frases.length : (idx - 1 + frases.length) % frases.length;
            mostrarFrase();
        }
        touchX = null;
    }, { passive: true });

    /* ---------- Favoritas ---------- */
    $("btn-favorita").addEventListener("click", function () {
        if (frases.length === 0) return;
        var favoritas = Faro.Store.get("a5-favoritas", []);
        var frase = frases[idx];
        var pos = favoritas.indexOf(frase);
        if (pos === -1) favoritas.push(frase);
        else favoritas.splice(pos, 1);
        Faro.Store.set("a5-favoritas", favoritas);
        refrescarCorazon();
    });

    /* ---------- Frases propias ---------- */
    $("btn-agregar").addEventListener("click", function () {
        Faro.Screens.show("s-agregar");
    });
    $("btn-cancelar-frase").addEventListener("click", function () {
        Faro.Screens.show("s-frases");
    });
    $("btn-guardar-frase").addEventListener("click", function () {
        var texto = $("campo-frase").value.trim();
        if (!texto) return;
        Faro.Store.push("a5-frases-propias", texto, 100);
        $("campo-frase").value = "";
        refrescarCardMias();
        abrirCategoria("mias");
    });

    $("btn-volver").addEventListener("click", function () {
        refrescarCardMias();
        Faro.Screens.show("s-entrada");
    });
})();
