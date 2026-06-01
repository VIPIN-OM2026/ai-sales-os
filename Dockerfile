# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy backend package files — NOT root (which is the React/Vite frontend)
COPY backend-src/package*.json ./
COPY backend-src/prisma ./prisma
COPY backend-src/tsconfig*.json ./
COPY backend-src/nest-cli.json ./
COPY backend-src/src ./src

# Install deps — this brings in prisma@5.16.2 from backend-src/package.json
RUN npm install

# Use local prisma binary (v5) — never npx which pulls latest (v7+)
RUN ./node_modules/.bin/prisma generate

# Build NestJS
RUN npm run build

# ─── Stage 2: Runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nestjs

# Copy only what's needed to run
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]
