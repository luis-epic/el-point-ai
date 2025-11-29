# 📍 El Point AI

> **Descubre tu ciudad, sin dar vueltas.**
> Un directorio georreferenciado e inteligente que te dice "cuál es el point" usando el poder de Gemini AI y Google Maps.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)
![Gemini](https://img.shields.io/badge/Gemini_API-2.5_Flash-8E75B2?logo=google-gemini)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)

## 📱 ¿Qué es El Point?

**El Point** resuelve el problema de "no sé dónde ir" o "no sé qué hay cerca". A diferencia de los mapas aburridos, El Point usa **Inteligencia Artificial** para entender exactamente qué buscas (ej: *"Un sitio para comer cachapas barato"*) y te muestra resultados reales, ubicados en el mapa, con fotos y calificaciones.

### Características Principales

*   **📍 AI Grounding con Google Maps:** La IA no inventa direcciones. Usa herramientas reales de Google Maps para darte coordenadas exactas.
*   **🗺️ Mapa Interactivo (Clustering):** Agrupa los marcadores para que el mapa no sea un desastre visual.
*   **🎙️ Búsqueda por Voz:** ¿Te da flojera escribir? Dímelo por voz.
*   **💾 Backend Híbrido:** Funciona con **Supabase** para guardar tus datos en la nube, pero si no hay internet, guarda todo en tu teléfono (LocalStorage).
*   **📱 PWA (App Nativa):** Instálala en tu iPhone o Android y úsala sin conexión. Se siente como una app de verdad.
*   **🇻🇪 Hecho con Sabor:** Interfaz traducida con jerga local para que te sientas en casa.
*   **🔐 Perfil de Usuario:** Guarda tus "Points" favoritos y lleva un historial de dónde has estado.

## 🛠️ Stack Tecnológico

Este proyecto fue construido con una arquitectura **Senior Frontend**:

| Categoría | Tecnología | Razón |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | Lo último en velocidad y gestión de estado. |
| **Estilos** | Tailwind CSS | Diseño responsivo "Mobile-First" rápido y limpio. |
| **AI Integration** | Google GenAI SDK | Modelo `gemini-2.5-flash` para respuestas rápidas y precisas. |
| **Mapas** | Leaflet JS | Mapas ligeros y rápidos sin costos excesivos de API. |
| **Backend** | Supabase | Base de datos real y autenticación segura. |
| **Lenguaje** | TypeScript | Código robusto y sin errores tontos. |

## 🚀 Puntos Fuertes de Arquitectura

1.  **Patrón de Servicios:** Toda la lógica de API está separada de la vista (`services/`).
2.  **Context API:** Manejo global del idioma y la sesión del usuario sin complicar el código.
3.  **Degradación Elegante:** Si falla el GPS o la Base de Datos, la app no se rompe, se adapta.
4.  **UI Optimista:** La app responde al instante, aunque el servidor tarde un poco.

## 👨‍💻 Desarrollado por

**[Tu Nombre]**

*   [LinkedIn](https://www.linkedin.com/in/luisepico/)
*   [GitHub](https://github.com/luis-epic)

---

*Proyecto de portafolio educativo.*