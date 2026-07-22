# Estado actual del proyecto — Gestión de Personal y Certificaciones

> Generado inspeccionando el código real en el momento de escribir esto. Si algo cambia después, este documento queda desactualizado — no es una fuente viva, es una foto.

---

## 1. Árbol de carpetas

El proyecto tiene tres partes: `api/` (backend Node/Express/Sequelize), `frontend/` (Angular) y `nginx/` (reverse proxy, pensado para producción). No hay una carpeta `backend/` — el backend se llama `api/`.

### `api/` — Backend

```
api/
├── Dockerfile                  # node:24-alpine, corre `npm run dev` (nodemon) dentro del contenedor
├── .sequelizerc                # le dice a sequelize-cli que config/models/migrations/seeders viven bajo src/, no en la raíz de api/
├── package.json                # express, sequelize, tedious (driver SQL Server), bcryptjs, jsonwebtoken, cors, dotenv
└── src/
    ├── app.js                  # punto de entrada: crea el server Express, monta las rutas, intenta conectar a la BD sin bloquear el arranque
    ├── config/
    │   └── database.js         # config de conexión a SQL Server (lee variables de entorno), la usan tanto app.js como sequelize-cli
    ├── models/
    │   ├── index.js             # arma la instancia de Sequelize y carga todos los modelos del directorio automáticamente
    │   ├── empleado.js          # tabla `empleados`: rut, nombres, apellidos, email, estado
    │   ├── departamento.js      # tabla `departamentos`: nombre, ubicacion
    │   ├── certificacion.js     # tabla `certificaciones`: FK a empleado y a departamento, tipo, numero, fecha_emision, fecha_vencimiento, estado
    │   └── usuario.js           # tabla `usuarios`: username, password_hash, rol, FK opcional a empleado
    ├── migrations/               # 4 migraciones (una por tabla arriba), ya corridas contra la BD de desarrollo
    ├── seeders/                  # 1 seeder: 2 departamentos, 4 empleados, 4 certificaciones, 1 usuario "admin"
    ├── controllers/
    │   ├── empleadoController.js  # CRUD completo de Empleado: getAll, getById, create, update, remove — con manejo explícito de 404 y 409 (RUT/email duplicado, empleado con certificaciones asociadas)
    │   └── authController.js      # login: busca Usuario por username, compara password con bcryptjs, firma un JWT
    ├── routes/
    │   ├── empleadoRoutes.js    # mapea /api/empleados/* → empleadoController — SIN protección de autenticación
    │   └── authRoutes.js        # mapea POST /api/auth/login → authController.login
    └── middleware/
        └── authMiddleware.js    # valida un JWT del header Authorization — existe y funciona si se usa, pero HOY no está aplicado a ninguna ruta (ver sección 3)
```

No existen `departamentoController.js`, `certificacionController.js` ni sus rutas — aunque los modelos y las tablas sí existen (con datos de seed).

### `frontend/` — Angular 22 + Angular Material + Tailwind

```
frontend/
├── Dockerfile              # build multi-stage de Angular; hoy NO está conectado al docker-compose (ver sección 3)
├── angular.json
├── package.json            # Angular 22, Angular Material 22 (tema M3 azure-blue), Tailwind 3
├── tailwind.config.js       # paleta de colores custom en oklch(), calcada del diseño de Claude Design
├── proxy.conf.json          # cuando corrés `ng serve`, redirige las llamadas a /api hacia http://localhost:3000
└── src/
    ├── styles.scss           # tema global de Angular Material + directivas de Tailwind + overrides de densidad/color compartidos (inputs, tabla)
    └── app/
        ├── app.routes.ts      # el mapa de rutas real (ver sección 2 y 3 — hay menos páginas de las que sugiere el sidebar)
        ├── app.config.ts      # providers globales: router, HttpClient, animaciones
        ├── core/
        │   ├── auth.service.ts        # login(), guarda/lee token + usuario en localStorage, logout()
        │   ├── empleado.service.ts    # los 5 métodos CRUD como llamadas HTTP contra /api/empleados
        │   └── page-title.service.ts  # una signal (`title`) que el Header lee para mostrar el título de la página actual
        ├── layout/                    # extraído para no repetir sidebar/header en cada página
        │   ├── shell/                  # combina Sidebar + Header + <router-outlet>
        │   ├── sidebar/                 # nav lateral: Dashboard, Empleados, Departamentos, Certificaciones
        │   └── header/                  # barra superior: título dinámico (vía PageTitleService) + usuario + botón logout
        └── features/
            ├── login/                       # pantalla de login — vive FUERA del shell (sin sidebar/header)
            ├── dashboard/                   # KPIs: el de "empleados activos" es real, los dos de certificaciones son números fijos en el código
            └── empleados/
                ├── listado/                 # tabla de empleados conectada de verdad a la API, con filtros por texto y estado
                ├── empleado-form-dialog/    # modal de crear/editar (el componente YA soporta modo edición, pero nada lo dispara en modo edición todavía)
                └── detalle/                 # carpeta con SOLO un README.md — vista sin implementar
```

