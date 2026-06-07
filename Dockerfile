# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the frontend and backend bundle
RUN npm run build

# Stage 2: Serve the application
FROM node:20-slim AS runtime

WORKDIR /app

# Create necessary environment definition
ENV NODE_ENV=production
ENV PORT=3000

# Copy built artifacts from the builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
