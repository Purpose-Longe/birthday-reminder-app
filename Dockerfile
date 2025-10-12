## Multi-stage Dockerfile
# 1) Build frontend assets
# 2) Build server TypeScript
# 3) Copy server + frontend assets into a minimal runtime image

ARG VITE_API_URL
ARG FRONTEND_URL
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --silent

FROM node:20-alpine AS build-frontend
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY index.html ./
COPY tsconfig.app.json ./
COPY vite.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build --if-present || npm run build

FROM node:20-alpine AS build-server
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build:server
# Remove devDependencies to keep a minimal set of production dependencies for runtime
RUN npm prune --production || true

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build-server /app/dist ./dist
# Copy built frontend into server dist/public if present
COPY --from=build-frontend /app/dist ./dist/public
# Frontend public URL for runtime (used for CORS and logging)
ARG FRONTEND_URL
ENV APP_BASE_URL=$FRONTEND_URL
ENV PORT=3001
# Ensure runtime has package.json (for ESM type) and production runtime dependencies
COPY --from=build-server /app/package.json ./package.json
COPY --from=build-server /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/index.js"]
