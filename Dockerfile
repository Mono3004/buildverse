# Multi-stage Dockerfile for BuildVerse Web & API Stack
FROM node:22-alpine AS base
WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files
COPY . .

# Build Vite client & Nitro SSR bundle
RUN npm run build

# Production Runner Stage
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY --from=base /app/.output ./.output
COPY --from=base /app/backend ./backend

EXPOSE 5173 5000

CMD ["sh", "-c", "node backend/src/server.js & node .output/server/index.mjs"]
