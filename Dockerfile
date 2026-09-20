# Stage 1: Build Frontend & Install Dependencies
FROM node:22-slim AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source code
COPY . .

# Build Vite static assets
RUN npm run build

# Stage 2: Production Container Image
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

# Copy package files, node_modules, server code, src directory, and built dist folder from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server ./server
COPY --from=builder /app/src ./src
COPY --from=builder /app/dist ./dist

# Expose server port
EXPOSE 10000

# Start production server
CMD ["node", "server/index.js"]
