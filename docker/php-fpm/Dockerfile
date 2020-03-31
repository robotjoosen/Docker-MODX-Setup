FROM phpdockerio/php74-fpm:latest

WORKDIR "/application"

# Fix debconf warnings upon build
ARG DEBIAN_FRONTEND=noninteractive

# install selected extensions and other stuff
RUN apt-get update && apt-get -y --no-install-recommends install php7.4-mysql php7.4-bcmath php7.4-bz2 php7.4-gd php-imagick php7.4-soap php-yaml \
    && apt-get clean; rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/doc/*

# install vim
RUN apt-get clean && apt-get update && apt-get install -y vim

# install git
RUN apt-get update && apt-get -y install git \
    && apt-get clean; rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/doc/*

# install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer

RUN cd /opt \
    && git clone https://github.com/modmore/Gitify.git Gitify \
    && cd Gitify \
    && composer install \
    && chmod +x Gitify