# INSTALL
FROM node:22.16.0-alpine AS jigpuzzle-installer
LABEL jigpuzzle-build-installer=true
WORKDIR /build
COPY package.json package-lock.json ./
COPY ./src/server/package.json ./src/server/package.json
COPY ./src/client/package.json ./src/client/package.json
COPY ./src/shared/package.json ./src/shared/package.json

RUN npm install --omit=dev
RUN npm install -ws --omit=dev
RUN mv ./node_modules /tmp/node_modules_prod
RUN npm install
RUN npm install -ws


# BUILD TYPESCRIPT AND WEBPACK STUFF
FROM jigpuzzle-installer AS jigpuzzle-builder
LABEL jigpuzzle-build-installer=false
LABEL jigpuzzle-build-builder=true
WORKDIR /build
COPY . .

RUN npm run build


# COPY BUILT FILES INTO NEW IMAGE (WITH ORIGINAL SOURCE CODE)
# INCLUDE scripts/ AND db/ FOR RUNTIME MANAGEMENT (DB PATCHES AND VARIOUS CONVENIENCE SCRIPTS)
FROM jigpuzzle-builder AS jigpuzzle-app
LABEL jigpuzzle-build-installer=false
LABEL jigpuzzle-build-builder=false

WORKDIR /app
COPY --from=jigpuzzle-builder /build/dist ./dist
COPY --from=jigpuzzle-builder /build/package.json /build/package-lock.json ./
COPY --from=jigpuzzle-builder /tmp/node_modules_prod ./node_modules

CMD ["npm", "start"]
