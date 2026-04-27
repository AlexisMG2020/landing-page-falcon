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
        "about-page-title": "We look for a <span class=\"text-indigo\">safer world.</span>",
        "about-page-image-alt": "Strategic Oversight",
        "about-page-tag": "COMPANY PROFILE",
        "about-page-headline": "We are a <span class=\"weight-700\">private business group</span> that invests in security sector small and medium sized companies.",
        "about-page-description": "We focus on early-stage or growth-stage companies within the security industry. These ventures develop cutting-edge technologies in <span class=\"inline-bold\">cyber security</span>, <span class=\"inline-bold\">physical security</span>, and <span class=\"inline-bold\">mission-critical communications</span>.",
        "about-page-secondary": "Our management team conducts extensive due diligence and provides strategic oversight to ensure technological leadership.",
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
        "stat-partners": "Partners",
        "stat-employees": "Employees",
        "stat-investments": "Investments",
        "stat-success": "Success",
        "news-section-title": "Recent News",
        "news-1-alt": "Venture Capital in Latin America",
        "news-1-category": "Industry",
        "news-1-title": "Venture Capital gains ground in Latin America",
        "news-1-excerpt": "Jose Carlos Mapelli Mozzi, Chairman of Falcon Ventures, analyzes the growth of startup investment and Mexico's key role.",
        "news-1-link": "Read on Reforma",
        "news-2-alt": "Zascita Outstanding Company",
        "news-2-category": "Portfolio",
        "news-2-title": "Zascita de Mexico receives recognition as an \"Outstanding Company\"",
        "news-2-excerpt": "The Business Coordinating Council honors Zascita, a portfolio company that achieved 180% growth.",
        "news-2-link": "Read on Mundo Ejecutivo",
        "news-3-alt": "Award in Private Security",
        "news-3-category": "Impact",
        "news-3-title": "Portfolio company recognized in the private security sector",
        "news-3-excerpt": "They highlight venture capital's positive influence in the region: Falcon Ventures' strategic investment accelerated Zascita's expansion.",
        "news-3-link": "Read on El Heraldo",
        "news-4-alt": "Recognition for Company",
        "news-4-category": "Recognition",
        "news-4-title": "Falcon Ventures company receives recognition",
        "news-4-excerpt": "Special coverage on milestones achieved by our portfolio companies, validating our focus on operational profitability.",
        "news-4-link": "Read on Reforma",
        "portfolio-kicker": "Expertise & Vision",
        "portfolio-title": "Developing the future of security",
        "portfolio-description": "Our specialized portfolio in the security sector includes investments in companies that provide security services and products, such as surveillance systems, secure communications, and security personnel. It may also include companies in related sectors such as defense, intelligence, and emergency management, depending on the group's strategy and investment objectives.",
        "portfolio-current-label": "02. Current Investments",
        "portfolio-past-label": "00. Past Investments",
        "portfolio-case-study": "CASE STUDY",
        "portfolio-zascita-alt": "Zascita de Mexico",
        "portfolio-prodao-alt": "Prodao Automation",
        "portfolio-empty-title": "0",
        "portfolio-empty-desc": "No completed investments to date. All our current assets continue on a path of strategic growth.",
        "portfolio-quote-1": "\"The private security sector is a large and rapidly growing market, with a global value projected to reach $284.5 billion by 2025. Factors such as increasing crime rates and the need for protection of critical infrastructure have significantly increased demand.\"",
        "portfolio-quote-2": "\"The growing awareness and adoption of technology in security systems is driving the sector's expansion, creating unique opportunities for strategic investment in specialized firms that lead the digital transformation of defense.\"",
        "portfolio-quote-author": "Jose Carlos Mapelli",
        "editorial-all-posts": "All Posts",
        "editorial-empty-title": "Check back soon.",
        "editorial-empty-desc": "Once posts are published, you’ll see them here.",
        "error-code": "Error 404",
        "error-title": "Page not found",
        "error-description": "The route you tried to open does not exist or has not been created in the project yet.",
        "error-back-home": "Back to home"
    },
    es: {
        "nav-home": "Inicio",
        "nav-about": "Acerca de",
        "nav-news": "Noticias",
        "nav-portfolio": "Cartera",
        "nav-team": "Equipo",
        "nav-contact": "Contacto",
        "about-kicker": "Acerca de Nosotros",
        "about-title": "Falcon Ventures Private Business Group",
        "about-description": "Somos un grupo privado de negocios que invierte en pequenas y medianas empresas del sector de seguridad; invertimos en companias en etapa <span>temprana</span> o en <span>crecimiento</span> dentro de la industria de seguridad.",
        "hero-title": "Invirtiendo en un futuro seguro",
        "hero-subtitle": "Grupo de Capital Privado y Negocios",
        "investing-in-a-safe-Future": "Invertir en un futuro seguro",
        "about-page-title": "Buscamos un <span class=\"text-indigo\">mundo más seguro.</span>",
        "about-page-image-alt": "Supervisión estratégica",
        "about-page-tag": "PERFIL DE LA EMPRESA",
        "about-page-headline": "Somos un <span class=\"weight-700\">grupo privado de negocios</span> que invierte en pequeñas y medianas empresas del sector de seguridad.",
        "about-page-description": "Nos enfocamos en empresas en etapa temprana o de crecimiento dentro de la industria de la seguridad. Estas compañías desarrollan tecnologías de vanguardia en <span class=\"inline-bold\">ciberseguridad</span>, <span class=\"inline-bold\">seguridad física</span> y <span class=\"inline-bold\">comunicaciones de misión crítica</span>.",
        "about-page-secondary": "Nuestro equipo directivo realiza una debida diligencia exhaustiva y aporta supervisión estratégica para asegurar el liderazgo tecnológico.",
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
        "stat-partners": "Socios",
        "stat-employees": "Empleados",
        "stat-investments": "Inversiones",
        "stat-success": "Éxito",
        "news-section-title": "Noticias Recientes",
        "news-1-alt": "Venture Capital en America Latina",
        "news-1-category": "Industria",
        "news-1-title": "Venture Capital gana terreno en America Latina",
        "news-1-excerpt": "Jose Carlos Mapelli Mozzi, presidente del Consejo de Falcon Ventures, analiza el crecimiento de la inversion en startups y el papel clave de Mexico.",
        "news-1-link": "Leer en Reforma",
        "news-2-alt": "Zascita Empresa Excepcional",
        "news-2-category": "Portafolio",
        "news-2-title": "Zascita de Mexico recibe reconocimiento como \"Empresa Excepcional\"",
        "news-2-excerpt": "El Consejo Coordinador Empresarial galardona a Zascita, empresa de nuestro portafolio que experimento un crecimiento del 180%.",
        "news-2-link": "Leer en Mundo Ejecutivo",
        "news-3-alt": "Galardon en Seguridad Privada",
        "news-3-category": "Impacto",
        "news-3-title": "Galardonan a firma del portafolio en el sector de seguridad privada",
        "news-3-excerpt": "Destacan la influencia positiva del venture capital en la region: la inversion estrategica de Falcon Ventures acelero la expansion de Zascita.",
        "news-3-link": "Leer en El Heraldo",
        "news-4-alt": "Reconocimiento a Compania",
        "news-4-category": "Reconocimiento",
        "news-4-title": "Reconocen a compania de Falcon Ventures",
        "news-4-excerpt": "Cobertura especial sobre los hitos alcanzados por las empresas de nuestro portafolio, validando nuestro enfoque en la rentabilidad operativa.",
        "news-4-link": "Leer en Reforma",
        "portfolio-kicker": "Experiencia y Visión",
        "portfolio-title": "Desarrollando el futuro de la seguridad",
        "portfolio-description": "Nuestra cartera especializada en el sector de la seguridad incluye inversiones en empresas que ofrecen servicios y productos de seguridad, como sistemas de vigilancia, comunicaciones seguras y personal de seguridad. También puede incluir empresas de sectores afines, como defensa, inteligencia y gestión de emergencias, según la estrategia y los objetivos de inversión del grupo.",
        "portfolio-current-label": "02. Inversiones Actuales",
        "portfolio-past-label": "00. Inversiones Pasadas",
        "portfolio-case-study": "CASO DE ESTUDIO",
        "portfolio-zascita-alt": "Zascita de México",
        "portfolio-prodao-alt": "Prodao Automatización",
        "portfolio-empty-title": "0",
        "portfolio-empty-desc": "Sin inversiones finalizadas hasta la fecha. Todos nuestros activos actuales mantienen un crecimiento estratégico.",
        "portfolio-quote-1": "\"El sector de la seguridad privada es un mercado grande y de rápido crecimiento, con un valor global proyectado de 284.5 mil millones de dólares para 2025. Factores como el aumento de la criminalidad y la necesidad de proteger infraestructura crítica han incrementado significativamente la demanda.\"",
        "portfolio-quote-2": "\"La creciente conciencia y adopción de tecnología en los sistemas de seguridad está impulsando la expansión del sector, creando oportunidades únicas para la inversión estratégica en firmas especializadas que lideran la transformación digital de la defensa.\"",
        "portfolio-quote-author": "Jose Carlos Mapelli",
        "editorial-all-posts": "Todas las publicaciones",
        "editorial-empty-title": "Vuelve pronto.",
        "editorial-empty-desc": "Cuando se publiquen entradas, las verás aquí.",
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

    const alts = document.querySelectorAll('[data-i18n-alt]');

    alts.forEach(el => {
        const clave = el.getAttribute('data-i18n-alt');

        if (traducciones[clave]) {
            el.alt = traducciones[clave];
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
