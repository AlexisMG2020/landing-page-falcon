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
