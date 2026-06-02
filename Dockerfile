# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY backend-src/package*.json ./
RUN npm install
COPY backend-src/ .
RUN ./node_modules/.bin/prisma generate
RUN npm run build

# ─── Stage 2: Runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# OpenSSL 1.1 — required by Prisma query engine on Alpine
# libssl1.1 is not in Alpine 3.17+ repos, install from Alpine 3.16
RUN apk add --no-cache \
      openssl \
      libssl3 \
 && wget -q -O /tmp/libssl1.1.apk \
      https://dl-cdn.alpinelinux.org/alpine/v3.16/main/x86_64/libssl1.1-1.1.1t-r0.apk \
 && apk add --no-cache --allow-untrusted /tmp/libssl1.1.apk \
 && rm /tmp/libssl1.1.apk

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

USER nestjs

EXPOSE 3001

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/main"]
