FROM node:22-alpine AS base

ARG ENV_FILE

RUN corepack enable
WORKDIR /app

ENV CI=true
ENV HUSKY=0
ENV PNPM_DISABLE_PREPARE_SCRIPT=1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc .npmrc

RUN corepack prepare pnpm@11.0.8 --activate

RUN pnpm install --frozen-lockfile

COPY . .

# copy env file into container
COPY ${ENV_FILE} .env

RUN pnpm build && pnpm prune --prod --ignore-scripts


FROM node:22-alpine AS runner

RUN addgroup -S nextjs \
  && adduser -S nextjs -G nextjs

WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/.env .env

COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/.next ./build
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/next.config.js ./next.config.js
COPY --from=base /app/next-logger.config.js ./next-logger.config.js

# COPY leaves /app owned by root; Next may write under .next/cache as nextjs.
RUN chown -R nextjs:nextjs /app

USER nextjs
EXPOSE 3000

# Run Next directly so pnpm never runs install at boot (would need .npmrc auth for private pkgs).
CMD ["node", "node_modules/next/dist/bin/next", "start"]
