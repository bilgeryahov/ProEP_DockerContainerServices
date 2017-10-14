FROM alpine:3.6

# Update
RUN apk add --update nodejs-npm

# Install app dependencies
COPY package.json /src/package.json
RUN cd /src; npm install

# Bundle app source
COPY . /src

EXPOSE  1984
CMD ["node", "/src/server.js"]