/* ============================================================
   A3 — Relajación muscular progresiva (Jacobson)
   Tensión 6 s (el anillo se llena) + distensión 16 s (se vacía).
   Silueta corporal: la zona activa se enciende; al completarse,
   queda en tono de "soltado".
   Versiones: Completa (13 grupos) y Rápida (manos, hombros,
   mandíbula — donde más se acumula la tensión de ansiedad).
   ============================================================ */

(function () {
    "use strict";

    var SEG_TENSION = 6;    /* dentro del rango 5-7 s de la técnica */
    var SEG_SOLTAR = 16;    /* dentro del rango 15-20 s */
    var CIRCUNFERENCIA = 351.9; /* 2πr con r=56 */

    var GRUPOS = [
        { zona: "z-manos", nombre: "Manos y antebrazos", tensar: "Aprieta los puños. Fuerte, como si exprimieras una esponja.", soltar: "Suelta. Deja que las manos se abran solas." },
        { zona: "z-biceps", nombre: "Bíceps", tensar: "Dobla los brazos y aprieta los bíceps.", soltar: "Suelta. Deja que los brazos caigan pesados." },
        { zona: "z-frente", nombre: "Frente y cejas", tensar: "Levanta las cejas lo más alto que puedas. Arruga la frente.", soltar: "Suelta. Siente la frente lisa." },
        { zona: "z-ojos", nombre: "Ojos y nariz", tensar: "Cierra los ojos con fuerza y arruga la nariz.", soltar: "Suelta. Deja los párpados suaves." },
        { zona: "z-mandibula", nombre: "Mandíbula", tensar: "Aprieta los dientes y tensa la mandíbula.", soltar: "Suelta. Deja la boca entreabierta, floja." },
        { zona: "z-cuello", nombre: "Cuello", tensar: "Lleva el mentón hacia el pecho y tensa el cuello.", soltar: "Suelta. Deja que la cabeza vuelva sola a su lugar." },
        { zona: "z-hombros", nombre: "Hombros", tensar: "Sube los hombros hacia las orejas. Sostén.", soltar: "Suelta. Déjalos caer de una vez." },
        { zona: "z-pecho", nombre: "Pecho", tensar: "Inhala profundo y tensa el pecho, sosteniendo el aire.", soltar: "Exhala. Deja que el pecho se ablande." },
        { zona: "z-abdomen", nombre: "Abdomen", tensar: "Aprieta el abdomen, como si esperaras un golpe suave.", soltar: "Suelta. Deja que el aire llegue hasta ahí." },
        { zona: "z-gluteos", nombre: "Glúteos", tensar: "Aprieta los glúteos con fuerza.", soltar: "Suelta. Nota cómo tu peso se hunde en el asiento." },
        { zona: "z-muslos", nombre: "Muslos", tensar: "Tensa los muslos. Estíralos si puedes.", soltar: "Suelta. Déjalos pesados." },
        { zona: "z-pantorrillas", nombre: "Pantorrillas", tensar: "Apunta los pies hacia arriba y tensa las pantorrillas.", soltar: "Suelta. Deja caer los pies." },
        { zona: "z-pies", nombre: "Pies", tensar: "Encoge los dedos de los pies. Apriétalos.", soltar: "Suelta. Deja los pies planos y tibios." }
    ];

    /* Rápida: los 3 grupos donde más se acumula tensión de ansiedad */
    var RAPIDA = ["z-manos", "z-hombros", "z-mandibula"];

    var secuencia = [];
    var idx = 0;
    var timers = [];
    var activo = false;

    var $ = function (id) { return document.getElementById(id); };

    $("btn-completa").addEventListener("click", function () { iniciar(GRUPOS); });
    $("btn-rapida").addEventListener("click", function () {
        iniciar(GRUPOS.filter(function (g) { return RAPIDA.indexOf(g.zona) !== -1; }));
    });

    function iniciar(grupos) {
        secuencia = grupos;
        idx = 0;
        activo = true;
        document.querySelectorAll(".faro-body-zone").forEach(function (z) {
            z.classList.remove("active", "done");
        });
        Faro.Screens.show("s-ejercicio");
        ejecutarGrupo();
    }

    function limpiarTimers() {
        timers.forEach(clearTimeout);
        timers = [];
    }

    function espera(ms, fn) {
        timers.push(setTimeout(function () { if (activo) fn(); }, ms));
    }

    function marcarZona(zona, estado) {
        var g = document.getElementById(zona);
        if (!g) return;
        g.querySelectorAll(".faro-body-zone").forEach(function (z) {
            z.classList.remove("active", "done");
            if (estado) z.classList.add(estado);
        });
    }

    /* Anillo: llenar durante la tensión, vaciar durante la distensión */
    function animarAnillo(desde, hasta, secs) {
        var anillo = $("anillo");
        anillo.style.transition = "none";
        anillo.style.strokeDashoffset = String(CIRCUNFERENCIA * (1 - desde));
        void anillo.getBoundingClientRect();
        anillo.style.transition = "stroke-dashoffset " + secs + "s linear";
        anillo.style.strokeDashoffset = String(CIRCUNFERENCIA * (1 - hasta));
    }

    function cuentaRegresiva(secs) {
        var el = $("segundos");
        var restante = secs;
        el.textContent = restante;
        var intervalo = setInterval(function () {
            restante--;
            if (!activo || restante < 1) { clearInterval(intervalo); return; }
            el.textContent = restante;
        }, 1000);
        timers.push(intervalo);
    }

    function ejecutarGrupo() {
        if (!activo) return;
        if (idx >= secuencia.length) { terminar(); return; }

        var grupo = secuencia[idx];
        $("nombre-grupo").textContent = grupo.nombre + " · " + (idx + 1) + " de " + secuencia.length;
        marcarZona(grupo.zona, "active");

        /* 1. Instrucción de tensión (aparece con la animación de pantalla) */
        $("instruccion").textContent = grupo.tensar;
        $("fase-etiqueta").textContent = "Prepárate...";
        $("segundos").textContent = "";

        espera(2500, function () {
            /* 2. Fase de tensión: el anillo se llena */
            $("fase-etiqueta").textContent = "Tensa";
            animarAnillo(0, 1, SEG_TENSION);
            cuentaRegresiva(SEG_TENSION);

            espera(SEG_TENSION * 1000, function () {
                /* 3. Instrucción de soltar + anillo se vacía lentamente */
                $("instruccion").textContent = grupo.soltar;
                $("fase-etiqueta").textContent = "Suelta";
                animarAnillo(1, 0, SEG_SOLTAR);
                cuentaRegresiva(SEG_SOLTAR);

                espera(SEG_SOLTAR * 1000, function () {
                    /* 4. La zona queda "soltada" y pasamos a la siguiente */
                    marcarZona(grupo.zona, "done");
                    idx++;
                    espera(900, ejecutarGrupo);
                });
            });
        });
    }

    function terminar() {
        activo = false;
        limpiarTimers();
        Faro.Util.trackToolUse("a3", "Relajación muscular progresiva");
        Faro.Screens.show("s-cierre");
    }

    $("btn-detener").addEventListener("click", function () {
        activo = false;
        limpiarTimers();
        Faro.Screens.show("s-entrada");
    });

    $("btn-repetir").addEventListener("click", function () {
        Faro.Screens.show("s-entrada");
    });
})();
