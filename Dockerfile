# Etapa 1: Build do aplicativo Next.js
FROM node:21-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN npm install bun -g

RUN bun install --production

COPY . .

RUN rm -rf .next

RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start"]
