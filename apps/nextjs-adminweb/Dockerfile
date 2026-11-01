# Build stage: NEXT_PUBLIC_* is inlined at build time, so it must be a build arg
FROM node:20-alpine AS build
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
WORKDIR /monorepo

COPY package.json yarn.lock ./
COPY packages/typescript-config ./packages/typescript-config
COPY apps/nextjs-adminweb ./apps/nextjs-adminweb
RUN yarn install --frozen-lockfile
RUN cd apps/nextjs-adminweb && yarn build

# Runtime stage: serve the prebuilt Next.js app
FROM node:20-alpine
WORKDIR /app

COPY --from=build /monorepo/node_modules /app/node_modules
COPY --from=build /monorepo/apps/nextjs-adminweb/.next /app/.next
COPY --from=build /monorepo/apps/nextjs-adminweb/package.json /app/package.json
COPY --from=build /monorepo/apps/nextjs-adminweb/next.config.js /app/next.config.js

EXPOSE 3000
CMD ["npx", "next", "start"]
