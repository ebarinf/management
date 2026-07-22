# Etapa 1: build de la app Angular
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: artefacto listo para nginx.
# Este Dockerfile no se ejecuta como servicio en el compose (el servicio
# "nginx" es quien sirve la app). Esta etapa solo deja el build de Angular
# en /usr/share/nginx/html para copiarlo al contenedor nginx/ en el paso
# de integración (COPY --from=frontend /usr/share/nginx/html ...).
FROM nginx:alpine AS export

COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
