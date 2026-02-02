# 1) Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# 2) Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Arguments (Vite precisa disso no momento do build)
ARG VITE_APP_API_URL
ARG VITE_APP_API_CABLE_URL
ARG VITE_APP_MS_TAGS_URL
ENV VITE_APP_API_URL=${VITE_APP_API_URL}
ENV VITE_APP_API_CABLE_URL=${VITE_APP_API_CABLE_URL}
ENV VITE_APP_MS_TAGS_URL=${VITE_APP_MS_TAGS_URL}

RUN npm run build

# 3) Production image
FROM nginx:alpine AS production

# Copia o build do React
COPY --from=builder /app/dist /usr/share/nginx/html

# A CORREÇÃO: Remove a config padrão e copia a sua personalizada
RUN rm /etc/nginx/conf.d/default.conf
# Estou assumindo que você criará o arquivo 'nginx.conf' na raiz do projeto
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]