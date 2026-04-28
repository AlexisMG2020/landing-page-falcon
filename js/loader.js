/* =========================================
   1. DICCIONARIO DE RUTAS
   ========================================= */
const rutas = {
    '/': '/pages/home.html',
    '/about': '/pages/about.html',
    '/news': '/pages/news.html',
    '/portfolio': '/pages/portfolio.html',
    '/team': '/pages/team.html',
    '/contact': '/pages/contact.html'
};

const pagina404 = '/pages/404.html';
let teamModalScrollY = 0;
let scrollProgressTicking = false;

function obtenerTitulo404Fallback() {
    const idiomaGuardado = localStorage.getItem('idioma') || 'en';

    return idiomaGuardado === 'es'
        ? 'Error 404: Pagina no encontrada'
        : 'Error 404: Page not found';
}

function obtenerRutaActual() {
    if (!window.location.hash) {
        return window.location.pathname === '/' ? '/' : window.location.pathname;
    }

    const ruta = window.location.hash.slice(1);

    return ruta || '/';
}

function actualizarNavActivo() {
    const rutaActual = obtenerRutaActual();
    const enlaces = document.querySelectorAll('.navbar-menu a[data-route]');

    enlaces.forEach((enlace) => {
        const url = new URL(enlace.href, window.location.origin);
        const rutaEnlace = url.hash ? url.hash.slice(1) || '/' : url.pathname || '/';
        const esActivo = rutaEnlace === rutaActual;

        enlace.classList.toggle('is-active', esActivo);
        if (esActivo) {
            enlace.setAttribute('aria-current', 'page');
        } else {
            enlace.removeAttribute('aria-current');
        }
    });
}

function actualizarProgresoScroll() {
    const progressBar = document.getElementById('scroll-progress-bar');

    if (!progressBar) {
        return;
    }

    const doc = document.documentElement;
    const body = document.body;
    const scrollTop = window.scrollY || window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
    const scrollHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        body.clientHeight,
        doc.scrollHeight,
        doc.offsetHeight,
        doc.clientHeight
    );
    const viewportHeight = window.innerHeight || doc.clientHeight || 0;
    const scrollTotal = Math.max(scrollHeight - viewportHeight, 0);
    const progreso = scrollTotal > 0
        ? Math.min(scrollTop / scrollTotal, 1)
        : 0;

    progressBar.style.transform = `scaleX(${progreso})`;
}

function programarActualizacionProgreso() {
    if (scrollProgressTicking) {
        return;
    }

    scrollProgressTicking = true;

    window.requestAnimationFrame(() => {
        actualizarProgresoScroll();
        scrollProgressTicking = false;
    });
}

/* =========================================
   2. EL MOTOR DE ENRUTAMIENTO (ROUTER)
   ========================================= */
async function enrutador() {
    // Obtenemos la ruta desde el hash (ej. "#/about" -> "/about")
    const path = obtenerRutaActual();
    
    // Si la ruta no existe, mostramos el 404 dentro de la app
    const archivoRuta = rutas[path];
    
    // Buscamos el escenario vacío en el index.html
    const appRoot = document.getElementById('app-root');
    
    if (appRoot) {
        if (!archivoRuta) {
            await mostrar404(appRoot);
            return;
        }

        try {
            // Buscamos e inyectamos la página correspondiente
            const respuesta = await fetch(archivoRuta);
            if (respuesta.ok) {
                appRoot.innerHTML = await respuesta.text();
            } else {
                await mostrar404(appRoot);
            }
        } catch (error) {
            console.error("Error cargando la ruta:", error);
            await mostrar404(appRoot);
        }
    }

    await cargarComponentes();
    actualizarNavActivo();

    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
    });

    programarActualizacionProgreso();
}

/* =========================================
   3. INTERCEPTORES DE NAVEGACIÓN
   ========================================= */
// Evita que la página recargue al hacer clic en los enlaces del menú
document.addEventListener("click", e => {
    const enlace = e.target.closest("[data-route]");

    // Busca si el clic fue en un enlace con el atributo 'data-route'
    if (enlace) {
        e.preventDefault(); // Detiene la recarga molesta
        const url = new URL(enlace.href);
        const esHome = url.pathname === '/' && !url.hash;

        if (esHome) {
            window.history.pushState(null, null, url.pathname);
            enrutador();
            return;
        }

        const nuevaRuta = url.hash || `#${url.pathname}`;

        if (window.location.hash === nuevaRuta) {
            enrutador();
            return;
        }

        window.location.hash = nuevaRuta; // Cambia la URL arriba
    }
});

