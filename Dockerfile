# Stage 1: Build Frontend (React / Vite)
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build Backend (Express / TypeScript)
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies for server
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Copy built server files
COPY --from=server-builder /app/server/dist ./dist

# Copy built client static assets
COPY --from=client-builder /app/client/dist /app/client/dist

# Ensure upload directory exists
RUN mkdir -p /app/server/uploads

EXPOSE 8080

CMD ["node", "dist/index.js"]
