FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma7.config.ts nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN DATABASE_URL=postgresql://build:build@localhost:5432/build?schema=public npx prisma generate
RUN npm run build

FROM build AS migrate

CMD ["npx", "prisma", "migrate", "deploy"]

FROM build AS production-dependencies

RUN npm prune --omit=dev --omit=optional

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
