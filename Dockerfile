# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy backend package.json first for layer caching
COPY backend-src/package*.json ./

# Install — brings in prisma@5.16.2 (pinned in backend-src/package.json)
RUN npm install

# Copy all backend-src contents into WORKDIR
# Done after npm install so node_modules layer is cached separately
COPY backend-src/ .

# Generate Prisma client using local v5 binary — never npx (pulls latest)
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

CMD ["node", "dist/main"]
