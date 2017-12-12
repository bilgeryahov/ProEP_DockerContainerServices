### Web-Services for the "Show-Me" app!!
[![Build Status](https://travis-ci.org/bilgeryahov/ProEP_DockerContainerServices.svg?branch=master)](https://travis-ci.org/bilgeryahov/ProEP_DockerContainerServices/)

# Installation
Only need docker

# Run
Just use command:
`docker-compose build && docker-compose up`

# RabbitMQ
Go to 0.0.0.0:15672 with username and password `guest` `guest`

# Cleanup docker
docker rm -f $(docker ps -a -q)

# Delete every Docker image
docker rmi -f $(docker images -q)