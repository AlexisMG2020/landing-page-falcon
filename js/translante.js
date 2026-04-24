// 1. Nuestro Diccionario de Idiomas
const diccionario = {
    en: {
        "nav-home": "Home",
        "nav-about": "About",
        "nav-news": "News",
        "nav-portfolio": "Portfolio",
        "nav-team": "Team",
        "nav-contact": "Contact",
        "hero-title": "Investing in a safe Future",
        "hero-subtitle": "Private Equity & Business Group",
        "investing-in-a-safe-Future": "Investing in a safe future",
        "envia-mensaje":"Send Us a Message",
    
    },
    es: {
        "nav-home": "Inicio",
        "nav-about": "Nosotros",
        "nav-news": "Noticias",
        "nav-portfolio": "Portafolio",
        "nav-team": "Equipo",
        "nav-contact": "Contacto",
        "hero-title": "Invirtiendo en un futuro seguro",
        "hero-subtitle": "Grupo de Capital Privado y Negocios",
        "investing-in-a-safe-Future": "Invertir en un futuro seguro",
        "envia-mensaje":"Envíanos un mensaje"
        
    }
};

// 2. Revisamos si el usuario ya había elegido un idioma antes (por defecto será inglés 'en')
let idiomaActual = localStorage.getItem('idioma') || 'en';

// 3. Función principal que traduce toda la pantalla
function traducirPagina() {
    // Buscamos todas las etiquetas HTML que tengan el atributo 'data-i18n'
    const elementos = document.querySelectorAll('[data-i18n]');
    
    elementos.forEach(el => {
        // Obtenemos la clave (ej. "nav-home")
        const clave = el.getAttribute('data-i18n'); 
        
        // Si esa clave existe en nuestro diccionario, cambiamos el texto
        if (diccionario[idiomaActual][clave]) {
            el.textContent = diccionario[idiomaActual][clave];
        }
    });

    // Cambiamos el texto del botón del idioma
    const btnIdioma = document.getElementById('btn-idioma');
    if(btnIdioma) {
        btnIdioma.textContent = idiomaActual === 'en' ? 'ESPAÑOL' : 'ENGLISH';
    }
}

// 4. Función para cambiar el idioma cuando hacen clic en el botón
function cambiarIdioma() {
    idiomaActual = idiomaActual === 'en' ? 'es' : 'en';
    localStorage.setItem('idioma', idiomaActual); // Guardamos la preferencia
    traducirPagina(); // Aplicamos los cambios
}