/* ============================================================
   A2 — Grounding 5-4-3-2-1
   Focalización sensorial progresiva. Dos variantes:
   - Clásica: objetos reales, avance controlado por el usuario
   - Para dormir: objetos imaginados, avance automático (8-10 s)
     y oscurecimiento gradual al final.
   ============================================================ */

(function () {
    "use strict";

    var ICONOS = {
        ver: '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
        tocar: '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 11V6a1.5 1.5 0 0 1 3 0v4"/><path d="M11 10.5V4.5a1.5 1.5 0 0 1 3 0V10"/><path d="M14 10V6a1.5 1.5 0 0 1 3 0v6"/><path d="M17 12V9.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-2c-2 0-3-.5-4.5-2.5L5 14c-.7-1-.5-2 .5-2.3.8-.2 1.5.1 2 .8l1 1.5"/></svg>',
        oir: '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"/></svg>',
        oler: '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c-2 4-4 6-4 9.5a4 4 0 0 0 8 0C16 9 14 7 12 3z"/><path d="M8 18c1.5 1.5 2.5 2 4 3 1.5-1 2.5-1.5 4-3"/></svg>',
        agradecer: '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.5-1.5 3-3.2 3-5.2A4.8 4.8 0 0 0 13.6 5l-1.6 1.6L10.4 5A4.8 4.8 0 0 0 2 8.8c0 2 1.5 3.7 3 5.2l7 6.5z"/></svg>'
    };

    var PASOS_CLASICO = [
        { icono: "ver", cuenta: 5, instruccion: "Mira a tu alrededor. Nombra 5 cosas que puedas ver.", sub: "Dilas en voz alta o en tu mente. Con calma, una por una." },
        { icono: "tocar", cuenta: 4, instruccion: "Toca 4 cosas y nota su textura.", sub: "¿Es suave, fría, rugosa, tibia?" },
        { icono: "oir", cuenta: 3, instruccion: "Escucha. Identifica 3 sonidos.", sub: "Cercanos o lejanos. Los que sean." },
        { icono: "oler", cuenta: 2, instruccion: "Encuentra 2 olores.", sub: "Tu ropa, el aire, tu piel. Lo que tengas cerca." },
        { icono: "agradecer", cuenta: 1, instruccion: "Nombra 1 cosa por la que estés agradecido/a.", sub: "Puede ser pequeña. Hoy cuenta igual." }
    ];

    var PASOS_DORMIR = [
        { icono: "ver", cuenta: 5, instruccion: "Imagina 5 cosas que te gustaría estar viendo ahora.", sub: "Un paisaje, una cara, una luz. Sin apuro." },
        { icono: "tocar", cuenta: 4, instruccion: "Evoca la sensación de 4 texturas suaves.", sub: "Una manta, arena tibia, agua, pasto." },
        { icono: "oir", cuenta: 3, instruccion: "Recuerda 3 sonidos que te den paz.", sub: "Lluvia, olas, una voz querida." },
        { icono: "oler", cuenta: 2, instruccion: "Trae a tu memoria 2 olores que te gusten.", sub: "Pan recién hecho, tierra mojada, café." },
        { icono: "agradecer", cuenta: 1, instruccion: "Piensa en 1 cosa buena de hoy.", sub: "Aunque haya sido un día difícil, hubo una." }
    ];

    var modo = "clasico";
    var pasoIdx = 0;
    var notadas = 0;
    var timerDormir = null;

    var $ = function (id) { return document.getElementById(id); };

    /* ---------- Entrada ---------- */
    $("btn-clasico").addEventListener("click", function () { iniciar("clasico"); });
    $("btn-dormir").addEventListener("click", function () { iniciar("dormir"); });

    function iniciar(m) {
        modo = m;
        pasoIdx = 0;
        document.body.classList.toggle("modo-dormir", m === "dormir");
        $("progreso-sentidos").classList.remove("hidden");
        $("progreso-sentidos").classList.add("flex");
        $("controles-clasico").style.display = m === "clasico" ? "" : "none";
        Faro.Screens.show("s-ejercicio");
        mostrarPaso();
    }

    /* ---------- Un paso por sentido ---------- */
    function mostrarPaso() {
        var pasos = modo === "clasico" ? PASOS_CLASICO : PASOS_DORMIR;
        if (pasoIdx >= pasos.length) { cerrar(); return; }

        var paso = pasos[pasoIdx];
        notadas = 0;

        $("icono-sentido").innerHTML = ICONOS[paso.icono];
        $("instruccion").textContent = paso.instruccion;
        $("sub-instruccion").textContent = paso.sub;
        $("anuncio").textContent = paso.instruccion;

        /* puntos por notar */
        var puntos = $("puntos");
        puntos.innerHTML = "";
        for (var i = 0; i < paso.cuenta; i++) {
            var p = document.createElement("div");
            p.className = "punto-sentido";
            puntos.appendChild(p);
        }

        /* indicador superior */
        document.querySelectorAll(".icono-progreso").forEach(function (ic, i) {
            ic.classList.toggle("actual", i === pasoIdx);
            ic.classList.toggle("hecho", i < pasoIdx);
        });

        if (modo === "dormir") {
            /* Instrucción que aparece y se desvanece; los puntos se llenan solos */
            var inst = $("instruccion");
            inst.classList.remove("instruccion-dormir");
            void inst.offsetWidth;
            inst.classList.add("instruccion-dormir");

            var porPunto = 9000; /* 9 s por elemento imaginado */
            var relleno = 0;
            clearInterval(timerDormir);
            timerDormir = setInterval(function () {
                if (relleno < paso.cuenta) {
                    puntos.children[relleno].classList.add("notado");
                    relleno++;
                } else {
                    clearInterval(timerDormir);
                    pasoIdx++;
                    mostrarPaso();
                }
            }, porPunto);
        }
    }

    /* ---------- Controles del modo clásico ---------- */
    $("btn-notar").addEventListener("click", function () {
        var puntos = $("puntos").children;
        if (notadas < puntos.length) {
            puntos[notadas].classList.add("notado");
            notadas++;
        }
        if (notadas >= puntos.length) {
            setTimeout(function () { pasoIdx++; mostrarPaso(); }, 600);
        }
    });

    $("btn-saltar").addEventListener("click", function () {
        pasoIdx++;
        mostrarPaso();
    });

    /* ---------- Cierre ---------- */
    function cerrar() {
        document.querySelectorAll(".icono-progreso").forEach(function (ic) {
            ic.classList.remove("actual");
            ic.classList.add("hecho");
        });
        Faro.Util.trackToolUse("a2", "Grounding 5-4-3-2-1");

        if (modo === "dormir") {
            /* La pantalla se oscurece gradualmente; sin botones que interrumpan */
            $("instruccion").textContent = "Deja que los ojos se cierren cuando quieran.";
            $("sub-instruccion").textContent = "Buenas noches.";
            $("icono-sentido").innerHTML = "";
            $("puntos").innerHTML = "";
            setTimeout(function () {
                $("velo-final").classList.add("caer");
            }, 4000);
        } else {
            Faro.Screens.show("s-cierre");
        }
    }

    $("btn-repetir").addEventListener("click", function () {
        document.body.classList.remove("modo-dormir");
        $("velo-final").classList.remove("caer");
        $("progreso-sentidos").classList.add("hidden");
        $("progreso-sentidos").classList.remove("flex");
        Faro.Screens.show("s-entrada");
    });
})();
