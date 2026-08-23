# -----------------------------
# Stage 1: Build stage
# -----------------------------
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# -----------------------------
# Stage 2: Production runtime
# -----------------------------
FROM node:24-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist ./dist
COPY drizzle/ ./drizzle/

USER node

EXPOSE 3001

CMD ["node", "dist/server.js"]