// Detecta cambios en el hash y navegación del historial
window.addEventListener("hashchange", enrutador);
window.addEventListener("popstate", enrutador);

// Arranca el router apenas se abre la página
document.addEventListener("DOMContentLoaded", () => {
    actualizarProgresoScroll();
    enrutador(); 
});

window.addEventListener('scroll', programarActualizacionProgreso, { passive: true });
window.addEventListener('resize', programarActualizacionProgreso);

/* =========================================
   4. CONTROL DEL MENÚ MÓVIL
   ========================================= */
window.toggleMenu = function() {
    const menu = document.getElementById('nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    if(menu && hamburger) {
        menu.classList.toggle('active');
        hamburger.classList.toggle('active');
    }
};

/* =========================================
   5. INYECTOR DE COMPONENTES ANIDADOS
   ========================================= */
async function cargarComponentes() {
    let elementos = document.querySelectorAll('[data-include]');

    // Mientras sigan existiendo etiquetas 'data-include', el bucle sigue buscando
    while (elementos.length > 0) {
        const promesas = Array.from(elementos).map(async (el) => {
            const archivo = el.getAttribute('data-include');
            try {
                const respuesta = await fetch(archivo);
                if (respuesta.ok) {
                    el.innerHTML = await respuesta.text();
                } else {
                    console.error(`Falta el componente: ${archivo}`);
                }
            } catch (error) {
                console.error(`Error de red con ${archivo}:`, error);
            } finally {
                // Removemos el atributo para no crear un bucle infinito
                el.removeAttribute('data-include'); 
            }
        });

        // Esperamos a que todos los HTML de esta pasada se inyecten
        await Promise.all(promesas);
        
        // Volvemos a escanear por si un HTML nuevo traía más componentes adentro
        elementos = document.querySelectorAll('[data-include]');
    }

    // ✨ LA MAGIA FINAL: Todo está inyectado, activamos el idioma
    if (typeof traducirPagina === "function") {
        traducirPagina();
    }

    actualizarNavActivo();
    inicializarTeamModal();
    inicializarValidacionFormularios();
}

async function mostrar404(appRoot) {
    try {
        const respuesta = await fetch(pagina404);

        if (respuesta.ok) {
            appRoot.innerHTML = await respuesta.text();
        } else {
            appRoot.innerHTML = `<h1 style="text-align:center; padding: 50px;">${obtenerTitulo404Fallback()}</h1>`;
        }
    } catch (error) {
        console.error("Error cargando la pagina 404:", error);
        appRoot.innerHTML = `<h1 style="text-align:center; padding: 50px;">${obtenerTitulo404Fallback()}</h1>`;
    }

    await cargarComponentes();
}

function inicializarTeamModal() {
    const teamPage = document.querySelector('.team-page');

    if (!teamPage) {
        cerrarTeamModal();
        return;
    }

    prepararBotonesTeam(teamPage);
    prepararModalTeam();
}

function prepararBotonesTeam(teamPage) {
    const idioma = localStorage.getItem('idioma') || 'es';
    const ctaLabel = idioma === 'es' ? 'Ver perfil' : 'View profile';

    teamPage.querySelectorAll('.team-card').forEach((card, index) => {
        card.style.animationDelay = `${Math.min(index * 0.06, 0.45)}s`;

        let button = card.querySelector('.team-card-cta');
        if (!button) {
            button = document.createElement('button');
            button.type = 'button';
            button.className = 'team-card-cta';
            card.querySelector('.member-info')?.insertBefore(
                button,
                card.querySelector('.footer-social')
            );
        }

        button.textContent = ctaLabel;

        if (button.dataset.bound === 'true') {
            return;
        }

        button.addEventListener('click', () => abrirTeamModal(card));
        button.dataset.bound = 'true';
    });
}