No existen carpetas `features/departamentos/` ni `features/certificaciones/` — el sidebar tiene links a esas rutas, pero no hay nada del otro lado (ver sección 3).

### `nginx/`

```
nginx/
├── Dockerfile      # nginx:alpine + nginx.conf; el COPY del build de Angular está comentado con un TODO explícito
└── nginx.conf       # sirve estáticos desde /usr/share/nginx/html y hace proxy_pass de /api/ hacia el contenedor api:3000
```

---

## 2. Flujo de datos

Voy a describir dos flujos que SÍ funcionan de punta a punta hoy, y después explicar dónde se corta el flujo en el resto de la app.

### Flujo real #1: iniciar sesión

1. El usuario escribe usuario/contraseña en la pantalla de Login (`features/login/login.ts`) y hace submit.
2. `Login.onSubmit()` llama a `AuthService.login(username, password)` (`core/auth.service.ts`).
3. Angular `HttpClient` dispara `POST /api/auth/login`. En desarrollo (`ng serve`), `proxy.conf.json` reenvía eso a `http://localhost:3000`.
4. En el backend, `app.js` tiene montado `app.use('/api/auth', authRoutes)`. `authRoutes.js` mapea `POST /login` → `authController.login`.
5. El controller busca el `Usuario` por `username` en la tabla `usuarios` (modelo `src/models/usuario.js`), compara el password contra `password_hash` con `bcryptjs`, y si coincide firma un JWT con `jsonwebtoken` (usando `JWT_SECRET` de las variables de entorno, 8h de expiración).
6. Responde `{ token, usuario: { id, username, rol } }`.
7. `AuthService` guarda token + usuario en `localStorage`, y `Login` navega a `/dashboard`.

**Importante**: el JWT se genera y se guarda, pero después de este punto **no se vuelve a usar**. No hay ningún interceptor de `HttpClient` que lo adjunte como header `Authorization` en las llamadas siguientes, y el `authMiddleware.js` que sabría validarlo no está enchufado en ninguna ruta del backend. El login "funciona" (autentica y navega), pero no protege nada — cualquiera puede pegarle a `/api/empleados` directamente, sin token, y responde igual.

### Flujo real #2: listado de empleados con filtros

1. Al entrar a `/empleados`, Angular renderiza `Shell` (sidebar + header) con `Listado` dentro del `<router-outlet>`.
2. El constructor de `Listado` arma un stream RxJS que escucha los controles `busqueda` (con debounce de 350ms) y `estado` del formulario de filtro, y llama a `EmpleadoService.getAll({ busqueda, estado })`.
3. Eso dispara `GET /api/empleados?busqueda=...&estado=...`.
4. `app.js` tiene `app.use('/api/empleados', empleadoRoutes)`; la ruta `GET /` mapea a `empleadoController.getAll`.
5. El controller arma un `WHERE` de Sequelize (`Op.like` sobre rut/nombres/apellidos para el texto libre, igualdad exacta para estado) y consulta la tabla `empleados`.
6. Devuelve el array como JSON; el frontend lo pone en una signal y `mat-table` lo renderiza.
7. Crear un empleado (desde el botón "+ Nuevo empleado" → `EmpleadoFormDialog`) sigue el mismo camino pero con `POST /api/empleados`, y al cerrar el diálogo con éxito, `Listado.recargar()` vuelve a pedir la lista.

### Dónde se corta el flujo (no llega hasta la base de datos)

