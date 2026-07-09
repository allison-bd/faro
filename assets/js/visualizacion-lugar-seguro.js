/* ============================================================
   A6 — Visualización de lugar seguro
   MODO CRISIS: 6 escenarios preconstruidos (+ "Mi lugar" si
   existe). Guion sensorial automático con pausas de 5-10 s,
   fondo de color ambiental (nunca imagen literal).
   MODO TRANQUILO: constructor por selección visual que genera
   un guion personalizado.
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    /* Ilustraciones suaves por escenario (formas simples, tonos de la paleta) */
    var ILUSTRACIONES = {
        playa: '<svg viewBox="0 0 120 80" width="100%" height="50" aria-hidden="true"><circle cx="60" cy="46" r="16" fill="var(--color-accent)" opacity="0.85"/><path d="M0 56 Q15 50 30 56 T60 56 T90 56 T120 56 V80 H0 Z" fill="var(--color-primary)" opacity="0.5"/><path d="M0 64 Q15 58 30 64 T60 64 T90 64 T120 64 V80 H0 Z" fill="var(--color-primary)" opacity="0.75"/></svg>',
        bosque: '<svg viewBox="0 0 120 80" width="100%" height="50" aria-hidden="true"><path d="M30 70 L42 30 L54 70 Z" fill="var(--color-success)" opacity="0.7"/><path d="M55 70 L70 18 L85 70 Z" fill="var(--color-success)" opacity="0.9"/><path d="M82 70 L92 40 L102 70 Z" fill="var(--color-success)" opacity="0.6"/><rect x="0" y="70" width="120" height="10" rx="3" fill="var(--color-secondary)" opacity="0.4"/></svg>',
        lluvia: '<svg viewBox="0 0 120 80" width="100%" height="50" aria-hidden="true"><rect x="30" y="14" width="60" height="52" rx="6" fill="none" stroke="var(--color-secondary)" stroke-width="3" opacity="0.8"/><line x1="60" y1="14" x2="60" y2="66" stroke="var(--color-secondary)" stroke-width="2.5" opacity="0.6"/><line x1="30" y1="40" x2="90" y2="40" stroke="var(--color-secondary)" stroke-width="2.5" opacity="0.6"/><path d="M14 22 q-3 6 0 8 M20 40 q-3 6 0 8 M12 58 q-3 6 0 8 M102 30 q-3 6 0 8 M108 52 q-3 6 0 8" stroke="var(--faro-accent-purple)" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.7"/></svg>',
        jardin: '<svg viewBox="0 0 120 80" width="100%" height="50" aria-hidden="true"><circle cx="98" cy="16" r="10" fill="var(--color-accent)" opacity="0.9"/><g opacity="0.85"><circle cx="30" cy="46" r="7" fill="var(--color-primary)"/><circle cx="30" cy="46" r="2.5" fill="var(--color-accent)"/><circle cx="58" cy="52" r="7" fill="var(--color-error)" opacity="0.7"/><circle cx="58" cy="52" r="2.5" fill="var(--color-accent)"/><circle cx="84" cy="46" r="7" fill="var(--faro-accent-purple)"/><circle cx="84" cy="46" r="2.5" fill="var(--color-accent)"/></g><path d="M30 53 V70 M58 59 V70 M84 53 V70" stroke="var(--color-success)" stroke-width="2.5"/><rect x="0" y="70" width="120" height="10" rx="3" fill="var(--color-success)" opacity="0.4"/></svg>',
        lago: '<svg viewBox="0 0 120 80" width="100%" height="50" aria-hidden="true"><path d="M20 40 L40 14 L60 40 Z" fill="var(--faro-accent-purple)" opacity="0.55"/><path d="M50 40 L75 8 L100 40 Z" fill="var(--faro-accent-purple)" opacity="0.75"/><rect x="0" y="42" width="120" height="38" rx="4" fill="var(--color-primary)" opacity="0.35"/><path d="M20 54 h20 M55 60 h26 M30 68 h18" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/></svg>',
        noche: '<svg viewBox="0 0 120 80" width="100%" height="50" aria-hidden="true"><rect x="0" y="0" width="120" height="80" rx="8" fill="var(--faro-accent-purple)" opacity="0.22"/><circle cx="90" cy="20" r="9" fill="var(--color-accent)" opacity="0.9"/><g fill="var(--color-accent)"><circle cx="20" cy="14" r="1.8"/><circle cx="42" cy="26" r="1.4"/><circle cx="60" cy="10" r="1.8"/><circle cx="34" cy="44" r="1.2"/><circle cx="72" cy="34" r="1.5"/><circle cx="14" cy="34" r="1.3"/></g><path d="M0 66 Q30 58 60 66 T120 66 V80 H0 Z" fill="var(--color-neutral)" opacity="0.5"/></svg>',
        milugar: '<svg viewBox="0 0 120 80" width="100%" height="50" aria-hidden="true"><path d="M60 14 L60 66 M60 22 C70 14 84 14 94 20 C84 28 70 28 60 24 M60 34 C50 26 36 26 26 32 C36 40 50 40 60 36" stroke="var(--color-primary)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 66 h40" stroke="var(--color-primary)" stroke-width="3" stroke-linecap="round"/><path d="M60 14 l3 5 h-6 z" fill="var(--color-accent)"/></svg>'
    };

    /* Fondos ambientales: gradientes con los tonos de la paleta */
    var FONDOS = {
        playa: "linear-gradient(180deg, color-mix(in srgb, var(--color-accent) 45%, var(--color-base-100)) 0%, color-mix(in srgb, var(--color-primary) 65%, var(--color-neutral)) 100%)",
        bosque: "linear-gradient(180deg, color-mix(in srgb, var(--color-success) 40%, var(--color-neutral)) 0%, color-mix(in srgb, var(--color-success) 20%, var(--color-neutral)) 100%)",
        lluvia: "linear-gradient(180deg, color-mix(in srgb, var(--faro-accent-purple) 45%, var(--color-neutral)) 0%, color-mix(in srgb, var(--color-secondary) 40%, var(--color-neutral)) 100%)",
        jardin: "linear-gradient(180deg, color-mix(in srgb, var(--color-accent) 50%, var(--color-base-100)) 0%, color-mix(in srgb, var(--color-success) 45%, var(--color-neutral)) 100%)",
        lago: "linear-gradient(180deg, color-mix(in srgb, var(--faro-accent-purple) 40%, var(--color-neutral)) 0%, color-mix(in srgb, var(--color-primary) 45%, var(--color-neutral)) 100%)",
        noche: "linear-gradient(180deg, #1E1528 0%, #342848 60%, color-mix(in srgb, var(--color-secondary) 30%, #1E1528) 100%)",
        milugar: "linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 40%, var(--color-neutral)) 0%, color-mix(in srgb, var(--faro-accent-purple) 40%, var(--color-neutral)) 100%)"
    };

    /* Guiones: [texto, pausa en segundos después de mostrarlo] */
    var APERTURA = ["Cierra los ojos si puedes. Respira profundo una vez.", 5];
    var CIERRE = ["Cuando estés listo/a, abre los ojos lentamente.", 6];

    var ESCENARIOS = [
        {
            id: "playa", nombre: "Playa al atardecer", detalle: "Olas suaves, arena tibia, brisa salada",
            guion: [
                APERTURA,
                ["Imagina que estás sentado/a en la arena. Está tibia bajo tus manos.", 8],
                ["Escucha las olas. Van y vienen. Cada ola que se retira se lleva un poco de tensión.", 8],
                ["Siente la brisa en tu cara. Trae olor a sal y a mar.", 8],
                ["El sol se está poniendo. Los colores cambian lentamente. No tienes que hacer nada.", 8],
                ["Mira el horizonte. Es infinito. Este momento es solo tuyo.", 10],
                CIERRE
            ]
        },
        {
            id: "bosque", nombre: "Bosque de montaña", detalle: "Árboles altos, musgo, sonido de un arroyo",
            guion: [
                APERTURA,
                ["Estás de pie en un sendero, entre árboles altos. La luz baja en rayos suaves.", 8],
                ["Escucha el arroyo a lo lejos. El agua corre sin apuro, como lleva siglos haciéndolo.", 8],
                ["Toca el musgo de un tronco. Es fresco y blando bajo tus dedos.", 8],
                ["El aire huele a tierra y a hojas. Cada respiración te limpia un poco por dentro.", 8],
                ["Aquí todo crece lento. Nada apura al bosque. Nada te apura a ti.", 10],
                CIERRE
            ]
        },
        {
            id: "lluvia", nombre: "Habitación con lluvia afuera", detalle: "Manta, ventana, lluvia en el vidrio",
            guion: [
                APERTURA,
                ["Estás bajo una manta suave. Pesa justo lo necesario.", 8],
                ["Escucha la lluvia en el vidrio. Golpea suave, constante.", 8],
                ["Afuera está frío y mojado. Adentro estás tú, al abrigo y a salvo.", 8],
                ["Las gotas bajan por la ventana. Puedes seguir una con la mirada.", 8],
                ["No hay nada que hacer ahora. La lluvia se encarga del mundo.", 10],
                CIERRE
            ]
        },
        {
            id: "jardin", nombre: "Jardín soleado", detalle: "Flores, abejas, pasto tibio bajo los pies",
            guion: [
                APERTURA,
                ["Estás sentado/a en el pasto tibio. El sol te toca los hombros.", 8],
                ["Hay flores cerca. Mira sus colores, uno por uno.", 8],
                ["Escucha las abejas trabajar. Un zumbido tranquilo, de fondo.", 8],
                ["Pasa la mano por el pasto. Cada hoja es distinta.", 8],
                ["El jardín no se apura. Todo florece cuando le toca. Tú también.", 10],
                CIERRE
            ]
        },
        {
            id: "lago", nombre: "Orilla de un lago quieto", detalle: "Agua calma, reflejos, silencio",
            guion: [
                APERTURA,
                ["Estás en la orilla. El agua está tan calma que parece un espejo.", 8],
                ["Mira los reflejos: el cielo, los árboles, la luz.", 8],
                ["De vez en cuando, una onda suave cruza el agua y desaparece.", 8],
                ["Así pasan también los pensamientos: llegan, cruzan, se van.", 8],
                ["El silencio aquí no está vacío. Está lleno de calma.", 10],
                CIERRE
            ]
        },
        {
            id: "noche", nombre: "Noche estrellada en el campo", detalle: "Cielo despejado, grillos, aire fresco",
            guion: [
                APERTURA,
                ["Estás recostado/a mirando el cielo. Está despejado, lleno de estrellas.", 8],
                ["Escucha los grillos. Su canto marca el ritmo de la noche.", 8],
                ["El aire es fresco. Respíralo despacio.", 8],
                ["Cada estrella lleva ahí millones de años. Han visto pasar todo.", 8],
                ["Bajo este cielo, lo que te preocupa se ve pequeño. Tú puedes descansar.", 10],
                CIERRE
            ]
        }
    ];

    var escenarioActual = null;
    var timersVis = [];

    /* ---------- Grilla de escenarios ---------- */
    function pintarGrilla() {
        var grilla = $("grilla-escenarios");
        grilla.innerHTML = "";
        var lista = ESCENARIOS.slice();

        var miLugar = Faro.Store.get("a6-mi-lugar", null);
        if (miLugar) {
            lista.push({ id: "milugar", nombre: "Mi lugar", detalle: "El que construiste tú", guion: miLugar.guion });
        }

        lista.forEach(function (esc) {
            var card = document.createElement("button");
            card.className = "faro-option-card p-2 text-center";
            card.innerHTML = ILUSTRACIONES[esc.id] +
                '<span class="font-semibold text-base text-primary block mt-1">' + esc.nombre + "</span>" +
                '<span class="text-sm block mt-0.5" style="color: var(--faro-text-secondary);">' + esc.detalle + "</span>";
            card.addEventListener("click", function () { iniciarVisualizacion(esc); });
            grilla.appendChild(card);
        });
    }
    pintarGrilla();

    /* ---------- Reproducción del guion ---------- */
    function iniciarVisualizacion(esc) {
        escenarioActual = esc;
        limpiarTimers();
        $("escena-fondo").style.background = FONDOS[esc.id] || FONDOS.milugar;
        $("escena-fondo").classList.add("visible");
        $("capa-visualizacion").classList.add("visible");
        $("btn-salir-vis").classList.add("visible");
        $("fin-visualizacion").classList.remove("visible");
        Faro.Util.trackToolUse("a6", "Lugar seguro");

        reproducirLinea(0);
    }

    function reproducirLinea(i) {
        var guion = escenarioActual.guion;
        if (i >= guion.length) { terminarVisualizacion(); return; }

        var linea = $("linea-guion");
        linea.classList.remove("visible");

        timersVis.push(setTimeout(function () {
            linea.textContent = guion[i][0];
            linea.classList.add("visible");
            timersVis.push(setTimeout(function () {
                reproducirLinea(i + 1);
            }, guion[i][1] * 1000 + 1400));
        }, 900));
    }

    function terminarVisualizacion() {
        $("linea-guion").classList.remove("visible");
        $("fin-visualizacion").classList.add("visible");
    }

    function salirVisualizacion() {
        limpiarTimers();
        $("escena-fondo").classList.remove("visible");
        $("capa-visualizacion").classList.remove("visible");
        $("btn-salir-vis").classList.remove("visible");
        $("fin-visualizacion").classList.remove("visible");
        $("linea-guion").classList.remove("visible");
    }

    function limpiarTimers() {
        timersVis.forEach(clearTimeout);
        timersVis = [];
    }

    $("btn-salir-vis").addEventListener("click", salirVisualizacion);
    $("btn-repetir-vis").addEventListener("click", function () {
        $("fin-visualizacion").classList.remove("visible");
        iniciarVisualizacion(escenarioActual);
    });
    $("btn-otro-lugar").addEventListener("click", function () {
        salirVisualizacion();
        Faro.Screens.show("s-entrada");
    });

    /* ============================================================
       MODO TRANQUILO — Constructor de "Mi lugar"
       Selección visual, sin campos de texto (salvo "¿quién?")
       ============================================================ */

    var PASOS_CONSTRUCTOR = [
        { clave: "donde", pregunta: "¿Dónde está tu lugar?", multi: false, opciones: ["Al aire libre", "Espacio cerrado", "Un lugar real que existe"] },
        { clave: "compania", pregunta: "¿Estás solo/a o acompañado/a?", multi: false, opciones: ["Solo/a", "Con alguien", "Con una mascota"], campoSi: "Con alguien", campoPlaceholder: "¿Quién? (opcional)" },
        { clave: "sonidos", pregunta: "¿Qué escuchas?", multi: true, opciones: ["Olas", "Lluvia", "Pájaros", "Música", "Silencio", "Viento", "Río", "Fuego"] },
        { clave: "piel", pregunta: "¿Qué sientes en la piel?", multi: false, opciones: ["Sol tibio", "Brisa fresca", "Manta cálida", "Pasto", "Arena", "Nada particular"] },
        { clave: "olores", pregunta: "¿Qué hueles?", multi: true, opciones: ["Mar", "Flores", "Lluvia", "Madera", "Comida", "Tierra mojada", "Café"] }
    ];

    var pasoConstructor = 0;
    var respuestas = {};

    $("btn-crear").addEventListener("click", function () {
        pasoConstructor = 0;
        respuestas = {};
        pintarPasoConstructor();
        Faro.Screens.show("s-constructor");
    });

    $("btn-constructor-volver").addEventListener("click", function () {
        Faro.Screens.show("s-entrada");
    });

    function pintarPasoConstructor() {
        var paso = PASOS_CONSTRUCTOR[pasoConstructor];
        $("constructor-pregunta").textContent = paso.pregunta;

        var cont = $("constructor-opciones");
        cont.innerHTML = "";
        paso.opciones.forEach(function (op) {
            var chip = document.createElement("button");
            chip.className = "faro-chip";
            chip.textContent = op;
            chip.addEventListener("click", function () {
                if (paso.multi) {
                    chip.classList.toggle("selected");
                } else {
                    cont.querySelectorAll(".faro-chip").forEach(function (c) { c.classList.remove("selected"); });
                    chip.classList.add("selected");
                }
                var campo = $("constructor-campo");
                if (paso.campoSi) {
                    var mostrar = paso.campoSi === op && chip.classList.contains("selected");
                    campo.classList.toggle("hidden", !mostrar);
                    campo.placeholder = paso.campoPlaceholder || "";
                }
            });
            cont.appendChild(chip);
        });
        $("constructor-campo").classList.add("hidden");
        $("constructor-campo").value = "";
    }

    $("btn-constructor-seguir").addEventListener("click", function () {
        var paso = PASOS_CONSTRUCTOR[pasoConstructor];
        var seleccion = [];
        $("constructor-opciones").querySelectorAll(".faro-chip.selected").forEach(function (c) {
            seleccion.push(c.textContent);
        });
        if (seleccion.length === 0) return; /* requiere al menos una selección */

        respuestas[paso.clave] = paso.multi ? seleccion : seleccion[0];
        if (paso.campoSi && seleccion.indexOf(paso.campoSi) !== -1) {
            respuestas[paso.clave + "_detalle"] = $("constructor-campo").value.trim();
        }

        pasoConstructor++;
        if (pasoConstructor < PASOS_CONSTRUCTOR.length) {
            pintarPasoConstructor();
        } else {
            construirMiLugar();
        }
    });

    /* Genera el guion personalizado a partir de las selecciones */
    function construirMiLugar() {
        var g = [APERTURA.slice()];

        var donde = respuestas.donde;
        if (donde === "Al aire libre") g.push(["Estás en tu lugar, al aire libre. El espacio se abre tranquilo a tu alrededor.", 8]);
        else if (donde === "Espacio cerrado") g.push(["Estás en tu espacio, protegido/a. Aquí nada entra sin tu permiso.", 8]);
        else g.push(["Estás en ese lugar que conoces bien. Tu cuerpo lo reconoce y se afloja.", 8]);

        var comp = respuestas.compania;
        if (comp === "Solo/a") g.push(["Estás solo/a, y está bien. Este momento es completamente tuyo.", 8]);
        else if (comp === "Con una mascota") g.push(["Tu mascota está cerca. Su respiración tranquila marca el ritmo.", 8]);
        else {
            var quien = respuestas.compania_detalle;
            g.push([(quien ? quien + " está" : "Alguien querido está") + " contigo. Su presencia acompaña sin pedirte nada.", 8]);
        }

        if (respuestas.sonidos && respuestas.sonidos.length) {
            g.push(["Escucha: " + listar(respuestas.sonidos).toLowerCase() + ". Deja que ese sonido llene el espacio.", 8]);
        }
        if (respuestas.piel && respuestas.piel !== "Nada particular") {
            g.push(["Siente en la piel: " + respuestas.piel.toLowerCase() + ". Tu cuerpo reconoce esa sensación y confía.", 8]);
        }
        if (respuestas.olores && respuestas.olores.length) {
            g.push(["El aire trae olor a " + listar(respuestas.olores).toLowerCase() + ". Respíralo despacio.", 8]);
        }

        g.push(["Este lugar es tuyo. Puedes volver cada vez que lo necesites.", 10]);
        g.push(CIERRE.slice());

        Faro.Store.set("a6-mi-lugar", { creado: new Date().toISOString(), guion: g });
        pintarGrilla();
        Faro.Screens.show("s-construido");
    }

    function listar(arr) {
        if (arr.length === 1) return arr[0];
        return arr.slice(0, -1).join(", ") + " y " + arr[arr.length - 1];
    }

    $("btn-visitar-mi-lugar").addEventListener("click", function () {
        var miLugar = Faro.Store.get("a6-mi-lugar", null);
        if (miLugar) {
            iniciarVisualizacion({ id: "milugar", nombre: "Mi lugar", guion: miLugar.guion });
        }
    });
    $("btn-volver-grilla").addEventListener("click", function () {
        Faro.Screens.show("s-entrada");
    });
})();
