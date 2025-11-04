/**
 * @file main.js
 * @brief Lógica principal para el menú digital de Doña Ana.
 *
 * Este script maneja:
 * 1. La lógica completa del carrito de compras (Añadir, ajustar, modal, envío a WhatsApp).
 * 2. La carga dinámica del menú desde un Headless CMS (Strapi).
 * 3. La interacción del usuario con las categorías del menú.
 * 4. La inicialización de la aplicación y los listeners de eventos globales.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ======================================================================
    // 0. INICIALIZACIÓN DE ICONOS
    // ======================================================================
    
    // Reemplaza todos los elementos <i data-feather="..."> con los iconos SVG correspondientes.
    feather.replace();

    // ======================================================================
    // 1. LÓGICA DEL CARRITO DE COMPRAS
    // ======================================================================

    /**
     * @type {Array<Object>}
     * @description Estado central del carrito. Guarda objetos { nombre, precio, cantidad }.
     */
    let cart = [];

    // --- Elementos del DOM para el carrito y modal ---
    const cartCounter = document.getElementById('cart-counter');
    const openModalBtn = document.getElementById('open-whatsapp-modal-btn');
    const closeModalBtn = document.getElementById('close-whatsapp-modal-btn');
    const modal = document.getElementById('whatsapp-modal');
    const form = document.getElementById('whatsapp-form');
    const cartSummaryList = document.getElementById('cart-summary-list');
    const cartTotal = document.getElementById('cart-total');
    const sendBtn = document.getElementById('send-whatsapp-btn');
    const toast = document.getElementById('toast-notification');
    const phoneNumber = '18298383731'; // Número de WhatsApp para pedidos

    /**
     * Añade un artículo al carrito o incrementa su cantidad si ya existe.
     * @param {string} nombre - Nombre del plato.
     * @param {number} precio - Precio (numérico) del plato.
     */
    function addToCart(nombre, precio) {
        const existingItem = cart.find(item => item.nombre === nombre);

        if (existingItem) {
            // Si ya existe, solo aumenta la cantidad
            existingItem.cantidad += 1;
        } else {
            // Si es nuevo, lo añade al carrito
            cart.push({ nombre, precio, cantidad: 1 });
        }
        
        updateCartCounter(); // Actualiza el número en el botón flotante
        showToast(`${nombre} añadido al pedido`); // Muestra la notificación
    }

    /**
     * Ajusta la cantidad de un artículo en el carrito (suma o resta).
     * Si la cantidad llega a 0, elimina el artículo.
     * @param {string} nombre - Nombre del plato.
     * @param {number} amount - La cantidad a ajustar (ej. +1 o -1).
     */
    function adjustCartQuantity(nombre, amount) {
        const item = cart.find(i => i.nombre === nombre);

        if (item) {
            item.cantidad += amount; // Suma o resta
            
            // Si la cantidad llega a 0 o menos, eliminamos el artículo del carrito
            if (item.cantidad <= 0) {
                cart = cart.filter(i => i.nombre !== nombre);
            }
        }
        
        // Actualizamos todos los contadores y la vista del modal
        updateCartCounter();
        renderCartSummary(); 
    }

    /**
     * Actualiza el contador de artículos en el botón flotante de WhatsApp.
     */
    function updateCartCounter() {
        // Suma la 'cantidad' de todos los artículos en el carrito
        const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
        
        if (totalItems > 0) {
            cartCounter.innerText = totalItems;
            cartCounter.classList.remove('hidden'); // Muestra el contador
        } else {
            cartCounter.classList.add('hidden'); // Oculta si el carrito está vacío
        }
    }

    /**
     * Muestra una notificación toast temporal en la esquina.
     * @param {string} message - El mensaje a mostrar.
     */
    function showToast(message) {
        toast.innerText = message;
        toast.classList.remove('hidden');
        
        // Oculta el toast después de 3 segundos
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000); 
    }

    /**
     * Renderiza la lista de artículos y el total en el modal de WhatsApp.
     * Incluye los botones de +/- para ajustar la cantidad.
     */
    function renderCartSummary() {
        // Limpia el contenido anterior
        cartSummaryList.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartSummaryList.innerHTML = '<p class="text-gray-600 dark:text-gray-300">Tu carrito está vacío.</p>';
            cartTotal.innerText = 'Total: $0 DOP';
            sendBtn.disabled = true; // Deshabilita el botón de enviar
            return;
        }

        sendBtn.disabled = false; // Habilita el botón si hay artículos
        const ul = document.createElement('ul');
        ul.className = 'space-y-3';

        cart.forEach(item => {
            const itemTotal = item.precio * item.cantidad;
            total += itemTotal;
            
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center text-gray-700 dark:text-gray-300';
            
            // HTML para cada fila del carrito en el modal
            li.innerHTML = `
                <div class="flex-grow">
                    <span class="font-bold">${item.nombre}</span>
                    <span class="text-sm block text-gray-500">($${item.precio} c/u)</span>
                </div>
                <div class="flex items-center space-x-3">
                    <button type="button" 
                            class="cart-decrease-btn bg-gray-200 dark:bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-lg"
                            data-nombre="${item.nombre}">-</button>
                    
                    <span class="font-medium w-5 text-center">${item.cantidad}</span>
                    
                    <button type="button" 
                            class="cart-increase-btn bg-gray-200 dark:bg-gray-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-lg"
                            data-nombre="${item.nombre}">+</button>
                    
                    <span class="font-medium w-16 text-right">$${itemTotal}</span>
                </div>
            `;
            ul.appendChild(li);
        });

        cartSummaryList.appendChild(ul);
        cartTotal.innerText = `Total: $${total} DOP`;
    }

    /**
     * Genera el mensaje de texto formateado para WhatsApp basado en el carrito.
     * @returns {string} - El mensaje formateado.
     */
    function generateWhatsAppMessage() {
        if (cart.length === 0) {
            return 'Hola Doña Ana, tengo una consulta.';
        }

        let message = 'Hola Doña Ana, quisiera hacer el siguiente pedido:\n\n';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.precio * item.cantidad;
            total += itemTotal;
            message += `${item.cantidad}x ${item.nombre} - $${itemTotal} DOP\n`;
        });

        message += `\n*Total del Pedido: $${total} DOP*`;
        return message;
    }

    // --- Event Listeners del Modal de WhatsApp ---
    
    /**
     * Abre el modal y renderiza el resumen del carrito.
     */
    const openModal = () => {
        renderCartSummary(); // Prepara el resumen ANTES de mostrar el modal
        modal.classList.remove('hidden');
    };
    
    /**
     * Cierra el modal.
     */
    const closeModal = () => modal.classList.add('hidden');

    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Cierra el modal si se hace clic fuera del contenido
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    /**
     * Maneja el envío del formulario: genera el enlace de WhatsApp,
     * lo abre en una nueva pestaña y resetea el carrito.
     */
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Evita que el formulario se envíe
        
        // Genera el mensaje basado en el carrito y lo codifica para URL
        const message = encodeURIComponent(generateWhatsAppMessage());
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;

        window.open(whatsappURL, '_blank'); // Abre WhatsApp en una nueva pestaña
        
        // Resetea el carrito después de enviar
        cart = [];
        updateCartCounter();
        closeModal();
    });


    // ======================================================================
    // 2. LÓGICA DE DATOS Y RENDERIZADO DEL MENÚ (DESDE CMS)
    // ======================================================================

    // Define la URL de tu API de Strapi
    const STRAPI_URL = 'https://playful-frog-f7a511c8e4.strapiapp.com';
    
    
    // Esta es la sintaxis más limpia y correcta:
    const API_URL = `${STRAPI_URL}/api/categorias`;

    // Contenedores del DOM que limpiamos en index.html
    const categoryButtonsContainer = document.getElementById('category-buttons-container');
    const categorySelect = document.getElementById('category-select');
    const menuGridsContainer = document.getElementById('menu-grids-container');

    /**
     * Función principal para inicializar el menú.
     * Llama a la API, procesa los datos y construye el DOM.
     */
    async function initializeMenu() {
        try {
            // 1. Busca los datos en la API
            console.log('Obteniendo datos del menú...');
            const categories = await fetchMenuData();
            
            if (!categories || categories.length === 0) {
                menuGridsContainer.innerHTML = '<p class="text-center text-red-500">No se pudo cargar el menú. Revisa la conexión con la API.</p>';
                return;
            }
            console.log('Datos recibidos:', categories);


            // === INICIO: CÓDIGO PARA ORDENAR CATEGORÍAS ===

// 1. Define el orden que quieres (asegúrate que los nombres coincidan exacto)
const desiredOrder = ['Entradas', 'De la casa', 'Platos fuertes', 'Bebidas', 'Postres'];

// 2. Reordena el array 'categories' usando el array 'desiredOrder'
categories.sort((a, b) => {
    // Obtenemos la posición de cada categoría en nuestro array de orden
    // Usamos .Nombre porque tus datos ya están "planos"
    const orderA = desiredOrder.indexOf(a.Nombre);
    const orderB = desiredOrder.indexOf(b.Nombre);

    // Si una categoría no está en nuestra lista (ej: "Especiales"), la manda al final
    if (orderA === -1) return 1;
    if (orderB === -1) return -1;

    return orderA - orderB; // Compara las posiciones
});

// === FIN: CÓDIGO PARA ORDENAR CATEGORÍAS ===

            // 2. Construye el HTML (botones, select y rejillas)
            buildMenuDOM(categories);
            
            // 3. Activa los listeners para los botones que acabamos de crear
            setupCategoryListeners();

            // 4. Muestra la primera categoría por defecto
            // Usamos 'Slug' (ej: "entradas") que definimos en Strapi
            const defaultCategorySlug = categories[0].Slug;
            showCategory(defaultCategorySlug);

        } catch (error) {
            console.error('Error al inicializar el menú:', error);
            menuGridsContainer.innerHTML = `<p class="text-center text-red-500">Error al cargar el menú: ${error.message}</p>`;
        }
    }

    // main.js

    /**
     * Obtiene los datos de categorías y platos desde Strapi.
     * @returns {Promise<Array>} - Un array de objetos de categoría.
     */
    async function fetchMenuData() {
        
        // Esta es la query para poblar la relación 'platoes' 
        // y, dentro de ella, poblar la 'Imagen' de cada plato.
        // CORRECCIÓN PRECISA
        const queryParams = '?populate[platoes][populate]=Imagen';
        
        // Añadimos los parámetros de la query a la URL de la API
        const response = await fetch(API_URL + queryParams); 
        
        if (!response.ok) {
            throw new Error(`Error de red: ${response.statusText} (¿Está el servidor de Strapi corriendo?)`);
        }
        
        const parsedResponse = await response.json();
        
        // Añadimos un log para depuración que nos mostrará la respuesta completa
        console.log('Respuesta COMPLETA de Strapi:', parsedResponse);
        
        return parsedResponse.data; // El array de categorías está en 'data'
    }

    /**
     * Construye el HTML para los botones, selectores y rejillas de platos.
     * @param {Array} categories - El array de categorías de la API.
     */
    function buildMenuDOM(categories) {
        // Limpiamos contenedores por si acaso
        categoryButtonsContainer.innerHTML = '';
        categorySelect.innerHTML = '';
        menuGridsContainer.innerHTML = '';

        categories.forEach(category => {
            const { Nombre, Slug } = category; // Ej: "Entradas", "entradas"
            const platos = category.platoes;

            // 1. Crear botón (Desktop)
            const button = document.createElement('button');
            button.className = 'category-btn px-4 py-2 font-semibold rounded-lg whitespace-nowrap bg-gray-200 dark:bg-gray-700'; // Estado inactivo
            button.dataset.category = Slug; // Usamos el Slug como ID
            button.textContent = Nombre;
            categoryButtonsContainer.appendChild(button);

            // 2. Crear opción (Móvil)
            const option = document.createElement('option');
            option.value = Slug;
            option.textContent = Nombre;
            categorySelect.appendChild(option);

            // 3. Crear la rejilla de platos para esta categoría
            const gridDiv = document.createElement('div');
            gridDiv.className = 'dish-grid grid grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-300 ease-in-out';
            gridDiv.id = Slug; // El ID ahora es el Slug (ej: "entradas")
            gridDiv.classList.add('hidden', 'opacity-0'); // Oculto por defecto
            menuGridsContainer.appendChild(gridDiv); // Añadimos la rejilla al contenedor principal

            // 4. Poblar la rejilla con sus platos
            if (platos && platos.length > 0) {
                // Usamos la función createDishCard (modificada)
                const platosHTML = platos.map(plato => createDishCard(plato)).join('');
                gridDiv.innerHTML = platosHTML;
            } else {
                gridDiv.innerHTML = `<p class="col-span-full text-center text-gray-500">No hay platos en esta categoría.</p>`;
            }
        });
    }

    /**
     * Crea el string HTML para una sola tarjeta de plato (Versión Strapi).
     * @param {object} plato - El objeto de plato desde Strapi.
     * @returns {string} - El HTML de la tarjeta del plato.
     */
    function createDishCard(plato) {
        // Obtenemos los datos desde 'attributes'
        const { Nombre, Descripcion, Precio } = plato;
        
        // Manejo de la URL de la imagen
        const imagenData = plato.Imagen;
        // Creamos la URL completa (ej: http://localhost:1337/uploads/imagen.jpg)
       const imageUrl = imagenData 
        ? imagenData.url // <-- ¡Simplemente usa la URL que ya te da Strapi!
        : 'static/placeholder.png';
        
        // El precio ahora es un número, lo formateamos
        const precioString = `${Precio} DOP`;
        const precioNumerico = Precio; // Este ya es un número para el data-precio

        return `
            <div class="dish-card bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                
                <div class="relative h-48 overflow-hidden">
                    <img src="${imageUrl}" alt="${Nombre}" class="w-full h-full object-cover">
                    <div class="absolute top-2 right-2 bg-primary-light dark:bg-primary-dark text-white px-3 py-1 rounded-full text-sm">
                        ${precioString}
                    </div>
                </div>

                <div class="p-6 flex flex-col flex-grow text-center">
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">${Nombre}</h3>
                    <p class="text-gray-600 dark:text-gray-300 mb-4 flex-grow text-sm">
                        ${Descripcion || ''}
                    </p>
                    
                    <button 
                        class="add-to-cart-btn bg-primary-light text-black dark:bg-primary-dark dark:text-white dark:hover:bg-[#4a90e2] font-semibold py-2 px-4 rounded-full mt-auto mx-auto hover:bg-[#4a90e2] transition-colors duration-300"
                        data-nombre="${Nombre}"
                        data-precio="${precioNumerico}">
                        Añadir al pedido
                    </button>
                </div>
            </div>
        `;
    }



    // ======================================================================
    // 3. LÓGICA DE INTERACCIÓN DEL MENÚ Y NAVEGACIÓN
    // ======================================================================

    /**
     * Muestra una rejilla de categoría específica y oculta las demás.
     * También actualiza el estado activo de los botones y el select.
     * @param {string} targetCategoryId - El 'Slug' de la categoría a mostrar (ej: "entradas").
     */
    function showCategory(targetCategoryId) {
        // Seleccionamos los elementos *después* de que se hayan creado
        const categoryButtons = document.querySelectorAll('.category-btn');
        const dishGrids = document.querySelectorAll('.dish-grid');
        const categorySelect = document.getElementById('category-select'); // Este ya existía
        const transitionDuration = 300; // ms

        // Lógica para resaltar el botón activo
        categoryButtons.forEach(btn => {
            const isActive = btn.dataset.category === targetCategoryId;
            btn.classList.toggle('bg-primary-light', isActive);
            btn.classList.toggle('dark:bg-primary-dark', isActive);
            btn.classList.toggle('text-white', isActive);
            btn.classList.toggle('bg-gray-200', !isActive);
            btn.classList.toggle('dark:bg-gray-700', !isActive);
        });

        // Sincronizar el <select> móvil
        if (categorySelect) {
            categorySelect.value = targetCategoryId;
        }

        // Lógica para mostrar/ocultar la rejilla de platos con transición
        dishGrids.forEach(grid => {
            if (grid.id === targetCategoryId) {
                grid.classList.remove('hidden');
                setTimeout(() => grid.classList.remove('opacity-0'), 20); // Pequeño delay
            } else {
                grid.classList.add('opacity-0');
                setTimeout(() => grid.classList.add('hidden'), transitionDuration);
            }
        });
    }

    /**
     * Asigna los event listeners a los botones y select que creamos dinámicamente.
     * Esta función es llamada por initializeMenu() DESPUÉS de que el DOM está construido.
     */
    function setupCategoryListeners() {
        // Seleccionamos los botones que acabamos de crear
        const categoryButtons = document.querySelectorAll('.category-btn');
        const categorySelect = document.getElementById('category-select'); 

        // Asignamos los listeners
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                showCategory(button.dataset.category);
            });
        });

        if (categorySelect) {
            categorySelect.addEventListener('change', (event) => {
                showCategory(event.target.value);
            });
        }
    }


    // ======================================================================
    // 4. INICIALIZACIÓN Y EVENT LISTENERS GLOBALES (SECCIÓN CORREGIDA)
    // ======================================================================

    // 1. (MODIFICADO) Llama a la función principal para construir el menú desde Strapi
    initializeMenu();

    // [CÓDIGO ELIMINADO]
    // Las llamadas a populateMenu(), showCategory('Entradas'), 
    // y los listeners de categoría antiguos han sido eliminados.
    // setupCategoryListeners() ahora maneja los listeners.

    // 2. Listener de animaciones de scroll (Fade In) 
    const fadeElements = document.querySelectorAll('.fade-in');
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Quita el estado inicial y añade el final
                entry.target.classList.remove('opacity-0', 'translate-y-5');
                entry.target.classList.add('opacity-100', 'translate-y-0'); 
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(element => {
        fadeInObserver.observe(element);
    });

    
    // 3. Event Delegation para TODOS los botones (Añadir, Sumar, Restar)
    // Usamos un solo listener en todo el 'document' para manejar clics
    // en botones que se crean dinámicamente (como los platos y los botones del modal).
    document.addEventListener('click', (event) => {
        const target = event.target; // El elemento donde se hizo clic

        // Botón "Añadir al pedido" (en las tarjetas del menú)
        // Usamos .closest() para asegurarnos de capturar el clic
        // incluso si el usuario hace clic en el texto dentro del botón.
        if (target.closest('.add-to-cart-btn')) {
            const button = target.closest('.add-to-cart-btn');
            const nombre = button.dataset.nombre;
            const precio = parseFloat(button.dataset.precio);
            
            if (nombre && !isNaN(precio)) {
                addToCart(nombre, precio);
            }
        }

        // Botón "-" (Disminuir) en el modal
        if (target.closest('.cart-decrease-btn')) {
            const button = target.closest('.cart-decrease-btn');
            const nombre = button.dataset.nombre;
            if (nombre) {
                adjustCartQuantity(nombre, -1); // Llama a la función con -1
            }
        }

        // Botón "+" (Aumentar) en el modal
        if (target.closest('.cart-increase-btn')) {
            const button = target.closest('.cart-increase-btn');
            const nombre = button.dataset.nombre;
            if (nombre) {
                adjustCartQuantity(nombre, 1); // Llama a la función con +1
            }
        }
    });

}); // Fin del DOMContentLoaded