/* ============================================================
   A7 — Kit sensorial de emergencia
   3 técnicas de regulación fisiológica con variantes:
   AGUA (splash / manos / hielo), OLFATO (café / perfume /
   cocina / respiración nasal), TACTO (textura / ropa /
   automasaje). Cada paso puede ser: botón, timer o pausa.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    /* ---------- Guías paso a paso ----------
       tipo "boton": espera al usuario · "timer": cuenta N seg ·
       "pausa": espera N seg sin contador visible */
    var GUIAS = {
        agua: {
            titulo: "¿Qué tienes disponible?",
            indicador: "agua",
            notaCardiaca: true,
            variantes: [
                {
                    id: "splash", nombre: "Puedo mojarme la cara", sub: "Splash de agua fría",
                    pasos: [
                        { tipo: "boton", texto: "Ve al baño o la cocina. Abre el agua fría.", boton: "Ya estoy ahí" },
                        { tipo: "timer", secs: 30, texto: "Junta agua en tus manos y rocía tu cara. Frente, mejillas, mentón." },
                        { tipo: "timer", secs: 30, texto: "Repite. Mantén el agua un momento esta vez." }
                    ]
                },
                {
                    id: "manos", nombre: "Puedo poner las manos bajo agua", sub: "Muñecas bajo el chorro frío",
                    pasos: [
                        { tipo: "boton", texto: "Ve a un lavamanos. Abre el agua fría.", boton: "Ya estoy ahí" },
                        { tipo: "timer", secs: 60, texto: "Pon las manos y muñecas bajo el chorro. Nota el frío recorrer la piel." },
                        { tipo: "pausa", secs: 8, texto: "Cierra el agua. Nota cómo laten tus manos." }
                    ]
                },
                {
                    id: "hielo", nombre: "Tengo hielo", sub: "Frío intenso y localizado",
                    pasos: [
                        { tipo: "timer", secs: 60, texto: "Toma un hielo y apriétalo en tu mano. Enfócate en la sensación." },
                        { tipo: "timer", secs: 60, texto: "Ahora pásalo a la otra mano." }
                    ]
                },
                { id: "sin-agua", nombre: "No tengo acceso a agua", sub: "El olfato y el tacto también funcionan", redirigir: true }
            ]
        },
        olfato: {
            titulo: "¿Qué olor tienes cerca?",
            indicador: "olfato",
            variantes: [
                {
                    id: "cafe", nombre: "Café o té", sub: "El aroma más a mano",
                    pasos: [
                        { tipo: "pausa", secs: 3, texto: "Acerca el café a tu nariz. Pero no lo huelas todavía." },
                        { tipo: "timer", secs: 5, texto: "Ahora inhala lentamente por la nariz. Solo por la nariz." },
                        { tipo: "pausa", secs: 5, texto: "¿Qué notas? ¿Amargo? ¿Tostado? ¿Dulce? No necesitas responder, solo nota." },
                        { tipo: "timer", secs: 5, texto: "Repite. Intenta descubrir algo nuevo cada vez.", repetir: 3 }
                    ]
                },
                {
                    id: "perfume", nombre: "Perfume, colonia o crema", sub: "Un aroma conocido",
                    pasos: [
                        { tipo: "pausa", secs: 3, texto: "Acerca el perfume o la crema a tu nariz. Pero no lo huelas todavía." },
                        { tipo: "timer", secs: 5, texto: "Ahora inhala lentamente por la nariz. Solo por la nariz." },
                        { tipo: "pausa", secs: 5, texto: "¿Qué notas? ¿Floral? ¿Dulce? ¿Cítrico? No necesitas responder, solo nota." },
                        { tipo: "timer", secs: 5, texto: "Repite. Intenta descubrir algo nuevo cada vez.", repetir: 3 }
                    ]
                },
                {
                    id: "cocina", nombre: "Algo de la cocina", sub: "Canela, limón, hierbas",
                    pasos: [
                        { tipo: "pausa", secs: 3, texto: "Toma la canela, el limón o la hierba. Acércala a tu nariz sin oler todavía." },
                        { tipo: "timer", secs: 5, texto: "Ahora inhala lentamente por la nariz. Solo por la nariz." },
                        { tipo: "pausa", secs: 5, texto: "¿Qué notas? ¿Fresco? ¿Dulce? ¿Ácido? No necesitas responder, solo nota." },
                        { tipo: "timer", secs: 5, texto: "Repite. Intenta descubrir algo nuevo cada vez.", repetir: 3 }
                    ]
                },
                {
                    id: "nasal", nombre: "No tengo nada con olor fuerte", sub: "Respiración nasal profunda",
                    pasos: [
                        { tipo: "pausa", secs: 4, texto: "No necesitas ningún olor. Tu propia respiración sirve de ancla." },
                        { tipo: "timer", secs: 5, texto: "Inhala profundo por la nariz. Nota el aire frío al entrar." },
                        { tipo: "timer", secs: 5, texto: "Exhala por la nariz. Nota el aire tibio al salir." },
                        { tipo: "timer", secs: 5, texto: "Repite, siguiendo la temperatura del aire.", repetir: 3 }
                    ]
                }
            ]
        },
        tacto: {
            titulo: "¿Qué puedes tocar?",
            indicador: "tacto",
            variantes: [
                {
                    id: "textura", nombre: "Algo con textura", sub: "Tela, superficie, pulsera",
                    pasos: [
                        { tipo: "pausa", secs: 4, texto: "Toma el objeto. Ciérralo en tu mano un momento." },
                        { tipo: "timer", secs: 15, texto: "Recórrelo con los dedos, lento. ¿Es liso, rugoso, blando, firme?" },
                        { tipo: "timer", secs: 15, texto: "Busca un detalle que no habías notado: un borde, una costura, un relieve." },
                        { tipo: "timer", secs: 10, texto: "Cambia de mano. ¿Se siente igual?" }
                    ]
                },
                {
                    id: "ropa", nombre: "Mi propia ropa", sub: "Atención a la tela",
                    pasos: [
                        { tipo: "pausa", secs: 4, texto: "Toca la tela de tu ropa. Empieza por una manga o un borde." },
                        { tipo: "timer", secs: 15, texto: "Frótala suave entre los dedos. Nota la trama del tejido." },
                        { tipo: "timer", secs: 10, texto: "Aprieta la tela y suéltala. Siente cómo vuelve a su forma." },
                        { tipo: "timer", secs: 10, texto: "Pasa la palma por tu brazo, sobre la ropa. Presión firme y lenta." }
                    ]
                },
                {
                    id: "manos", nombre: "Solo mis manos", sub: "Automasaje",
                    pasos: [
                        { tipo: "timer", secs: 5, texto: "Junta tus manos. Presiona los pulgares uno contra otro. Fuerte." },
                        { tipo: "pausa", secs: 5, texto: "Suelta. Nota la diferencia entre tensión y alivio." },
                        { tipo: "timer", secs: 10, texto: "Frota tus palmas una contra otra, rápido, generando calor." },
                        { tipo: "timer", secs: 15, texto: "Coloca las palmas tibias sobre tus ojos cerrados." },
                        { tipo: "pausa", secs: 5, texto: "Nota la temperatura. Solo eso." }
                    ]
                }
            ]
        }
    };

    var tecnicaActual = null;
    var pasos = [];
    var pasoIdx = 0;
    var repeticionActual = 0;
    var timers = [];
    var CIRC = 351.9;

    /* ---------- Navegación básica ---------- */
    document.querySelectorAll("[data-volver]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            limpiar();
            Faro.Screens.show(btn.getAttribute("data-volver"));
        });
    });

    document.querySelectorAll("[data-tecnica]").forEach(function (card) {
        card.addEventListener("click", function () {
            abrirTecnica(card.getAttribute("data-tecnica"));
        });
    });

    function abrirTecnica(id) {
        tecnicaActual = id;
        var t = GUIAS[id];
        $("variante-titulo").textContent = t.titulo;
        var cont = $("variante-opciones");
        cont.innerHTML = "";
        t.variantes.forEach(function (v) {
            var card = document.createElement("button");
            card.className = "faro-option-card w-full p-5";
            card.innerHTML = '<span class="font-semibold text-lg text-primary block">' + v.nombre + "</span>" +
                '<span class="text-base" style="color: var(--faro-text-secondary);">' + v.sub + "</span>";
            card.addEventListener("click", function () {
                if (v.redirigir) {
                    Faro.Screens.show("s-entrada");
                    return;
                }
                iniciarGuia(v);
            });
            cont.appendChild(card);
        });
        Faro.Screens.show("s-variante");
    }

    /* ---------- Motor de pasos ---------- */
    function iniciarGuia(variante) {
        pasos = variante.pasos;
        pasoIdx = 0;
        repeticionActual = 0;

        var ind = GUIAS[tecnicaActual].indicador;
        $("ind-agua").classList.toggle("hidden", ind !== "agua");
        $("ind-olfato").classList.toggle("hidden", ind !== "olfato");
        $("ind-tacto").classList.toggle("hidden", ind !== "tacto");
        $("ind-tacto").classList.toggle("flex", ind === "tacto");
        $("nota-cardiaca").classList.toggle("hidden", !GUIAS[tecnicaActual].notaCardiaca);

        Faro.Screens.show("s-ejercicio");
        Faro.Util.trackToolUse("a7", "Kit sensorial de emergencia");
        ejecutarPaso();
    }

    function ejecutarPaso() {
        if (pasoIdx >= pasos.length) {
            Faro.Screens.show("s-cierre");
            return;
        }
        var paso = pasos[pasoIdx];
        $("texto-paso").textContent = paso.texto;
        $("btn-avanzar").classList.add("hidden");
        $("repeticion").textContent = "";

        if (paso.repetir && paso.repetir > 1) {
            $("repeticion").textContent = "Repetición " + (repeticionActual + 1) + " de " + paso.repetir;
        }

        if (paso.tipo === "boton") {
            $("btn-avanzar").textContent = paso.boton;
            $("btn-avanzar").classList.remove("hidden");
        } else {
            contar(paso.secs, paso.tipo === "timer");
            programar(paso.secs * 1000 + 400, function () {
                if (paso.repetir && repeticionActual < paso.repetir - 1) {
                    repeticionActual++;
                } else {
                    repeticionActual = 0;
                    pasoIdx++;
                }
                ejecutarPaso();
            });
        }
    }

    $("btn-avanzar").addEventListener("click", function () {
        pasoIdx++;
        ejecutarPaso();
    });

    /* Contador visible en el indicador de la técnica activa */
    function contar(secs, visible) {
        var ids = { agua: "cuenta-agua", olfato: "cuenta-olfato", tacto: "cuenta-tacto" };
        var el = $(ids[GUIAS[tecnicaActual].indicador]);
        var restante = secs;
        el.textContent = visible ? restante : "";

        /* Olfato: el anillo se llena con el tiempo del paso */
        if (GUIAS[tecnicaActual].indicador === "olfato") {
            var anillo = $("anillo-olfato");
            anillo.style.transition = "none";
            anillo.style.strokeDashoffset = String(CIRC);
            void anillo.getBoundingClientRect();
            anillo.style.transition = "stroke-dashoffset " + secs + "s linear";
            anillo.style.strokeDashoffset = "0";
        }

        var intervalo = setInterval(function () {
            restante--;
            if (restante < 1) { clearInterval(intervalo); el.textContent = ""; return; }
            if (visible) el.textContent = restante;
        }, 1000);
        timers.push(intervalo);
    }

    function programar(ms, fn) {
        timers.push(setTimeout(fn, ms));
    }

    function limpiar() {
        timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
        timers = [];
    }

    /* ---------- Cierre ---------- */
    $("btn-mejor").addEventListener("click", function () { Faro.Screens.show("s-final"); });
    $("btn-igual").addEventListener("click", function () { Faro.Screens.show("s-entrada"); });
    $("btn-mas").addEventListener("click", function () { Faro.Screens.show("s-necesito-mas"); });
})();
