FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* tsconfig.base.json ./
COPY apps/web ./apps/web
COPY packages ./packages
RUN npm install
RUN npm --workspace @terra-watch/web run build

FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/package.json
RUN npm install --omit=dev
COPY --from=build /app/apps/web/dist ./apps/web/dist
EXPOSE 4173
CMD ["npm", "--workspace", "@terra-watch/web", "run", "preview", "--", "--host", "0.0.0.0"]
