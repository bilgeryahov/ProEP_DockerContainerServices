# Build docker image
docker build -t testjs .
# Run docker image
docker run testjs
# Run docker image with ports exposed
docker run -it -p 9000:9090 testjs
# run docker tests
docker run testjs /bin/sh -c "cd /src; npm test"

# Run build using composer
docker-compose build
# Run using composer 
docker-compose up
# Run in background
docker-compose up -d
# See what is running
docker-compose ps
# Run a single test
docker-compose build && docker-compose up -d && docker run proepdockercontainerservices_dataservice /bin/sh -c "cd /src; npm test"
# Fix eslint errors automaticly
./node_modules/.bin/eslint . --fix