FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build --workspace=@imtiaz-mart/shared \
  && npm run generate --workspace=@imtiaz-mart/database \
  && npm run build --workspace=@imtiaz-mart/database \
  && npm run build:api

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/preload-paths.cjs ./apps/api/preload-paths.cjs
COPY --from=build /app/packages/database/prisma ./packages/database/prisma
COPY --from=build /app/packages/database/package.json ./packages/database/package.json
COPY --from=build /app/packages/database/dist ./packages/database/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
EXPOSE 3001
CMD ["npm", "run", "start:prod", "--workspace=@imtiaz-mart/api"]
