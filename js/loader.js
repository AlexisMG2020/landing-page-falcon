// Esperamos a que el esqueleto de la página (index.html) cargue
document.addEventListener("DOMContentLoaded", () => {
    cargarComponentes();
});

// Función para abrir y cerrar el menú en celulares
window.toggleMenu = function() {
    const menu = document.getElementById('nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    // Si existen en la pantalla, les ponemos o quitamos la clase 'active'
    if(menu && hamburger) {
        menu.classList.toggle('active');
        hamburger.classList.toggle('active');
    }
};

async function cargarComponentes() {
    // 1. Buscamos todos los "contenedores vacíos" que piden un componente
    const elementos = document.querySelectorAll('[data-include]');

    // 2. Iteramos sobre cada uno para ir a buscar su archivo HTML
    for (let el of elementos) {
        const archivo = el.getAttribute('data-include');
        
        try {
            // Hacemos la petición HTTP al servidor (o al Live Server)
            const respuesta = await fetch(archivo);
            
            if (respuesta.ok) {
                // Si lo encuentra, lo convertimos a texto
                const html = await respuesta.text();
                
                // Lo inyectamos en la pantalla
                el.innerHTML = html;
                
                // Limpiamos la etiqueta para que el código final quede impecable
                el.removeAttribute('data-include'); 
            } else {
                console.error(`Error 404: No se pudo cargar el archivo ${archivo}`);
                el.innerHTML = `<p style="color:red; padding: 20px;">Falta el componente: ${archivo}</p>`;
            }
        } catch (error) {
            console.error(`Error de red al intentar cargar ${archivo}:`, error);
        }
    }

    // 3. ✨ LA MAGIA FINAL: Activamos el traductor
    // Validamos que la función exista (por si algún día quitas el traductor.js, que no falle todo)
    if (typeof traducirPagina === "function") {
        console.log("Componentes cargados. Iniciando traducción...");
        traducirPagina();
    } else {
        console.warn("Aviso: El archivo traductor.js no está enlazado o no se encontró la función.");
    }
}