// 1. Nuestro Diccionario de Idiomas
const diccionario = {
    en: {
        "nav-home": "Home",
        "nav-about": "About",
        "nav-news": "News",
        "nav-portfolio": "Portfolio",
        "nav-team": "Team",
        "nav-contact": "Contact",
        "about-kicker": "About",
        "about-title": "Falcon Ventures Private Business Group",
        "about-description": "We are a Private Business Group that invests in security sector small and medium sized companies, we invest in <span>early-stage</span> or <span>growth-stage</span> companies in the security industry.",
        "hero-title": "Investing in a safe Future",
        "hero-subtitle": "Private Equity & Business Group",
        "investing-in-a-safe-Future": "Investing in a safe future",
        "envia-mensaje":"Send Us a Message",
        "footer-subtitle": "Private Business Group",
        "form-name-placeholder": "Your full name",
        "form-email-placeholder": "Email address",
        "form-message-placeholder": "How can we help you?",
        "form-submit": "Send Message",
        "footer-copy": "© 2026 by Falcon Ventures Private Business Group. Powered and secured by intel",
        "industry-01": "INDUSTRY 01",
        "industry-02": "INDUSTRY 02",
        "industry-03": "INDUSTRY 03",
        "industry-04": "INDUSTRY 04",
        "industry-05": "INDUSTRY 05",
        "industry-06": "INDUSTRY 06",
        "industry-private-security": "PRIVATE<br />SECURITY",
        "industry-communications": "COMMUNICATIONS",
        "industry-technology": "TECHNOLOGY",
        "industry-surveillance": "SURVEILLANCE",
        "industry-artificial-intelligence": "ARTIFICIAL<br />INTELLIGENCE",
        "industry-real-estate": "REAL<br />ESTATE",
        "error-code": "Error 404",
        "error-title": "Page not found",
        "error-description": "The route you tried to open does not exist or has not been created in the project yet.",
        "error-back-home": "Back to home"
    },
    es: {
        "nav-home": "Inicio",
        "nav-about": "Nosotros",
        "nav-news": "Noticias",
        "nav-portfolio": "Portafolio",
        "nav-team": "Equipo",
        "nav-contact": "Contacto",
        "about-kicker": "Acerca de Nosotros",
        "about-title": "Falcon Ventures Private Business Group",
        "about-description": "Somos un grupo privado de negocios que invierte en pequenas y medianas empresas del sector de seguridad; invertimos en companias en etapa <span>temprana</span> o en <span>crecimiento</span> dentro de la industria de seguridad.",
        "hero-title": "Invirtiendo en un futuro seguro",
        "hero-subtitle": "Grupo de Capital Privado y Negocios",
        "investing-in-a-safe-Future": "Invertir en un futuro seguro",
        "envia-mensaje":"Envíanos un mensaje",
        "footer-subtitle": "Grupo Privado de Negocios",
        "form-name-placeholder": "Tu nombre completo",
        "form-email-placeholder": "Correo electrónico",
        "form-message-placeholder": "¿En qué podemos ayudarte?",
        "form-submit": "Enviar Mensaje",
        "footer-copy": "© 2026 por Falcon Ventures Private Business Group. Powered and secured by intel",
        "industry-01": "INDUSTRIA 01",
        "industry-02": "INDUSTRIA 02",
        "industry-03": "INDUSTRIA 03",
        "industry-04": "INDUSTRIA 04",
        "industry-05": "INDUSTRIA 05",
        "industry-06": "INDUSTRIA 06",
        "industry-private-security": "SEGURIDAD<br />PRIVADA",
        "industry-communications": "COMUNICACIONES",
        "industry-technology": "TECNOLOGÍA",
        "industry-surveillance": "VIGILANCIA",
        "industry-artificial-intelligence": "INTELIGENCIA<br />ARTIFICIAL",
        "industry-real-estate": "BIENES<br />RAÍCES",
        "error-code": "Error 404",
        "error-title": "Página no encontrada",
        "error-description": "La ruta que intentaste abrir no existe o todavía no fue creada dentro del proyecto.",
        "error-back-home": "Volver al inicio"
    }
};

// 2. Revisamos si el usuario ya había elegido un idioma antes (por defecto será inglés 'en')
let idiomaActual = localStorage.getItem('idioma') || 'en';

// 3. Función principal que traduce toda la pantalla
function traducirPagina() {
    const traducciones = diccionario[idiomaActual] || diccionario.en;

    // Buscamos todas las etiquetas HTML que tengan el atributo 'data-i18n'
    const elementos = document.querySelectorAll('[data-i18n]');
    
    elementos.forEach(el => {
        // Obtenemos la clave (ej. "nav-home")
        const clave = el.getAttribute('data-i18n'); 
        
        // Si esa clave existe en nuestro diccionario, cambiamos el texto
        if (traducciones[clave]) {
            el.textContent = traducciones[clave];
        }
    });

    const elementosHtml = document.querySelectorAll('[data-i18n-html]');

    elementosHtml.forEach(el => {
        const clave = el.getAttribute('data-i18n-html');

        if (traducciones[clave]) {
            el.innerHTML = traducciones[clave];
        }
    });

    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');

    placeholders.forEach(el => {
        const clave = el.getAttribute('data-i18n-placeholder');

        if (traducciones[clave]) {
            el.placeholder = traducciones[clave];
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
