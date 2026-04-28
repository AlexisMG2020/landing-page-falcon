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

    // Una vez inyectada la página (ej. home.html), cargamos sus componentes internos
    await cargarComponentes();

    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
    });
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
    enrutador(); 
});

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

    inicializarTeamModal();
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
                <button type="button" class="team-modal__close" aria-label="Cerrar" data-team-close="true">
                    <i class="bi bi-x-lg"></i>
                </button>
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

    modal.classList.add('is-visible');
    document.body.classList.add('team-modal-open');
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
}

function manejarEscapeTeamModal(event) {
    if (event.key === 'Escape') {
        cerrarTeamModal();
    }
}
