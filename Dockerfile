# multi-stage Dockerfile for a Vite + React + TypeScript app

# 1) Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Use npm ci when lockfile exists, otherwise fall back to npm install
RUN if [ -f package-lock.json ]; then \
			npm ci --silent; \
		else \
			npm install --silent; \
		fi

# 2) Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept Vite env build args and expose them as ENV so `npm run build` sees them
ARG VITE_APP_API_URL
ARG VITE_APP_API_CABLE_URL
ARG VITE_APP_MS_TAGS_URL
ENV VITE_APP_API_URL=${VITE_APP_API_URL}
ENV VITE_APP_API_CABLE_URL=${VITE_APP_API_CABLE_URL}
ENV VITE_APP_MS_TAGS_URL=${VITE_APP_MS_TAGS_URL}

RUN npm run build --silent

# 3) Production image
FROM nginx:stable-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom nginx config to enable SPA fallback
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
