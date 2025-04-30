FROM node:21-alpine AS builder
WORKDIR /app

# Instala o bun e todas as deps (incluindo dev)
COPY package.json bun.lock ./
RUN npm install -g bun
RUN bun install

# Copia o código e gera a build
COPY . .
RUN bun run build

# Cria a imagem final mais enxuta
FROM node:21-alpine AS runner
WORKDIR /app

# Copia tudo do builder
COPY --from=builder /app ./

# Opcional: reinstala só deps de produção para limpar o node_modules
RUN bun install --production

EXPOSE 3000
CMD ["bun", "run", "start"]
