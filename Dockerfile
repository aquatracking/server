# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies
# this will cache them and speed up future builds
FROM base AS install
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# copy production dependencies and source code into final image
FROM install AS release
COPY src ./src

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "start" ]
