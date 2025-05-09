FROM node:21-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN npm install bun -g

RUN bun install

COPY . .

RUN rm -rf .next

ARG NEXT_PUBLIC_DOMAIN_NAME
ARG NEXT_PUBLIC_REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WORKSPACE_API_URL
ARG HETZNER_S3_REGION
ARG NEXT_PUBLIC_HETZNER_S3_ENDPOINT
ARG HETZNER_S3_ACCESS_KEY_ID
ARG HETZNER_S3_SECRET_ACCESS_KEY
ARG NEXT_PUBLIC_HETZNER_S3_BUCKET_NAME

ENV NEXT_PUBLIC_DOMAIN_NAME=${NEXT_PUBLIC_DOMAIN_NAME}
ENV NEXT_PUBLIC_REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE=${NEXT_PUBLIC_REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WORKSPACE_API_URL=${NEXT_PUBLIC_WORKSPACE_API_URL}
ENV HETZNER_S3_REGION=${HETZNER_S3_REGION}
ENV NEXT_PUBLIC_HETZNER_S3_ENDPOINT=${NEXT_PUBLIC_HETZNER_S3_ENDPOINT}
ENV HETZNER_S3_ACCESS_KEY_ID=${HETZNER_S3_ACCESS_KEY_ID}
ENV HETZNER_S3_SECRET_ACCESS_KEY=${HETZNER_S3_SECRET_ACCESS_KEY}
ENV NEXT_PUBLIC_HETZNER_S3_BUCKET_NAME=${NEXT_PUBLIC_HETZNER_S3_BUCKET_NAME}

RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start"]
