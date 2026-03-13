# ─── Stage 1: Build the React / Vite frontend ────────────────────────────────
FROM node:20-alpine AS ui-builder

WORKDIR /app/ui
COPY ui/package*.json ./
RUN npm ci
COPY ui/ ./
RUN npm run build


# ─── Stage 2: Build the NestJS backend ───────────────────────────────────────
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./

# Embed the UI build as the static files NestJS will serve
COPY --from=ui-builder /app/ui/dist ./public

# Generate the Prisma client for the target platform (linux/musl)
RUN npx prisma generate

# Compile TypeScript → dist/
RUN npm run build


# ─── Stage 3: Production image ───────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy the Prisma schema (needed by `prisma migrate deploy`)
COPY backend/prisma ./prisma

# Copy the generated Prisma client binaries built for this platform
COPY --from=backend-builder /app/backend/node_modules/.prisma ./node_modules/.prisma

# Add the Prisma CLI so we can run migrations at startup.
# --no-save keeps package.json clean; the binary cache is already in .prisma.
RUN npm install --no-save prisma

# Copy compiled NestJS application and pre-built static assets
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/public ./public

# Drop privileges: run as a non-root user
RUN addgroup -S appgroup \
    && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

# Run pending migrations, then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
