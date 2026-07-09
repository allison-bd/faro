/* ============================================================
   E5 — Plan de emergencia personalizado (Beyebach, prevención
   de recaídas). Se construye MIENTRAS la persona está bien.
   Autocompleta desde el uso real de Faro:
   - herramientas más usadas (clave "tool-uses")
   - personas de la Red de apoyo (C9, clave "red-apoyo")
   - frases favoritas de Declaraciones (A5, clave "a5-favoritas")
   ============================================================ */

(function () {
    "use strict";

    var $ = function (id) { return document.getElementById(id); };
    var plan = { personas: [] };

    /* Nombres legibles de las herramientas para el plan */
    var NOMBRES_HERRAMIENTAS = {
        a1: "Respiración guiada", a2: "Grounding 5-4-3-2-1", a3: "Relajación muscular",
        a4: "Diario de a bordo", a5: "Declaraciones de seguridad", a6: "Lugar seguro",
        a7: "Kit sensorial", protocolo: "Protocolo de crisis"
    };

    var planGuardado = Faro.Store.get("e5-plan", null);
    if (planGuardado) $("btn-ver-plan").classList.remove("hidden");

    $("btn-empezar").addEventListener("click", function () {
        precargar();
        Faro.Screens.show("s-1");
        Faro.Util.trackToolUse("e5", "Plan de emergencia");
    });

    $("btn-ver-plan").addEventListener("click", function () {
        plan = planGuardado;
        pintarPlan();
        Faro.Screens.show("s-plan");
    });

    document.querySelectorAll("[data-siguiente]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            Faro.Screens.show(btn.getAttribute("data-siguiente"));
        });
    });

    /* Chips seleccionables (señales y herramientas externas) */
    document.querySelectorAll("#chips-senales .faro-chip, #chips-externas .faro-chip").forEach(function (chip) {
        chip.addEventListener("click", function () { chip.classList.toggle("selected"); });
    });

    /* ---------- Precarga desde el resto de Faro ---------- */
    function precargar() {
        /* Sección 2: herramientas más usadas */
        var usos = Faro.Store.get("tool-uses", {});
        var cont = $("herramientas-usadas");
        cont.innerHTML = "";
        var ids = Object.keys(usos).sort(function (a, b) { return usos[b].count - usos[a].count; }).slice(0, 5);
        if (ids.length === 0) {
            cont.innerHTML = '<p class="text-base p-3 rounded-xl" style="background: var(--faro-border-subtle); color: var(--faro-text-secondary);">Cuando uses las herramientas de Faro, las más usadas aparecerán aquí solas.</p>';
        } else {
            ids.forEach(function (id) {
                var nombre = usos[id].name || NOMBRES_HERRAMIENTAS[id] || id;
                var chip = document.createElement("button");
                chip.className = "faro-chip selected";
                chip.textContent = nombre + " (" + usos[id].count + " veces)";
                chip.setAttribute("data-nombre", nombre);
                chip.addEventListener("click", function () { chip.classList.toggle("selected"); });
                cont.appendChild(chip);
            });
        }

        /* Sección 3: personas desde Red de apoyo */
        var red = Faro.Store.get("red-apoyo", null);
        var contPersonas = $("personas-red");
        contPersonas.innerHTML = "";
        plan.personas = [];
        if (red && red.funciones) {
            var vistos = {};
            ["angustia", "dificiles", "consejo"].forEach(function (fid) {
                (red.funciones[fid] || []).forEach(function (p) {
                    if (!vistos[p.name]) {
                        vistos[p.name] = true;
                        agregarPersonaChip(p.name, p.phone);
                    }
                });
            });
            if (Object.keys(vistos).length > 0) $("nota-red").classList.remove("hidden");

            /* Sección 4: terapeuta desde C9 */
            var terapeutas = red.funciones.terapeuta || [];
            if (terapeutas.length > 0) {
                $("campo-prof-nombre").value = terapeutas[0].name || "";
                $("campo-prof-fono").value = terapeutas[0].phone || "";
            }
        }

        /* Sección 6: frases favoritas de A5 */
        var favoritas = Faro.Store.get("a5-favoritas", []);
        if (favoritas.length > 0) {
            $("frases-sugeridas").classList.remove("hidden");
            var lista = $("lista-frases-sugeridas");
            lista.innerHTML = "";
            favoritas.slice(0, 4).forEach(function (f) {
                var b = document.createElement("button");
                b.className = "faro-option-card w-full p-3 text-left text-base";
                b.textContent = "“" + f + "”";
                b.addEventListener("click", function () { $("campo-frase").value = f; });
                lista.appendChild(b);
            });
        }
    }

    function agregarPersonaChip(nombre, fono) {
        plan.personas.push({ nombre: nombre, fono: fono || "" });
        var chip = document.createElement("span");
        chip.className = "faro-chip selected";
        chip.innerHTML = Faro.Util.escapeHtml(nombre) + (fono ? " · " + Faro.Util.escapeHtml(fono) : "") +
            ' <button aria-label="Quitar" style="font-weight:bold;margin-left:4px;">✕</button>';
        chip.querySelector("button").addEventListener("click", function () {
            plan.personas = plan.personas.filter(function (p) { return p.nombre !== nombre; });
            chip.remove();
        });
        $("personas-red").appendChild(chip);
    }

    $("btn-agregar-persona").addEventListener("click", function () {
        var nombre = $("campo-persona-nombre").value.trim();
        if (!nombre) return;
        agregarPersonaChip(nombre, $("campo-persona-fono").value.trim());
        $("campo-persona-nombre").value = "";
        $("campo-persona-fono").value = "";
    });

    /* ---------- Generar el plan ---------- */
    $("btn-generar").addEventListener("click", function () {
        plan.fecha = new Date().toISOString();

        plan.senales = [];
        document.querySelectorAll("#chips-senales .faro-chip.selected").forEach(function (c) {
            plan.senales.push(c.textContent);
        });
        var otraSenal = $("campo-senal-otra").value.trim();
        if (otraSenal) plan.senales.push(otraSenal);

        plan.herramientas = [];
        document.querySelectorAll("#herramientas-usadas .faro-chip.selected").forEach(function (c) {
            plan.herramientas.push(c.getAttribute("data-nombre"));
        });
        document.querySelectorAll("#chips-externas .faro-chip.selected").forEach(function (c) {
            plan.herramientas.push(c.textContent);
        });
        var otraHerr = $("campo-herramienta-otra").value.trim();
        if (otraHerr) plan.herramientas.push(otraHerr);

        plan.profesional = {
            nombre: $("campo-prof-nombre").value.trim(),
            fono: $("campo-prof-fono").value.trim(),
            horario: $("campo-prof-horario").value.trim()
        };

        plan.lineas = [{ nombre: "Salud Responde", fono: "600 360 7777", detalle: "24 horas, todos los días. Gratuito." }];
        var otraLinea = $("campo-linea-otra").value.trim();
        if (otraLinea) plan.lineas.push({ nombre: otraLinea, fono: "", detalle: "" });

        plan.frase = $("campo-frase").value.trim();

        Faro.Store.set("e5-plan", plan);
        pintarPlan();
        Faro.Screens.show("s-plan");
    });

    /* ---------- Documento visual del plan ---------- */
    function seccion(titulo, contenidoHtml) {
        if (!contenidoHtml) return "";
        return '<div class="faro-option-card p-4">' +
            '<p class="text-xs font-semibold uppercase tracking-wide mb-2" style="color: var(--faro-text-muted);">' + titulo + "</p>" +
            contenidoHtml + "</div>";
    }

    function lista(items) {
        if (!items || items.length === 0) return "";
        return '<ul class="space-y-1">' + items.map(function (i) {
            return '<li class="text-base text-base-content">· ' + Faro.Util.escapeHtml(i) + "</li>";
        }).join("") + "</ul>";
    }

    function pintarPlan() {
        var esc = Faro.Util.escapeHtml;
        var html = "";

        html += seccion("1 · Mis señales de alerta", lista(plan.senales));
        html += seccion("2 · Mis herramientas que funcionan", lista(plan.herramientas));

        if (plan.personas && plan.personas.length) {
            html += seccion("3 · Mis personas de apoyo",
                '<ul class="space-y-1">' + plan.personas.map(function (p) {
                    return '<li class="text-base text-base-content">· ' + esc(p.nombre) +
                        (p.fono ? ' — <a href="tel:' + esc(p.fono.replace(/[^\d+]/g, "")) + '" class="text-primary underline">' + esc(p.fono) + "</a>" : "") + "</li>";
                }).join("") + "</ul>");
        }

        if (plan.profesional && (plan.profesional.nombre || plan.profesional.fono)) {
            html += seccion("4 · Mi profesional de salud mental",
                '<p class="text-base text-base-content">' + esc(plan.profesional.nombre) +
                (plan.profesional.fono ? ' — <a href="tel:' + esc(plan.profesional.fono.replace(/[^\d+]/g, "")) + '" class="text-primary underline">' + esc(plan.profesional.fono) + "</a>" : "") +
                (plan.profesional.horario ? '<br><span style="color: var(--faro-text-secondary);">' + esc(plan.profesional.horario) + "</span>" : "") + "</p>");
        }

        html += seccion("5 · Líneas de emergencia",
            '<ul class="space-y-1">' + plan.lineas.map(function (l) {
                return '<li class="text-base text-base-content">· <strong>' + esc(l.nombre) + "</strong>" +
                    (l.fono ? ' — <a href="tel:' + esc(l.fono.replace(/[^\d+]/g, "")) + '" class="text-primary underline">' + esc(l.fono) + "</a>" : "") +
                    (l.detalle ? ' <span class="text-sm" style="color: var(--faro-text-muted);">(' + esc(l.detalle) + ")</span>" : "") + "</li>";
            }).join("") + "</ul>");

        if (plan.frase) {
            html += '<div class="p-5 rounded-2xl text-center" style="background: var(--faro-gradient-card); border: 1.5px solid var(--color-primary);">' +
                '<p class="text-xs font-semibold uppercase tracking-wide mb-1" style="color: var(--faro-text-muted);">6 · Mi frase de fortaleza</p>' +
                '<p class="font-display text-xl text-base-content">“' + esc(plan.frase) + "”</p></div>";
        }

        $("plan-documento").innerHTML = html ||
            '<p class="faro-instruction text-center" style="color: var(--faro-text-secondary);">Tu plan está vacío. Vuelve a armarlo cuando quieras.</p>';
    }

    /* Exportar: impresión del navegador (PDF en el celular) */
    $("btn-exportar").addEventListener("click", function () {
        window.print();
    });

    $("btn-editar").addEventListener("click", function () {
        precargar();
        Faro.Screens.show("s-1");
    });
})();
