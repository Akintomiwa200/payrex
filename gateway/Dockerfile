FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json tsconfig.json tsconfig.build.json nest-cli.json ./
RUN npm ci
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system app && adduser --system --ingroup app app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
ENV NODE_ENV=production
USER app
EXPOSE 8080
CMD ["node", "dist/main"]
