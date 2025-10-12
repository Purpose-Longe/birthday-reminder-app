## Multi-stage Dockerfile
# 1) Build frontend assets
# 2) Build server TypeScript
# 3) Copy server + frontend assets into a minimal runtime image

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
RUN npm run build --if-present || npm run build

FROM node:20-alpine AS build-server
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build:server

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build-server /app/dist ./dist
# Copy built frontend into server dist/public if present
COPY --from=build-frontend /app/dist ./dist/public
ENV PORT=3001
EXPOSE 3001
CMD ["node", "dist/index.js"]