- **Dashboard → KPIs de certificaciones**: los valores "1" (próximas a vencer) y "2" (vencidas) son literales hardcodeados en `dashboard.ts` (`protected readonly certificacionesPorVencer = 1;`), con un comentario `// TODO: reemplazar por datos reales cuando exista el CRUD de Certificacion en el backend`. No hay ningún `fetch`/HTTP de por medio para esos dos números, aunque la tabla `certificaciones` sí tiene datos reales de seed — simplemente nadie los está consultando todavía.
- **Departamentos y Certificaciones (las secciones completas)**: el sidebar linkea a `/departamentos` y `/certificaciones`, pero esas rutas no existen en `app.routes.ts`. Click ahí no navega a nada (el router de Angular tira un error de "no route found" en la consola del navegador, silencioso para el usuario). No hay componente, ni servicio, ni ruta backend para ninguna de las dos — aunque los modelos Sequelize + tablas + relaciones sí existen en el backend.
- **Detalle de empleado**: cada fila de la tabla de empleados tiene `[routerLink]="['/empleados', empleado.id]"`, pero esa ruta tampoco existe en `app.routes.ts`. Mismo problema: el click no lleva a ningún lado.
- **Editar un empleado**: a diferencia de los casos anteriores, acá el backend Y el frontend service SÍ están completos (`PUT /api/empleados/:id` existe y funciona; `EmpleadoFormDialog` ya sabe precargarse y llamar a `update()` en vez de `create()` si recibe un empleado). Lo que falta es el último eslabón: nada en `Listado` abre el diálogo pasándole un empleado existente — no hay botón "editar" conectado.
- **Eliminar un empleado**: mismo caso que editar — `DELETE /api/empleados/:id` existe y `EmpleadoService.remove()` existe, pero no hay ningún botón en el frontend que lo llame.

---

## 3. Qué es real y qué es placeholder todavía

### ✅ Real — conectado end-to-end contra la base de datos

- Login (`POST /api/auth/login`), con JWT generado y guardado en el navegador.
- Listado de empleados con filtro por texto (rut/nombres/apellidos) y por estado (`GET /api/empleados`).
- Crear empleado, incluyendo el manejo de error 409 si el RUT o el email ya existen (`POST /api/empleados`).
- Dashboard → KPI "Empleados activos" y "X en total" (cuenta real sobre `GET /api/empleados`).
- El backend para editar y eliminar empleado (`PUT`/`DELETE /api/empleados/:id`) y el método correspondiente en `EmpleadoService` — funcionan si los llamás, pero no hay UI que los dispare (ver abajo).

### 🚧 Placeholder / mock / sin conectar

- **Dashboard → KPIs de certificaciones**: números hardcodeados en el componente, no vienen de la API.
- **Departamentos**: no existe nada en el frontend (ni ruta, ni componente, ni servicio) ni en el backend (ni controller, ni rutas) — solo el modelo/tabla con 2 filas de seed.
- **Certificaciones**: mismo caso que Departamentos — modelo/tabla con 4 filas de seed, sin controller/rutas en el backend, sin nada en el frontend.
- **Vista de detalle de empleado**: la carpeta `features/empleados/detalle/` solo tiene un `README.md`.
- **Botón "editar" y "eliminar" en el listado de empleados**: no existen en la UI, aunque el backend y el service ya los soportan.
- **Protección real de rutas / autenticación en llamadas posteriores al login**: el JWT nunca se reenvía al backend (no hay `HttpInterceptor`), y `authMiddleware.js` no está aplicado a ninguna ruta. Hoy, cualquiera puede leer/crear/editar/borrar empleados sin loguearse, pegándole directo a la API.
- **Integración frontend ↔ nginx en producción**: `frontend/Dockerfile` sabe compilar el build de Angular, pero `docker-compose.yml` no usa ese Dockerfile ni copia el resultado al contenedor `nginx`. El `nginx/Dockerfile` tiene el `COPY` comentado con un TODO explícito. Hoy `docker compose up` levanta un nginx que no sirve nada útil (sin `index.html`) — el frontend en desarrollo se corre aparte, con `ng serve`, fuera de Docker.

---

## 4. Cómo correrlo local

Hoy la combinación que realmente funciona es: **backend + base de datos en Docker, frontend con `ng serve` por fuera**. No hay un único `docker compose up` que levante todo (ver nota de nginx arriba).

```bash
# 1. Desde la raíz del proyecto: levantar SQL Server + API
#    (el servicio "nginx" también existe en el compose pero no sirve nada útil hoy, se puede omitir)
docker compose up -d db api

# 2. Esperar a que SQL Server termine de arrancar — la primera vez puede
#    tardar 30-60s. Mirar los logs hasta ver "Recovery is complete.":
docker compose logs db -f
# (Ctrl+C para salir del seguimiento de logs una vez que aparece esa línea)

# 3. Confirmar que la API responde
curl http://localhost:3000/api/health
# esperado: {"status":"ok"}
```

