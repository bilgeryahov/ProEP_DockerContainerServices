FROM ubuntu:trusty

ENV DEBIAN_FRONTEND noninteractive
ENV PATH $PATH:/usr/local/nginx/sbin

EXPOSE 1984
EXPOSE 1776

# create directories
RUN mkdir /src /config /logs

RUN apt-get update && \
  apt-get upgrade -y && \
  apt-get clean && \
  apt-get install -y --no-install-recommends build-essential \
  wget software-properties-common && \
  apt-get install -y --no-install-recommends libpcre3-dev \
  zlib1g-dev libssl-dev wget && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /src

RUN wget http://nginx.org/download/nginx-1.10.1.tar.gz && \
  tar -xf nginx-1.10.1.tar.gz && \
  rm nginx-1.10.1.tar.gz && \
  wget https://github.com/sergey-dryabzhinsky/nginx-rtmp-module/archive/v1.1.7.10.tar.gz && \
  tar -xf v1.1.7.10.tar.gz && \
  rm v1.1.7.10.tar.gz

# compile nginx
WORKDIR /src/nginx-1.10.1
RUN ./configure --add-module=/src/nginx-rtmp-module-1.1.7.10 --with-file-aio \
  --conf-path=/config/nginx.conf \
  --error-log-path=/logs/error.log \
  --http-log-path=/logs/access.log && \
  make -j 1 && sudo make install

ADD nginx.conf /config/nginx.conf

WORKDIR /
CMD "nginx"