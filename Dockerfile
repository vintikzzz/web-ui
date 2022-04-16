# Make base node image
FROM node:alpine as base

WORKDIR /app
COPY package.json .
COPY yarn.lock .
COPY patches .

# Make deps image
FROM base as deps
# Install build deps
RUN apk add --no-cache --update build-base python3 git
# Install npm deps with yarn
RUN yarn install --prod

# Make release image
FROM base as release

# # Set logging scope
# ENV DEBUG="webtor:*"

# Copy deps
COPY --from=deps /app/node_modules ./node_modules

# Copy app sources
COPY ui/dist /app/ui/dist
COPY api/dist /app/api/dist

# Expose
EXPOSE 4000

# Set startup script
CMD ["node", "./api/dist/index.js"]
