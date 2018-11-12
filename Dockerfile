#------------------------------------------------------------------------
# Build image
#
# A linux container to build the other linux containers.
#
#  This is required because the PhantomJS node module includes native
#  code so running `npm install` on a non-linux machine result in
#  the node_module having the wrong native binary format.
#
#  It's also a good practice anyway because it means the entire
#  build and deployment process can run on any machine with docker.

FROM node:8-alpine AS build

RUN \
    apk add --no-cache \
        git \
   ;

WORKDIR /carli

# *both* of these are only needed by browserClients, but gave up trying to de-tangle the monolith
RUN npm install -g grunt-cli
RUN npm install -g sass

COPY ./package.json ./install-dependencies.sh ./Gruntfile.js ./
COPY ./bin/package.json ./bin/
COPY ./CARLI/package.json ./CARLI/Gruntfile.js ./CARLI/
COPY ./config/package.json ./config/Gruntfile.js ./config/
COPY ./db/package.json ./db/
COPY ./grunt/Gruntfile.js ./grunt/
COPY ./middleware/package.json ./middleware/Gruntfile.js ./middleware/
COPY ./schemas/browser/package.json ./schemas/browser/bower.json ./schemas/browser/

RUN ./install-dependencies.sh

COPY ./bin ./bin
COPY ./CARLI ./CARLI
COPY ./config ./config
COPY ./db ./db
COPY ./grunt ./grunt
COPY ./middleware ./middleware
COPY ./schemas ./schemas


#------------------------------------------------------------------------
# Browser Clients Build
FROM build AS build-browser-clients

WORKDIR /carli

COPY ./browserClient/package.json ./browserClient/bower.json ./browserClient/Gruntfile.js ./browserClient/
RUN ./install-dependencies.sh

COPY ./browserClient ./browserClient
RUN grunt subdir-grunt:browserClient:compile

#------------------------------------------------------------------------
# Browser Clients Runtime
FROM nginx:1.15.2-alpine AS browser-clients

COPY ./docker/nginx.conf.prod /etc/nginx/nginx.conf
COPY --from=build-browser-clients /carli/browserClient/build /usr/share/nginx/html/


#------------------------------------------------------------------------
# Middleware Runtime
FROM node:8-alpine AS middleware

WORKDIR /carli
COPY --from=build /carli/CARLI /carli/CARLI
COPY --from=build /carli/config /carli/config
COPY --from=build /carli/db /carli/db
COPY --from=build /carli/middleware /carli/middleware
COPY --from=build /carli/schemas /carli/schemas

EXPOSE 3000

CMD ["node", "middleware/index.js"]
