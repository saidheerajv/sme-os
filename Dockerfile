# ─── Stage 1: Build everything ───────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install root dependencies (shx, concurrently, etc.)
COPY package*.json ./
RUN npm ci

# Install UI dependencies
COPY ui/package*.json ./ui/
RUN cd ui && npm ci

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

# Copy all source files
COPY ui/ ./ui/
COPY backend/ ./backend/

# Generate the Prisma client for the target platform (linux/musl)
RUN cd backend && npx prisma generate

# Build: compiles UI → backend/public, then compiles NestJS → dist/
RUN npm run build


# ─── Stage 2: Production image ───────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy the Prisma schema (needed by `prisma migrate deploy`)
COPY backend/prisma ./prisma

# Copy the generated Prisma client binaries built for this platform
COPY --from=builder /app/backend/node_modules/.prisma ./node_modules/.prisma

# Add the Prisma CLI so we can run migrations at startup.
# --no-save keeps package.json clean; the binary cache is already in .prisma.
RUN npm install --no-save prisma

# Copy compiled NestJS application and pre-built static assets
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/public ./public

# Drop privileges: run as a non-root user
RUN addgroup -S appgroup \
    && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

# Run pending migrations, then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
