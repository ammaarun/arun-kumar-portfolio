# Stage 1: Build Frontend & Install Dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy full application codebase
COPY . .

# Build Vite static assets
RUN npm run build

# Stage 2: Production Lightweight Image
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy package files and install production-only node_modules
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server code, database data, and built dist folder from builder stage
COPY --from=builder /app/server ./server
COPY --from=builder /app/dist ./dist

# Expose server port
EXPOSE 5000

# Health check command
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start production server
CMD ["node", "server/index.js"]
