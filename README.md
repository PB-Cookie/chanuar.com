<p align="center">
  <a href="https://chanuar.com">
    <img src="./public/favicon.svg" width="96" height="96" alt="Logo de chanuar.com" />
  </a>
</p>

<h1 align="center">chanuar.com</h1>

<p align="center">
  Portfolio personal y aplicaciones web de <strong>@chanuar</strong>.
</p>

<p align="center">
  <a href="https://chanuar.com">
    <img src="https://img.shields.io/website?url=https%3A%2F%2Fchanuar.com&style=for-the-badge&label=chanuar.com&labelColor=080b12&color=72d6cc" alt="Estado de chanuar.com" />
  </a>
  <a href="https://github.com/chanuar/chanuar.com/commits/main">
    <img src="https://img.shields.io/github/last-commit/chanuar/chanuar.com?style=for-the-badge&label=%C3%BAltimo%20commit&labelColor=080b12&color=d0ad67" alt="Último commit" />
  </a>
</p>

## ✨ Proyectos

| Proyecto         | Descripción                                                           | Enlace                                           |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------------ |
| 🏠 **Portfolio** | Presentación, proyectos y formas de contacto.                         | [Abrir portfolio](https://chanuar.com)           |
| 🎮 **Skinfolio** | Colección de skins, chromas, ofertas y progreso de League of Legends. | [Abrir Skinfolio](https://chanuar.com/skinfolio) |
| 🍔 **MenuBox**   | Pedidos semanales de equipo, restaurantes, carta y administración.    | [Abrir MenuBox](https://chanuar.com/food)        |

## 🧱 Tecnologías

### Este repositorio

<p>
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=080b12" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript strict" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/React_Router-7-ca4245?style=flat-square&logo=reactrouter&logoColor=white" alt="React Router 7" />
  <img src="https://img.shields.io/badge/Supabase-2-3fcf8e?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vitest-4-6e9f18?style=flat-square&logo=vitest&logoColor=white" alt="Vitest 4" />
  <img src="https://img.shields.io/badge/Cloudflare_Pages-f38020?style=flat-square&logo=cloudflarepages&logoColor=white" alt="Cloudflare Pages" />
</p>

### También trabajo con

<p>
  <img src="https://img.shields.io/badge/Python-3.12-3776ab?style=flat-square&logo=python&logoColor=white" alt="Python 3.12" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
</p>

## 🗺️ Arquitectura

Una sola aplicación Vite desplegada en el mismo dominio, organizada por producto:

```text
src/
├── app/                  # Portfolio, router, metadata y 404
├── products/
│   ├── skinfolio/        # Colección de League of Legends
│   └── food/             # Pedidos, restaurantes y administración
├── shared/               # Configuración realmente compartida
└── test/                 # Configuración global de Vitest
```

Cada producto mantiene sus rutas, modelos, API, componentes y estilos. Las lecturas iniciales se
realizan con loaders de React Router y las mutaciones permanecen en los eventos de usuario.

## 🚀 Desarrollo local

Necesitas Node.js 20.19 o una versión posterior.

```bash
git clone https://github.com/chanuar/chanuar.com.git
cd chanuar.com
npm ci
cp .env.example .env
npm run dev
```

Configura estas variables en `.env` para conectar los productos con Supabase:

| Variable                        | Uso                                          |
| ------------------------------- | -------------------------------------------- |
| `VITE_SUPABASE_URL`             | URL pública del proyecto de Supabase.        |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave publicable utilizada por el navegador. |

Las migraciones están en `supabase/migrations/`. El importador de restaurantes vive en el
repositorio hermano `food-scrapper` y publica catálogos en el mismo esquema `food`.

## 🧪 Calidad

| Comando                | Comprueba                                               |
| ---------------------- | ------------------------------------------------------- |
| `npm test`             | Tests de modelos, API, rutas y accesibilidad.           |
| `npm run typecheck`    | TypeScript estricto sin emitir archivos.                |
| `npm run lint`         | ESLint sin permitir advertencias.                       |
| `npm run format:check` | Formato de Prettier.                                    |
| `npm run build`        | TypeScript y todos los puntos de entrada de producción. |

Los hooks de Git ejecutan formato y lint antes de cada commit, y typecheck más la suite completa
antes de cada push.

## ☁️ Despliegue

Cloudflare Pages sirve los puntos de entrada estáticos de cada ruta y React Router se encarga de la
navegación dentro de la aplicación. Las rutas desconocidas conservan una respuesta 404 real con el
mismo diseño del portfolio.

## 🤝 Contacto

<p>
  <a href="https://github.com/chanuar">
    <img src="https://img.shields.io/badge/GitHub-@chanuar-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub de @chanuar" />
  </a>
  <a href="https://www.linkedin.com/in/carlos-chanuar-mart%C3%ADnez-591653251/">
    <img src="https://img.shields.io/badge/LinkedIn-Carlos_Chanuar-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn de Carlos Chanuar" />
  </a>
  <a href="mailto:carlos@chanuar.com">
    <img src="https://img.shields.io/badge/Email-carlos%40chanuar.com-d0ad67?style=for-the-badge&logo=gmail&logoColor=080b12" alt="Enviar un email a carlos@chanuar.com" />
  </a>
</p>
