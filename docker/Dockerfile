# Media Literacy — Next.js Multi-stage Dockerfile
# Optimized for Next.js App Router (TypeScript) production builds.

FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# API route modules validate DATABASE_URL while Next.js collects route metadata.
# This build-only placeholder creates no connection and is not copied to runner.
ARG BUILD_DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV DATABASE_URL=${BUILD_DATABASE_URL}
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["npm", "run", "start"]
