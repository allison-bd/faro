/* ============================================================
   C6 — Quiz de fortalezas de carácter (Peterson & Seligman)
   24 fortalezas en 6 grupos. Cada una con un ejemplo concreto.
   El resultado contradice la historia dominante de "soy débil".
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };

    var GRUPOS = [
        {
            nombre: "Sabiduría",
            fortalezas: [
                { id: "creatividad", nombre: "Creatividad", ejemplo: "Se me ocurren formas nuevas de hacer las cosas" },
                { id: "curiosidad", nombre: "Curiosidad", ejemplo: "Siempre quiero saber cómo funcionan las cosas" },
                { id: "pensamiento-critico", nombre: "Pensamiento crítico", ejemplo: "Examino las cosas desde todos los ángulos antes de decidir" },
                { id: "amor-aprender", nombre: "Amor por aprender", ejemplo: "Disfruto aprender cosas nuevas, aunque nadie me lo pida" }
            ]
        },
        {
            nombre: "Coraje",
            fortalezas: [
                { id: "valentia", nombre: "Valentía", ejemplo: "Hago lo que creo correcto aunque me dé miedo" },
                { id: "perseverancia", nombre: "Perseverancia", ejemplo: "Cuando empiezo algo, lo termino" },
                { id: "honestidad", nombre: "Honestidad", ejemplo: "Digo la verdad y actúo como soy, sin fingir" },
                { id: "entusiasmo", nombre: "Entusiasmo", ejemplo: "Hago las cosas con energía y ganas" }
            ]
        },
        {
            nombre: "Humanidad",
            fortalezas: [
                { id: "amor", nombre: "Amor", ejemplo: "Valoro y cuido mis relaciones cercanas" },
                { id: "amabilidad", nombre: "Amabilidad", ejemplo: "Ayudo a otros sin esperar nada a cambio" },
                { id: "inteligencia-social", nombre: "Inteligencia social", ejemplo: "Me doy cuenta de lo que sienten los demás" },
                { id: "perspectiva", nombre: "Perspectiva", ejemplo: "La gente me pide consejo porque veo el cuadro completo" }
            ]
        },
        {
            nombre: "Justicia",
            fortalezas: [
                { id: "trabajo-equipo", nombre: "Trabajo en equipo", ejemplo: "Cumplo mi parte y apoyo al grupo" },
                { id: "equidad", nombre: "Sentido de justicia", ejemplo: "Trato a todos por igual, sin favoritismos" },
                { id: "liderazgo", nombre: "Liderazgo", ejemplo: "Organizo al grupo para que las cosas pasen" },
                { id: "prudencia", nombre: "Prudencia", ejemplo: "Pienso antes de actuar; evito riesgos innecesarios" }
            ]
        },
        {
            nombre: "Templanza",
            fortalezas: [
                { id: "perdon", nombre: "Perdón", ejemplo: "No me quedo pegado/a en el rencor" },
                { id: "humildad", nombre: "Humildad", ejemplo: "Dejo que mis logros hablen por sí solos" },
                { id: "autorregulacion", nombre: "Autorregulación", ejemplo: "Puedo manejar mis impulsos y emociones" },
                { id: "apreciacion", nombre: "Apreciación de lo bello", ejemplo: "Me detengo a notar la belleza en lo cotidiano" }
            ]
        },
        {
            nombre: "Trascendencia",
            fortalezas: [
                { id: "gratitud", nombre: "Gratitud", ejemplo: "Noto y aprecio las cosas buenas que me pasan" },
                { id: "esperanza", nombre: "Esperanza", ejemplo: "Espero lo mejor del futuro y trabajo para conseguirlo" },
                { id: "humor", nombre: "Humor", ejemplo: "Puedo encontrar el lado cómico incluso en momentos difíciles" },
                { id: "espiritualidad", nombre: "Espiritualidad", ejemplo: "Siento que mi vida tiene un sentido más grande" }
            ]
        }
    ];

    var grupoIdx = 0;
    var respuestas = {};

    $("btn-empezar").addEventListener("click", function () {
        grupoIdx = 0;
        respuestas = {};
        pintarGrupo();
        Faro.Screens.show("s-grupo");
        Faro.Util.trackToolUse("c6", "Quiz de fortalezas");
    });

    function pintarGrupo() {
        var g = GRUPOS[grupoIdx];
        $("grupo-posicion").textContent = "Grupo " + (grupoIdx + 1) + " de 6";
        $("grupo-nombre").textContent = g.nombre;

        var cont = $("grupo-fortalezas");
        cont.innerHTML = "";
        g.fortalezas.forEach(function (f) {
            var div = document.createElement("div");
            div.className = "faro-option-card p-4";
            div.innerHTML =
                '<p class="font-semibold text-primary">' + f.nombre + "</p>" +
                '<p class="text-base italic mb-3" style="color: var(--faro-text-secondary);">"' + f.ejemplo + '"</p>' +
                '<div class="flex gap-2 flex-wrap" data-fortaleza="' + f.id + '">' +
                '<button class="faro-chip text-sm" data-nivel="si">Sí, esto es muy mío</button>' +
                '<button class="faro-chip text-sm" data-nivel="aveces">A veces</button>' +
                '<button class="faro-chip text-sm" data-nivel="no">No tanto</button>' +
                "</div>";
            cont.appendChild(div);
        });

        cont.querySelectorAll("[data-fortaleza]").forEach(function (fila) {
            fila.querySelectorAll(".faro-chip").forEach(function (chip) {
                chip.addEventListener("click", function () {
                    fila.querySelectorAll(".faro-chip").forEach(function (c) { c.classList.remove("selected"); });
                    chip.classList.add("selected");
                    respuestas[fila.getAttribute("data-fortaleza")] = chip.getAttribute("data-nivel");
                    verificarCompleto();
                });
            });
        });

        verificarCompleto();
        var pantalla = $("s-grupo");
        pantalla.classList.remove("active");
        void pantalla.offsetWidth;
        pantalla.classList.add("active");
    }

    function verificarCompleto() {
        var g = GRUPOS[grupoIdx];
        var completas = g.fortalezas.every(function (f) { return respuestas[f.id]; });
        var btn = $("btn-grupo-seguir");
        btn.disabled = !completas;
        btn.style.opacity = completas ? "1" : "0.5";
    }

    $("btn-grupo-seguir").addEventListener("click", function () {
        grupoIdx++;
        if (grupoIdx < GRUPOS.length) {
            pintarGrupo();
        } else {
            mostrarResultado();
        }
    });

    function mostrarResultado() {
        var principales = [];
        var secundarias = [];
        GRUPOS.forEach(function (g) {
            g.fortalezas.forEach(function (f) {
                if (respuestas[f.id] === "si") principales.push(f);
                else if (respuestas[f.id] === "aveces") secundarias.push(f);
            });
        });
        if (principales.length === 0) principales = secundarias;

        var cont = $("resultado-lista");
        cont.innerHTML = "";
        if (principales.length === 0) {
            cont.innerHTML = '<p class="faro-instruction" style="color: var(--faro-text-secondary);">Fuiste muy exigente contigo. Vuelve a intentarlo pensando en lo que dirían quienes te conocen bien.</p>';
        } else {
            principales.forEach(function (f) {
                var chip = document.createElement("span");
                chip.className = "faro-chip selected";
                chip.textContent = f.nombre;
                cont.appendChild(chip);
            });
            Faro.Store.set("c6-fortalezas", principales.map(function (f) { return f.nombre; }));
        }
        Faro.Screens.show("s-resultado");
    }

    $("btn-guardar").addEventListener("click", function () {
        var reflexion = $("campo-reflexion").value.trim();
        Faro.Store.set("c6-reflexion", { fecha: new Date().toISOString(), texto: reflexion });
        $("guardado").classList.remove("hidden");
    });
})();
