/* ============================================================
   B5 — Body scan guiado (protocolo FONDECYT Cerna & García)
   Observación sin juicio, zona por zona. Avance 100% automático.
   Duraciones: 5 / 10 / 20 min (las pausas escalan).
   Formatos: texto en pantalla / solo temporizador.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    /* Secuencia: pies → piernas → abdomen → pecho → manos → brazos
       → hombros → cuello → rostro → parte superior de la cabeza */
    var ZONAS = [
        { id: "z-pies", nombre: "Pies", frase: "tus pies" },
        { id: "z-piernas", nombre: "Piernas", frase: "tus piernas" },
        { id: "z-abdomen", nombre: "Abdomen", frase: "tu abdomen" },
        { id: "z-pecho", nombre: "Pecho", frase: "tu pecho" },
        { id: "z-manos", nombre: "Manos", frase: "tus manos" },
        { id: "z-brazos", nombre: "Brazos", frase: "tus brazos" },
        { id: "z-hombros", nombre: "Hombros", frase: "tus hombros" },
        { id: "z-cuello", nombre: "Cuello", frase: "tu cuello" },
        { id: "z-rostro", nombre: "Rostro", frase: "tu rostro" },
        { id: "z-cabeza", nombre: "Parte superior de la cabeza", frase: "la parte superior de tu cabeza" }
    ];

    /* Líneas por zona: [texto(frase), pausa base en segundos] */
    function lineasZona(frase, completas) {
        var todas = [
            ["Lleva tu atención a " + frase + ".", 3],
            ["Nota lo que sientes. ¿Hay temperatura? ¿Hormigueo? ¿Tensión? ¿Nada particular?", 8],
            ["Todo lo que sientas está bien. No necesitas cambiar nada.", 5],
            ["Respira hacia " + frase + ". Imagina que el aire llega hasta ahí.", 8],
            ["Al exhalar, suelta cualquier tensión que encuentres.", 5]
        ];
        return completas ? todas : [todas[0], todas[1], todas[4]];
    }

    /* Configuración por duración: qué líneas van y cómo escalan las pausas */
    var DURACIONES = {
        rapido: { completas: false, factor: 1 },     /* ≈ 5 min  */
        medio: { completas: true, factor: 1.6 },     /* ≈ 10 min */
        completo: { completas: true, factor: 3.4 }   /* ≈ 20 min */
    };

    var duracion = "rapido";
    var formato = "texto";
    var timers = [];
    var activo = false;
    var CIRC = 289;

    /* Selección con chips */
    document.querySelectorAll(".opcion-duracion").forEach(function (chip) {
        chip.addEventListener("click", function () {
            document.querySelectorAll(".opcion-duracion").forEach(function (c) { c.classList.remove("selected"); });
            chip.classList.add("selected");
            duracion = chip.getAttribute("data-duracion");
        });
    });
    document.querySelectorAll(".opcion-formato").forEach(function (chip) {
        chip.addEventListener("click", function () {
            document.querySelectorAll(".opcion-formato").forEach(function (c) { c.classList.remove("selected"); });
            chip.classList.add("selected");
            formato = chip.getAttribute("data-formato");
        });
    });

    $("btn-comenzar").addEventListener("click", function () {
        activo = true;
        document.body.classList.add("escaneando");
        document.querySelectorAll(".faro-body-zone").forEach(function (z) { z.classList.remove("active", "done"); });
        $("anillo-wrap").classList.toggle("hidden", formato !== "timer");
        Faro.Screens.show("s-practica");
        recorrerZona(0);
    });

    function espera(ms, fn) {
        timers.push(setTimeout(function () { if (activo) fn(); }, ms));
    }

    function mostrarLinea(texto) {
        var el = $("instruccion-scan");
        el.classList.remove("visible");
        espera(1000, function () {
            el.textContent = texto;
            el.classList.add("visible");
        });
    }

    function marcarZona(idx, estado) {
        ZONAS.forEach(function (z, i) {
            var g = document.getElementById(z.id);
            if (!g) return;
            g.querySelectorAll(".faro-body-zone").forEach(function (path) {
                path.classList.remove("active", "done");
                if (i < idx) path.classList.add("done");
                if (i === idx && estado === "active") path.classList.add("active");
            });
        });
    }

    function recorrerZona(idx) {
        if (!activo) return;
        if (idx >= ZONAS.length) { cerrar(); return; }

        var zona = ZONAS[idx];
        var conf = DURACIONES[duracion];
        $("nombre-zona").textContent = zona.nombre + " · " + (idx + 1) + " de " + ZONAS.length;
        marcarZona(idx, "active");

        if (formato === "texto") {
            var lineas = lineasZona(zona.frase, conf.completas);
            var i = 0;
            var siguiente = function () {
                if (!activo) return;
                if (i >= lineas.length) {
                    recorrerZona(idx + 1);
                    return;
                }
                mostrarLinea(lineas[i][0]);
                var pausa = lineas[i][1] * conf.factor * 1000 + 1600;
                i++;
                espera(pausa, siguiente);
            };
            siguiente();
        } else {
            /* Solo temporizador: anillo que se llena con el tiempo de la zona */
            var lineasRef = lineasZona(zona.frase, conf.completas);
            var totalZona = lineasRef.reduce(function (s, l) { return s + l[1]; }, 0) * conf.factor + lineasRef.length * 1.6;
            mostrarLinea(zona.nombre);
            var anillo = $("anillo-zona");
            anillo.style.transition = "none";
            anillo.style.strokeDashoffset = String(CIRC);
            void anillo.getBoundingClientRect();
            anillo.style.transition = "stroke-dashoffset " + totalZona + "s linear";
            anillo.style.strokeDashoffset = "0";
            espera(totalZona * 1000, function () { recorrerZona(idx + 1); });
        }
    }

    function cerrar() {
        marcarZona(ZONAS.length, "");
        mostrarLinea("Cuando estés listo/a, mueve los dedos suavemente. Abre los ojos despacio.");
        espera(10000, function () {
            document.body.classList.remove("escaneando");
            Faro.Screens.show("s-cierre");
        });
    }

    $("btn-detener").addEventListener("click", function () {
        activo = false;
        timers.forEach(clearTimeout);
        timers = [];
        document.body.classList.remove("escaneando");
        Faro.Screens.show("s-entrada");
    });

    $("slider-cierre").addEventListener("input", function () {
        $("valor-cierre").textContent = this.value;
    });

    $("btn-guardar").addEventListener("click", function () {
        Faro.Store.push("b5-registros", {
            fecha: new Date().toISOString(),
            duracion: duracion,
            valor: parseInt($("slider-cierre").value, 10)
        }, 200);
        Faro.Util.trackToolUse("b5", "Body scan guiado");
        $("guardado").classList.remove("hidden");
    });
})();
