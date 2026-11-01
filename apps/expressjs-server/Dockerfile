# Build stage: install the workspace and compile the server
FROM node:20-alpine AS build
WORKDIR /monorepo

COPY package.json yarn.lock ./
COPY packages/typescript-config ./packages/typescript-config
COPY apps/expressjs-server ./apps/expressjs-server
RUN yarn install --frozen-lockfile
RUN cd apps/expressjs-server && yarn build

# Runtime stage: only what node needs to run dist/index.js
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /monorepo/node_modules /app/node_modules
COPY --from=build /monorepo/apps/expressjs-server/dist /app/dist
COPY --from=build /monorepo/apps/expressjs-server/package.json /app/package.json

EXPOSE 4000
CMD ["node", "dist/index.js"]