**Solo si es la primera vez** que se crea el volumen de datos (`db-data`), hay que crear la base y correr migraciones + seed a mano dentro del contenedor `api`:

```bash
docker compose exec api npx sequelize-cli db:create
docker compose exec api npx sequelize-cli db:migrate
docker compose exec api npx sequelize-cli db:seed:all
```

Si el volumen `db-data` ya existe de una corrida anterior, este paso no hace falta — los datos persisten entre reinicios de los contenedores.

```bash
# 4. Frontend — instalar dependencias (solo la primera vez)
cd frontend
npm install

# 5. Levantar Angular en modo desarrollo
npm start
# equivalente a: npx ng serve --port 4200
```

Abrir `http://localhost:4200` en el navegador. Login con **`admin` / `admin123`** (usuario del seed).

### Verificar que quedó todo arriba

```bash
curl http://localhost:3000/api/health           # → {"status":"ok"}
curl http://localhost:3000/api/empleados        # → array JSON con 4 empleados del seed
```

- `http://localhost:4200/login` debe cargar la pantalla de login.
- Después de loguearse, `http://localhost:4200/dashboard` debe mostrar el KPI de empleados con datos reales (4 activos / 4 en total, con los datos del seed).
- `http://localhost:4200/empleados` debe mostrar la tabla con los 4 empleados del seed, y el filtro de texto/estado debe funcionar en vivo.

### Variables de entorno

Ya existe un `.env` en la raíz del proyecto con credenciales de desarrollo (`MSSQL_SA_PASSWORD=DevPassword123!`, `JWT_SECRET=dev-secret-cambiar-en-produccion`, etc.) — `docker compose` lo lee automáticamente, no hace falta crear nada. `.env.example` es solo la plantilla de referencia con las mismas claves.

---

## 5. Archivos clave para empezar a leer (en este orden)

1. **`docker-compose.yml`** — qué contenedores existen, cómo se conectan entre sí (puertos, variables de entorno). Punto de partida para entender la infraestructura.
2. **`api/src/app.js`** — el punto de entrada del backend. En ~25 líneas se ve toda la superficie real de la API: qué rutas están montadas (y cuáles no).
3. **`api/src/models/`** (los 4 archivos + `index.js`) — el esquema de datos real: qué tablas existen y cómo se relacionan (Empleado ↔ Certificacion ↔ Departamento ↔ Usuario), aunque no todas tengan CRUD todavía.
4. **`api/src/controllers/empleadoController.js`** — el único CRUD completo hoy. Sirve de plantilla concreta para cuando se implementen Departamento y Certificacion (mismo patrón de try/catch, manejo de 404/409).
5. **`frontend/src/app/app.routes.ts`** — el mapa de navegación real del frontend. Deja claro, en 20 líneas, qué páginas existen de verdad versus lo que el sidebar sugiere.
6. **`frontend/src/app/core/empleado.service.ts`** — cómo el frontend le habla a la API. Plantilla directa para un futuro `DepartamentoService`/`CertificacionService`.
7. **`frontend/src/app/features/empleados/listado/listado.ts`** — el componente más completo del frontend: filtros reactivos con RxJS, tabla de Material, apertura de diálogo modal y recarga post-creación. Buen ejemplo del patrón a seguir para nuevas vistas de listado.
8. **`frontend/src/app/layout/shell/shell.ts`** (junto con `sidebar/sidebar.html` y `header/header.ts`) — cómo se arma el layout compartido, y por qué el sidebar linkea a rutas que todavía no existen (queda documentado ahí mismo por qué esos links "no van a ningún lado" por ahora).

---

## Cosas que no me quedaron 100% claras del código (dicho explícitamente, no lo asumí)

- El campo `estado` de `Certificacion` tiene default `'vigente'`, y el seed usa además el valor `'vencida'` — pero no hay ningún lugar en el código (backend o frontend) que **calcule** ese estado automáticamente a partir de `fecha_vencimiento`. Asumo que hoy es un valor que se setea a mano al crear el registro (vía seed), no algo derivado dinámicamente, pero no hay código que lo confirme o lo contradiga explícitamente — no existe ningún endpoint de Certificacion todavía para verificarlo en la práctica.
- `AuthService.obtenerToken()` está definido pero no encontré ningún lugar del código que lo llame — queda ahí, sin uso, aparentemente preparado para un futuro interceptor HTTP que todavía no existe.
