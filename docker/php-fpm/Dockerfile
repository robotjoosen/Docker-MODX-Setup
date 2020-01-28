FROM phpdockerio/php72-fpm:latest

WORKDIR "/application"

# Fix debconf warnings upon build
ARG DEBIAN_FRONTEND=noninteractive

# Install selected extensions and other stuff
RUN apt-get update \
    && apt-get -y --no-install-recommends install php7.2-mysql php7.2-bcmath php7.2-bz2 php7.2-gd php-imagick php7.2-soap php-yaml vim \
    && apt-get clean; rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/doc/*

# Install git
RUN apt-get update \
    && apt-get -y install git \
    && apt-get clean; rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/doc/*

COPY --from=composer /usr/bin/composer /usr/bin/composer
RUN cd /opt \
    && git clone https://github.com/modmore/Gitify.git Gitify \
    && cd Gitify \
    && composer install \
    && chmod +x Gitify