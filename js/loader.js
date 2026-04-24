/* =========================================
   1. DICCIONARIO DE RUTAS
   ========================================= */
const rutas = {
    '/': 'pages/home.html',
    '/about': 'pages/about.html',
    '/news': 'pages/news.html',
    '/portfolio': 'pages/portfolio.html',
    '/team': 'pages/team.html',
    '/contact': 'pages/contact.html'
};

/* =========================================
   2. EL MOTOR DE ENRUTAMIENTO (ROUTER)
   ========================================= */
async function enrutador() {
    // Obtenemos la URL actual (ej. "/about")
    let path = window.location.pathname;
    
    // Si la ruta no existe, mandamos al Home por defecto
    const archivoRuta = rutas[path] || rutas['/'];
    
    // Buscamos el escenario vacío en el index.html
    const appRoot = document.getElementById('app-root');
    
    if (appRoot) {
        try {
            // Buscamos e inyectamos la página correspondiente
            const respuesta = await fetch(archivoRuta);
            if (respuesta.ok) {
                appRoot.innerHTML = await respuesta.text();
            } else {
                appRoot.innerHTML = `<h1 style="text-align:center; padding: 50px;">Error 404: Página no encontrada</h1>`;
            }
        } catch (error) {
            console.error("Error cargando la ruta:", error);
        }
    }

    // Una vez inyectada la página (ej. home.html), cargamos sus componentes internos
    await cargarComponentes();
}

/* =========================================
   3. INTERCEPTORES DE NAVEGACIÓN
   ========================================= */
// Evita que la página recargue al hacer clic en los enlaces del menú
document.addEventListener("click", e => {
    // Busca si el clic fue en un enlace con el atributo 'data-route'
    if (e.target.matches("[data-route]")) {
        e.preventDefault(); // Detiene la recarga molesta
        window.history.pushState(null, null, e.target.href); // Cambia la URL arriba
        enrutador(); // Pinta la nueva pantalla
    }
});

// Detecta cuando el usuario usa las flechas de "Atrás" o "Adelante" del navegador
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