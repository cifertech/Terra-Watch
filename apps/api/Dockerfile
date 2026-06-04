FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages ./packages
RUN npm install
RUN npm --workspace @terra-watch/api run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages ./packages
RUN npm install --omit=dev
COPY --from=build /app/apps/api/dist ./apps/api/dist
EXPOSE 8787
CMD ["npm", "--workspace", "@terra-watch/api", "run", "start"]
