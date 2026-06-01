# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy backend deps first (layer cache)
COPY backend-src/package*.json ./

# Install — gets prisma@5.16.2 pinned in backend-src/package.json
RUN npm install

# Copy all backend source files flat into WORKDIR
COPY backend-src/ .

# Generate Prisma Client — reads schema only, no DB needed at build time
RUN ./node_modules/.bin/prisma generate

# Compile NestJS
RUN npm run build

# ─── Stage 2: Runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

USER nestjs

EXPOSE 3001

# migrate deploy runs at runtime where DATABASE_URL is available
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/main"]