function prepararModalTeam() {
    let modal = document.getElementById('team-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'team-modal';
        modal.className = 'team-modal';
        modal.innerHTML = `
            <div class="team-modal__backdrop" data-team-close="true"></div>
            <div class="team-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="team-modal-name">
                <div class="team-modal__topbar">
                    <span class="team-modal__topbar-label">Perfil</span>
                    <button type="button" class="team-modal__close" aria-label="Cerrar" data-team-close="true">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="team-modal__scroll">
                    <div class="team-modal__content">
                        <div class="team-modal__media">
                            <div class="team-modal__image-frame">
                                <img class="team-modal__image" src="" alt="">
                            </div>
                        </div>
                        <div class="team-modal__body">
                            <span class="team-modal__eyebrow">Falcon Ventures</span>
                            <h2 class="team-modal__name" id="team-modal-name"></h2>
                            <div class="team-modal__role"></div>
                            <p class="team-modal__bio"></p>
                            <div class="team-modal__social"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.addEventListener('click', (event) => {
            if (event.target instanceof HTMLElement && event.target.closest('[data-team-close="true"]')) {
                cerrarTeamModal();
            }
        });

        document.addEventListener('keydown', manejarEscapeTeamModal);
    }
}

function abrirTeamModal(card) {
    const modal = document.getElementById('team-modal');

    if (!modal) {
        return;
    }

    const image = card.querySelector('.member-photo-wrapper img');
    const name = card.querySelector('.member-name')?.textContent?.trim() || '';
    const role = card.querySelector('.member-role')?.textContent?.trim() || '';
    const bio = card.querySelector('.member-bio')?.textContent?.trim() || '';
    const social = card.querySelector('.footer-social');

    const modalImage = modal.querySelector('.team-modal__image');
    const modalName = modal.querySelector('.team-modal__name');
    const modalRole = modal.querySelector('.team-modal__role');
    const modalBio = modal.querySelector('.team-modal__bio');
    const modalSocial = modal.querySelector('.team-modal__social');
    const closeButton = modal.querySelector('.team-modal__close');

    if (!modalImage || !modalName || !modalRole || !modalBio || !modalSocial || !closeButton) {
        return;
    }

    modalImage.src = image?.getAttribute('src') || '';
    modalImage.alt = image?.getAttribute('alt') || name;
    modalName.textContent = name;
    modalRole.textContent = role;
    modalBio.textContent = bio;
    modalSocial.innerHTML = social ? social.innerHTML : '';
    modalSocial.style.display = modalSocial.children.length ? 'flex' : 'none';

    teamModalScrollY = window.scrollY || window.pageYOffset || 0;
    modal.classList.add('is-visible');
    document.body.classList.add('team-modal-open');
    document.body.style.top = `-${teamModalScrollY}px`;
    window.requestAnimationFrame(() => {
        closeButton.focus();
    });
}

function cerrarTeamModal() {
    const modal = document.getElementById('team-modal');

    if (!modal) {
        return;
    }

    modal.classList.remove('is-visible');
    document.body.classList.remove('team-modal-open');
    document.body.style.top = '';
    window.scrollTo(0, teamModalScrollY);
}

function manejarEscapeTeamModal(event) {
    if (event.key === 'Escape') {
        cerrarTeamModal();
    }
}

function obtenerErrorCampo(input) {
    let error = input.parentElement?.querySelector('.field-error');
    const errorKey = input.dataset.errorKey || 'validation-required';

    if (!error) {
        error = document.createElement('span');
        error.className = 'field-error';
        error.setAttribute('data-i18n-error', errorKey);
        input.insertAdjacentElement('afterend', error);
    } else {
        error.setAttribute('data-i18n-error', errorKey);
    }

    return error;
}

function campoVacio(input) {
    if (input instanceof HTMLSelectElement) {
        return !input.value;
    }

    return !input.value.trim();
}

function esEmailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function normalizarNombre(valor) {
    return valor
        .trim()
        .toLocaleLowerCase()
        .replace(/(^|[\s-])([a-záéíóúñ])/gi, (match, separator, letter) => {
            return `${separator}${letter.toLocaleUpperCase()}`;
        });
}

function obtenerClaveError(input, tipoError) {
    if (tipoError === 'format' && input.dataset.errorKeyFormat) {
        return input.dataset.errorKeyFormat;
    }

    return input.dataset.errorKey || 'validation-required';
}

function marcarCampo(input, invalido, tipoError = 'required') {
    const error = obtenerErrorCampo(input);
    const formGroup = input.closest('.form-group');
    const footerGroup = input.closest('.footer-form-group');

    input.classList.toggle('is-invalid', invalido);

    if (formGroup) {
        formGroup.classList.toggle('form-group--invalid', invalido);
    }

    if (footerGroup) {
        footerGroup.classList.toggle('footer-form-group--invalid', invalido);
    }

    error.setAttribute('data-i18n-error', obtenerClaveError(input, tipoError));

    error.classList.toggle('is-visible', invalido);

    if (typeof traducirPagina === 'function') {
        traducirPagina();
    }
}

function validarCampo(input) {
    const valor = input.value.trim();

    if (input.hasAttribute('required') && campoVacio(input)) {
        marcarCampo(input, true, 'required');
        return false;
    }

    if (input.type === 'email' && valor && !esEmailValido(valor)) {
        marcarCampo(input, true, 'format');
        return false;
    }

    if (input.dataset.format === 'phone' && valor) {
        const soloDigitos = valor.replace(/\D/g, '');

        if (soloDigitos.length !== 10) {
            marcarCampo(input, true, 'format');
            return false;
        }

        input.value = soloDigitos;
    }

    marcarCampo(input, false);
    return true;
}

function validarFormulario(form) {
    const campos = Array.from(form.querySelectorAll('[required]'));
    let primerInvalido = null;

    campos.forEach((campo) => {
        const esValido = validarCampo(campo);

        if (!esValido && !primerInvalido) {
            primerInvalido = campo;
        }
    });

    if (primerInvalido) {
        primerInvalido.focus();
        return false;
    }

    return true;
}

function prepararFormulario(form) {
    if (!form || form.dataset.validationBound === 'true') {
        return;
    }

    form.noValidate = true;

    form.querySelectorAll('[required]').forEach((campo) => {
        obtenerErrorCampo(campo);

        const evento = campo instanceof HTMLSelectElement ? 'change' : 'input';

        campo.addEventListener(evento, () => {
            if (campo.classList.contains('is-invalid')) {
                validarCampo(campo);
            }
        });

        campo.addEventListener('blur', () => {
            if (campo.dataset.format === 'name' && campo.value.trim()) {
                campo.value = normalizarNombre(campo.value);
            }

            validarCampo(campo);
        });
    });

    form.querySelectorAll('[data-format="phone"]').forEach((campo) => {
        campo.addEventListener('input', () => {
            campo.value = campo.value.replace(/\D/g, '').slice(0, 10);

            if (campo.classList.contains('is-invalid')) {
                validarCampo(campo);
            }
        });

        campo.addEventListener('blur', () => {
            validarCampo(campo);
        });
    });

    form.dataset.validationBound = 'true';
}

function inicializarValidacionFormularios() {
    const footerForm = document.getElementById('footerForm');
    const contactForm = document.getElementById('contactForm');
    const loginForm = document.getElementById('loginForm');

    prepararFormulario(footerForm);
    prepararFormulario(contactForm);
    prepararFormulario(loginForm);

    if (footerForm && footerForm.dataset.submitBound !== 'true') {
        footerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!validarFormulario(footerForm)) {
                return;
            }

            const status = document.getElementById('footerFormStatus');
            const submitButton = footerForm.querySelector('.btn-submit');
            const traducciones = typeof diccionario !== 'undefined'
                ? (diccionario[localStorage.getItem('idioma') || 'en'] || diccionario.en)
                : {};

            if (status) {
                status.textContent = traducciones['footer-form-sending'] || 'Sending message...';
                status.className = 'form-status is-visible';
            }

            if (submitButton) {
                submitButton.disabled = true;
            }

            try {
                const formData = new FormData(footerForm);
                const response = await fetch('/api/mensaje_footer.php', {
                    method: 'POST',
                    body: formData
                });

                const responseText = await response.text();
                let data = null;

                try {
                    data = responseText ? JSON.parse(responseText) : null;
                } catch (parseError) {
                    throw new Error(`Respuesta no valida del servidor (${response.status})`);
                }

                if (!response.ok || !data || !data.ok) {
                    throw new Error(data?.message || `Footer form request failed (${response.status})`);
                }

                if (status) {
                    status.textContent = traducciones['footer-form-success'] || 'Your message was sent successfully.';
                    status.className = 'form-status is-visible is-success';
                }

                footerForm.reset();
            } catch (error) {
                console.error('Error enviando formulario footer:', error);

                if (status) {
                    status.textContent = traducciones['footer-form-error'] || 'We could not send your message right now.';
                    status.className = 'form-status is-visible is-error';
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                }
            }
        });

        footerForm.dataset.submitBound = 'true';
    }

    if (contactForm && contactForm.dataset.submitBound !== 'true') {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!validarFormulario(contactForm)) {
                return;
            }

            const status = document.getElementById('contactFormStatus');
            const submitButton = contactForm.querySelector('.btn-submit-premium');
            const traducciones = typeof diccionario !== 'undefined'
                ? (diccionario[localStorage.getItem('idioma') || 'en'] || diccionario.en)
                : {};

            if (status) {
                status.textContent = traducciones['contact-form-sending'] || 'Sending message...';
                status.className = 'form-status is-visible';
            }

            if (submitButton) {
                submitButton.disabled = true;
            }

            try {
                const formData = new FormData(contactForm);
                const response = await fetch('/api/mensaje_contact.php', {
                    method: 'POST',
                    body: formData
                });

                const responseText = await response.text();
                let data = null;

                try {
                    data = responseText ? JSON.parse(responseText) : null;
                } catch (parseError) {
                    throw new Error(`Respuesta no valida del servidor (${response.status})`);
                }

                if (!response.ok || !data || !data.ok) {
                    throw new Error(data?.message || `Contact form request failed (${response.status})`);
                }

                if (status) {
                    status.textContent = traducciones['contact-form-success'] || 'Your message was sent successfully.';
                    status.className = 'form-status is-visible is-success';
                }

                contactForm.reset();
            } catch (error) {
                console.error('Error enviando formulario contacto:', error);

                if (status) {
                    status.textContent = traducciones['contact-form-error'] || 'We could not send your message right now.';
                    status.className = 'form-status is-visible is-error';
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                }
            }
        });

        contactForm.dataset.submitBound = 'true';
    }
}

function resetLoginState() {
    const modal = document.getElementById('loginModal');
    const form = document.getElementById('loginForm');

    if (!modal || !form) {
        return;
    }

    modal.classList.remove('login-modal--success');
    form.reset();

    form.querySelectorAll('.is-invalid').forEach((campo) => {
        campo.classList.remove('is-invalid');
    });

    form.querySelectorAll('.form-group--invalid').forEach((group) => {
        group.classList.remove('form-group--invalid');
    });

    form.querySelectorAll('.footer-form-group--invalid').forEach((group) => {
        group.classList.remove('footer-form-group--invalid');
    });

    form.querySelectorAll('.field-error.is-visible').forEach((error) => {
        error.classList.remove('is-visible');
    });
}

/* =========================================
   6. CONTROL DEL MODAL DE LOGIN
   ========================================= */
let loginModalScrollY = 0; // Variable para guardar la posición del scroll

window.openLogin = function() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        // 1. Cerrar el menú móvil automáticamente si está abierto (deja esto si usas el mismo menú hamburguesa)
        const menu = document.getElementById('nav-menu');
        const hamburger = document.querySelector('.hamburger');
        if(menu && menu.classList.contains('active')) {
            menu.classList.remove('active');
            hamburger.classList.remove('active');
        }

        // 2. Bloqueo estricto de scroll (evita scroll de fondo, crucial para móviles)
        loginModalScrollY = window.scrollY || window.pageYOffset || 0;
        document.body.classList.add('login-modal-open');
        document.body.style.top = `-${loginModalScrollY}px`;
        resetLoginState();
        
        // Mostrar el modal
        modal.classList.add('is-visible');
    }
};

window.closeLogin = function() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        // Ocultar el modal
        modal.classList.remove('is-visible');
        
        // Restaurar el scroll y devolver al usuario a donde estaba
        document.body.classList.remove('login-modal-open');
        document.body.style.top = '';
        window.scrollTo(0, loginModalScrollY);
    }
};

// Cerrar el modal al presionar la tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const loginModal = document.getElementById('loginModal');
        if (loginModal && loginModal.classList.contains('is-visible')) {
            closeLogin();
        }
    }
});

// Manejar el envío del formulario (para tu lógica de backend posterior)
window.handleLogin = function(event) {
    event.preventDefault(); // Evita recarga de página
    const form = document.getElementById('loginForm');

    if (!form || !validarFormulario(form)) {
        return;
    }

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    console.log("Credenciales para validar:", { email, password });

    const modal = document.getElementById('loginModal');

    if (modal) {
        modal.classList.add('login-modal--success');
    }
};
