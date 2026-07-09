/* ============================================================
   A1 — Respiración guiada
   4 variantes: cuadrada 4-4-4-4, simple 3 tiempos, 4-7-8,
   abdominal libre. Modo nocturno y vibración opcionales.
   El usuario no controla su respiración: sigue un ritmo externo
   (paradoja del control, Nardone).
   ============================================================ */

(function () {
    "use strict";

    /* ---------- Definición de variantes ---------- */
    var VARIANTES = {
        cuadrada: {
            visual: "cuadrado",
            fases: [
                { texto: "Inhala", secs: 4, tipo: "in" },
                { texto: "Sostén", secs: 4, tipo: "hold" },
                { texto: "Exhala", secs: 4, tipo: "out" },
                { texto: "Sostén", secs: 4, tipo: "hold" }
            ]
        },
        simple: {
            visual: "circulo",
            fases: [
                { texto: "Inhala", secs: 3, tipo: "in", beat: "1" },
                { texto: "Mantén", secs: 3, tipo: "hold", beat: "2" },
                { texto: "Exhala con fuerza", secs: 3, tipo: "out", beat: "3" }
            ]
        },
        "478": {
            visual: "circulo",
            fases: [
                { texto: "Inhala", secs: 4, tipo: "in" },
                { texto: "Mantén", secs: 7, tipo: "hold" },
                { texto: "Exhala", secs: 8, tipo: "out" }
            ]
        },
        abdominal: {
            visual: "circulo",
            libre: true,
            fases: [
                { texto: "El aire baja al abdomen", secs: 5, tipo: "in" },
                { texto: "Sale suave, sin apuro", secs: 5, tipo: "out" }
            ]
        }
    };

    var varianteActual = "cuadrada";
    var vibrar = false;
    var faseIdx = 0;
    var timerFase = null;
    var timerConteo = null;
    var activo = false;
    var reducirMovimiento = Faro.Util.prefersReducedMotion();

    /* ---------- Selección de variante ---------- */
    document.querySelectorAll("[data-variante]").forEach(function (card) {
        card.addEventListener("click", function () {
            document.querySelectorAll("[data-variante]").forEach(function (c) {
                c.classList.remove("selected");
                c.setAttribute("aria-checked", "false");
            });
            card.classList.add("selected");
            card.setAttribute("aria-checked", "true");
            varianteActual = card.getAttribute("data-variante");
        });
    });

    /* Vibración: solo se ofrece si el dispositivo la soporta */
    if (navigator.vibrate) {
        document.getElementById("fila-vibracion").classList.remove("hidden");
    }

    /* ---------- Comenzar ---------- */
    document.getElementById("btn-comenzar").addEventListener("click", function () {
        vibrar = document.getElementById("chk-vibracion").checked;
        document.body.classList.toggle("modo-nocturno", document.getElementById("chk-nocturno").checked);

        var v = VARIANTES[varianteActual];
        document.getElementById("visual-cuadrado").classList.toggle("hidden", v.visual !== "cuadrado");
        document.getElementById("visual-cuadrado").classList.toggle("flex", v.visual === "cuadrado");
        document.getElementById("visual-circulo").classList.toggle("hidden", v.visual !== "circulo");
        document.getElementById("visual-circulo").classList.toggle("flex", v.visual === "circulo");

        Faro.Screens.show("s-ejercicio");
        activo = true;
        faseIdx = 0;
        ejecutarFase();
    });

    /* ---------- Motor de fases ---------- */
    function ejecutarFase() {
        if (!activo) return;
        var v = VARIANTES[varianteActual];
        var fase = v.fases[faseIdx % v.fases.length];

        if (vibrar) Faro.Util.vibrate(fase.tipo === "hold" ? [60, 80, 60] : 90);

        var anuncio = fase.texto + (v.libre ? "" : ", " + fase.secs + " segundos");
        document.getElementById("fase-viva").textContent = anuncio;

        if (v.visual === "cuadrado") {
            animarCuadrado(fase);
        } else {
            animarCirculo(fase, v);
        }

        iniciarConteo(fase, v);

        timerFase = setTimeout(function () {
            faseIdx++;
            ejecutarFase();
        }, fase.secs * 1000);
    }

    function iniciarConteo(fase, v) {
        clearInterval(timerConteo);
        var mostrar = function (n) {
            var val = v.libre ? "" : (fase.beat ? fase.beat : String(n));
            var elSq = document.getElementById("contador-sq");
            var elCi = document.getElementById("contador-ci");
            if (elSq) elSq.textContent = val;
            if (elCi) elCi.textContent = val;
        };
        var restante = fase.secs;
        mostrar(restante);
        if (v.libre || fase.beat) return; /* sin cuenta regresiva */
        timerConteo = setInterval(function () {
            restante--;
            if (restante >= 1) mostrar(restante);
        }, 1000);
    }

    /* ---------- Visual cuadrado: el faro recorre los bordes ---------- */
    /* Esquinas del cuadrado de 250px, con el beacon de 40px centrado en el vértice */
    var ESQUINAS = [
        { top: -22, left: -22 },   /* superior izquierda */
        { top: -22, left: 232 },   /* superior derecha */
        { top: 232, left: 232 },   /* inferior derecha */
        { top: 232, left: -22 }    /* inferior izquierda */
    ];

    function animarCuadrado(fase) {
        var beacon = document.getElementById("beacon");
        var texto = document.getElementById("texto-sq");
        var scaler = document.getElementById("text-scaler-sq");
        var lado = faseIdx % 4;

        texto.textContent = fase.texto;
        beacon.classList.toggle("beacon-hold", fase.tipo === "hold");

        var desde = ESQUINAS[lado];
        var hasta = ESQUINAS[(lado + 1) % 4];

        if (reducirMovimiento) {
            beacon.style.transition = "none";
            beacon.style.top = hasta.top + "px";
            beacon.style.left = hasta.left + "px";
            scaler.style.animation = "none";
            scaler.style.transform = "none";
            return;
        }

        beacon.style.transition = "none";
        beacon.style.top = desde.top + "px";
        beacon.style.left = desde.left + "px";
        /* forzar reflujo para reiniciar la transición */
        void beacon.offsetWidth;
        beacon.style.transition = "top " + fase.secs + "s linear, left " + fase.secs + "s linear";
        beacon.style.top = hasta.top + "px";
        beacon.style.left = hasta.left + "px";

        /* El texto central respira con la fase */
        scaler.style.animation = "none";
        if (fase.tipo === "in") {
            scaler.style.transition = "transform " + fase.secs + "s ease-in-out";
            scaler.style.transform = "scale(1.18)";
        } else if (fase.tipo === "out") {
            scaler.style.transition = "transform " + fase.secs + "s ease-in-out";
            scaler.style.transform = "scale(1)";
        } else {
            var escala = scaler.style.transform === "scale(1.18)" ? 1.18 : 1;
            scaler.style.setProperty("--hold-scale", escala);
            scaler.style.animation = "hold-pulse " + fase.secs + "s ease-in-out";
        }
    }

    /* ---------- Visual círculo: se expande y contrae ---------- */
    function animarCirculo(fase, v) {
        var circulo = document.getElementById("circulo");
        var texto = document.getElementById("texto-ci");
        texto.textContent = fase.texto;

        if (reducirMovimiento) {
            circulo.style.transition = "none";
            circulo.style.transform = "none";
            return;
        }

        circulo.style.transition = "transform " + fase.secs + "s " + (v.libre ? "ease-in-out" : "linear");
        if (fase.tipo === "in") {
            circulo.style.transform = "scale(1.45)";
        } else if (fase.tipo === "out") {
            circulo.style.transform = "scale(1)";
        }
        /* hold: mantiene el tamaño actual, sin animación nueva */
    }

    /* ---------- Terminar y autoevaluación ---------- */
    document.getElementById("btn-terminar").addEventListener("click", function () {
        detener();
        prepararCierre();
        Faro.Screens.show("s-cierre");
    });

    function detener() {
        activo = false;
        clearTimeout(timerFase);
        clearInterval(timerConteo);
    }

    var slider = document.getElementById("slider-cierre");
    slider.addEventListener("input", function () {
        document.getElementById("valor-cierre").textContent = slider.value;
    });

    function prepararCierre() {
        /* Comparación con registros previos, si existen */
        var registros = Faro.Store.get("a1-registros", []);
        var comp = document.getElementById("comparacion");
        if (registros.length > 0) {
            var ultimo = registros[registros.length - 1];
            comp.textContent = "La vez anterior terminaste en " + ultimo.valor + ". Mueve el número hasta donde estés hoy.";
            comp.classList.remove("hidden");
        }
    }

    document.getElementById("btn-guardar").addEventListener("click", function () {
        var valor = parseInt(slider.value, 10);
        var registros = Faro.Store.get("a1-registros", []);
        var comp = document.getElementById("comparacion");

        if (registros.length > 0) {
            var ultimo = registros[registros.length - 1];
            if (valor > ultimo.valor) {
                comp.textContent = "La vez anterior: " + ultimo.valor + ". Hoy: " + valor + ". Tu cuerpo está aprendiendo a soltar.";
            } else {
                comp.textContent = "Guardado. Cada vez que respiras con guía, entrenas la calma — aunque el número no siempre lo muestre.";
            }
            comp.classList.remove("hidden");
        } else {
            comp.textContent = "Guardado. Este es tu primer registro: la próxima vez podrás comparar.";
            comp.classList.remove("hidden");
        }

        Faro.Store.push("a1-registros", {
            fecha: new Date().toISOString(),
            variante: varianteActual,
            valor: valor
        }, 200);
        Faro.Util.trackToolUse("a1", "Respiración guiada");

        document.getElementById("btn-guardar").disabled = true;
        document.getElementById("btn-guardar").style.opacity = "0.5";
    });

    document.getElementById("btn-repetir").addEventListener("click", function () {
        document.getElementById("btn-guardar").disabled = false;
        document.getElementById("btn-guardar").style.opacity = "1";
        document.getElementById("comparacion").classList.add("hidden");
        Faro.Screens.show("s-config");
    });
})();
