# ── Base ───────────────────────────────────────────────────────────────────
FROM oven/bun:1 AS base
WORKDIR /app

# ── Install (layer-cached — only re-runs when package manifests change) ────
FROM base AS install
COPY package.json bun.lock ./
COPY apps/backend/package.json  ./apps/backend/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN bun install --frozen-lockfile

# ── Build ──────────────────────────────────────────────────────────────────
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
# Generate Prisma client for production
RUN cd apps/backend && bunx prisma generate
# Build the React Router frontend (outputs to apps/frontend/build/)
RUN bun run --filter @synchro/frontend build

# ── Release ────────────────────────────────────────────────────────────────
FROM base AS release
COPY --from=install /app/node_modules ./node_modules
COPY --from=build /app/apps/backend  ./apps/backend
COPY --from=build /app/apps/frontend/build ./apps/frontend/build
COPY --from=build /app/packages   ./packages
COPY package.json bun.lock ./

ENV NODE_ENV=production
ENV PORT=3000

USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "run", "apps/backend/src/index.ts"]
