# ------------------------------
# STEP 1 : Build
# ------------------------------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build


# ------------------------------
# STEP 2 : Run
# ------------------------------
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

COPY --from=builder /usr/src/app/dist ./dist

CMD ["node", "dist/main.js"]
