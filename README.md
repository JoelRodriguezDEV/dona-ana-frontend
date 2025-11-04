# 🍽️ Menú Digital - Restaurante Doña Ana

![GitHub issues](https://img.shields.io/github/issues/tu-usuario/tu-repositorio?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/tu-usuario/tu-repositorio?style=for-the-badge)
![GitHub stars](https://img.shields.io/github/stars/tu-usuario/tu-repositorio?style=for-the-badge)

Un menú digital interactivo y moderno para el restaurante Doña Ana, construido con Vanilla JavaScript y conectado a un CMS Headless (Strapi) para la gestión dinámica del contenido.

## 🚀 Demo en Vivo

¡Prueba la aplicación en vivo!

**[https://inspiring-naiad-b0b9aa.netlify.app/](https://inspiring-naiad-b0b9aa.netlify.app/#menu)**

---

## 📖 Sobre el Proyecto

Este proyecto reemplaza un menú físico tradicional por una experiencia web interactiva. Los clientes pueden explorar los platos, filtrarlos por categoría y añadirlos a un carrito de compras. Al finalizar, pueden revisar su pedido en un modal y enviarlo directamente al número de WhatsApp del restaurante con un mensaje pre-formateado.

El contenido del menú (categorías, platos, precios, imágenes) no está escrito en el HTML, sino que se obtiene dinámicamente desde una **API de Strapi**, permitiendo al personal del restaurante actualizar el menú sin tocar el código.

## ✨ Características Principales

* **🛒 Carrito de Compras Completo:** Añadir al carrito, ajustar cantidades (+/-) y eliminación automática si la cantidad llega a cero.
* **📱 Envío de Pedidos por WhatsApp:** Un modal resume el pedido y genera un enlace `wa.me/` con un mensaje formateado listo para enviar.
* **🚀 Carga Dinámica desde CMS:** El menú se construye en tiempo real consumiendo la API de [Strapi](https://strapi.io/).
* **🎨 Interfaz Moderna y Receptiva:**
    * Diseño *Mobile-First* que se adapta a tablets y escritorio.
    * **Modo Oscuro** (Dark Mode) funcional.
    * Animaciones suaves (CSS Keyframes) y efectos de *hover*.
    * Notificaciones "Toast" no intrusivas al añadir artículos.
* **🔎 Filtro de Categorías:** Navegación sencilla por categorías mediante botones (desktop) y un menú desplegable (móvil).
* **🔧 Cero Dependencias (Frontend):** Construido puramente con **Vanilla JavaScript (ES6+)**, sin *frameworks* como React o Vue, para un rendimiento máximo.

## 🛠️ Tecnologías Utilizadas

Este proyecto utiliza un stack moderno de frontend, un backend Headless y está desplegado en Netlify.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Strapi](https://img.shields.io/badge/Strapi-2E7EEA?style=for-the-badge&logo=strapi&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
![Feather Icons](https://img.shields.io/badge/Feather-black?style=for-the-badge&logo=feather)

* **HTML5:** Estructura semántica del sitio.
* **Tailwind CSS:** Framework CSS *Utility-First* para un diseño rápido y receptivo.
* **Custom CSS (`style.css`):** Estilos personalizados, animaciones (`@keyframes`) y efectos de desenfoque (`backdrop-filter`) que complementan a Tailwind.
* **JavaScript (ES6+):** Toda la lógica de la aplicación, incluyendo:
    * Llamadas a la API (`fetch`).
    * Manipulación del DOM.
    * Gestión del estado del carrito.
    * Delegación de eventos.
* **Strapi (Headless CMS):** Backend donde se gestionan las categorías, platos, precios e imágenes.
* **Netlify:** Plataforma de *hosting* para el despliegue continuo y la entrega del sitio.
* **Feather Icons:** Iconos SVG ligeros y personalizables.
