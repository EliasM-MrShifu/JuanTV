# JuanTV

Plataforma de streaming de práctica con Vue 3, Vite, Express, MongoDB/Mongoose, JWT y Pinia.

## Requisitos

- Node.js 20.12 o superior y npm.
- Una base MongoDB Atlas accesible desde tu red. El proyecto fija Vite 6 para ser compatible con Node 20.12.

## Configuración

1. Crea un proyecto y una base de datos en MongoDB Atlas. En Network Access permite tu IP actual y crea un usuario de base de datos.
2. Copia `server/.env.example` como `server/.env` y completa `URI_LINK` con la cadena de conexión de Atlas y `JWT_SECRET` con un secreto aleatorio largo. No publiques el archivo `.env`.
3. Copia `client/.env.example` como `client/.env`. El valor por defecto de `VITE_API_URL` es `http://localhost:4000/api`.
4. Instala las dependencias en terminales separadas:

```powershell
cd server
npm install
```

```powershell
cd client
npm install
```

## Ejecutar

En una terminal:

```powershell
cd server
npm run dev
```

La API escucha en `http://localhost:4000`; el chequeo de salud es `GET /api/health`.

En otra terminal:

```powershell
cd client
npm run dev
```

Abre la URL que informa Vite, normalmente `http://localhost:5173`.

## Cargar datos

Con `server/.env` configurado y MongoDB accesible:

```powershell
cd server
npm run seed
```

El seed reemplaza las colecciones de categorías y películas y crea ocho categorías y cuarenta títulos de muestra. Verifica las imágenes y trailers resultantes desde tu red; el contenido de demostración y sus enlaces multimedia deben revisarse antes de publicar o redistribuir el proyecto. Usa material con licencia apropiada en despliegues públicos.

## Rutas principales

- `GET /api/health`
- Catálogo público: `GET /api/categories`, `GET /api/movies`, `GET /api/movies/featured`, `GET /api/movies/:id`, `GET /api/movies/:id/similar`
- Búsqueda/paginación: `GET /api/movies?title=...&category=...&page=1&limit=12`
- Auth: `POST /api/auth/signup`, `POST /api/auth/signin`
- Personalización autenticada: `/api/users/mylist`, `/api/users/history`, `POST /api/movies/:id/ratings`, `GET /api/movies/recommendations`
- Las mutaciones de películas/categorías también requieren Bearer JWT. Los GET del catálogo son públicos.

La colección importable de Postman está en `postman/JuanTV.postman_collection.json`. Define `baseUrl`, `token`, `movieId` y `categoryId` en el entorno; copia el token de signin a `token` para probar las rutas privadas.

## Checklist y pruebas

- Home responsive, categorías y catálogo consumidos desde la API; búsqueda con debounce y paginación: ejecutar ambos servidores, abrir Home, buscar por título y cargar más resultados.
- Detalle por modal y por URL directa, similar, trailer/player, compartir y cierre por X/Escape/fondo: abrir una tarjeta y probar cada control.
- Signup/signin, validación en vivo, restauración de sesión y cierre global ante 401: crear cuenta, recargar y cerrar sesión.
- Mi Lista, estrellas, historial y recomendaciones: iniciar sesión, guardar y calificar una película, reproducirla y revisar las filas de Home.
- Datos y claves: confirmar que no se expone `password` en las respuestas y que `.env` no se versiona.

## Posibles revisiones antes de publicar

- Revisar manualmente disponibilidad, correspondencia y licencias de cada imagen y trailer de muestra.
- Configurar orígenes CORS, secretos, HTTPS, límites de solicitudes y logging para producción.
- Los enlaces multimedia son fixtures del seed, no un catálogo con derechos de distribución.
