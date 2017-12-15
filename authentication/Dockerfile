FROM alpine:3.6

# Update
RUN apk add --update nodejs-npm

# Install app dependencies
COPY package.json /src/package.json
RUN cd /src; npm install

# Bundle app source
COPY . /src

EXPOSE  9000
HEALTHCHECK CMD curl --fail http://localhost:9000 || exit 1
CMD ["/src/node_modules/.bin/babel-node", "/src/server.js"]