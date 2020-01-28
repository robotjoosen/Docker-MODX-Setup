# MODX Docker setup
This is the default docker-modx setup for projects.

## Setup guide
This guide is designed to be used as a local development environment.

The following versions are being used for this LEMP setup

| Name | Version | Comment
| --- | ---: | ---
| PHP | 7.2 | Currently most used version
| MySQL | 5.7 | Lighter on memory than version 8
| NGINX | latest | Alpine Linux based, small footprint 

### Docker installation
First you need to install Docker for [Mac](https://docs.docker.com/v17.12/docker-for-mac/install/) of [Windows](https://docs.docker.com/v17.12/docker-for-windows/install/).. Depended on your system.
After you've completed the installation start Docker and continue this guide.

### Local domain redirect with NGINX Proxy
Unfortunately this is not a one-click-install so you have to do some stuff first. To make things easier, and more important look nicer, we make use of a proxy for domain redirecting.
In this case we we'll be using [nginx-proxy by JWilder](https://github.com/jwilder/nginx-proxy).

Installation can be done by the following command:
```zsh
➜ docker run -d -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock:ro jwilder/nginx-proxy
```

### Add domain name to hosts file
Now we've completed the installation we need to put in the domain name in our hosts file. 
This can be done with the following command: 
```zsh
➜ sudo nano /etc/hosts
```

Add the following line to your hosts file. Don't forget to change local.domain.tld to your preferred domein name. 
```text
127.0.0.1   local.domain.tld
```

### Setting up environment files
Now we are ready to setup our environment files. Copy sample.db.env and sample.env and remove the word sample.
This can be done with the following command:
```zsh
➜ cp sample.db.env .db.env
➜ cp sample.env .env
```

Now open both files and update the fields to your settings. Even though it is a local development server
i advice you to use good passwords. You'll be exposing your database to your network later on.

### Docker containers bouwen
Now its time to build your docker containers! Use the following command to start the magic:
```zsh
➜ docker-compose up -d
```

## Install MODX
If everything goes right you'll have 3 docker containers named php-fpm, webserver, and mysql. 
Prefixed with your unique container prefix. 

### Gitify time!
Gitify is installed by default within the PHP container. To make use of Gitify we CLI into the PHP container 
```zsh
➜ docker exec -it docker-container-name /bin/bash
```  

When you have access you can run Gitify modx:install.
```zsh
➜ cd public_html
➜ /opt/Gitify/Gitify modx:install
```
__Small side note: when asked for the database hostname you need to enter `mysql:3306`.__

## Daily usage

### Docker
When using docker you need to start Nginx proxy. Then start your docker contains with docker-compose.

| command | description
| --- | ---
| `docker start nginx-proxy` | Start Nginx proxy, only needed when you've stopped it.
| `docker-compose start` | Start your containers
| `docker-compose stop` | Stop containers when you are done

### Gulp
To make my life easier i use Gulp to compile SCSS and JS. But i also use it to clear MODX cache 
and backup the entire website with Gitify. 

| command | description
| --- | ---
| `gulp` | Listen to default theme, use --theme to select different theme
| `gulp build` | Compile Javascript and SCSS in your theme folder
| `gulp backup` | Backup entire website with Gitify backup
| `gulp refresh` | Clear MODX cache
| `gulp --tasks` | Show all tasks