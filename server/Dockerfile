# ─── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install server dependencies first (layer cached separately from source)
COPY server/package*.json ./server/
RUN cd server && npm ci

# Copy server source and shared packages
COPY server/ ./server/
COPY packages/ ./packages/

# tsconfig.json includes "../packages/shared/**/*.ts" which resolves correctly
# from WORKDIR /app/server → /app/packages/shared
WORKDIR /app/server
RUN npm run build

# ─── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/server/dist ./dist

ENV NODE_ENV=production

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]
