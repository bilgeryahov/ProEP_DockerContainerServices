FROM alpine:3.6

# Update
RUN apk add --update nodejs-npm

# Install app dependencies
COPY package.json /src/package.json
RUN cd /src; npm install


# Bundle app source
COPY . /src

EXPOSE  1984
HEALTHCHECK CMD wget -q -t 1 --spider http://localhost:1984 || exit 1
CMD ["./src/wait-for-it.sh", "postgresql:5432", "--", "/src/node_modules/.bin/babel-node", "/src/server.js"]