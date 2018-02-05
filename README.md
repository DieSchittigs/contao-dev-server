# Contao Dev Server

## About
Contao Dev Server is a local development server for Contao 4.x. If you ever worked with Laravel
this project aims to be your `php artisan serve`.

### Why not just `php -S`?
Contao 4 relies heavily on symlinks, the integrated php webserver doesn't like that and bails on some requests.
Contao Dev Server is a thin JS wrapper that utilizes [http-server](https://github.com/indexzero/http-server)
for static resources and [http-proxy](https://github.com/nodejitsu/node-http-proxy) to serve the meat via PHP.

### Screenshots

#### Contao Dev Server serving the Contao backend
![](https://i.imgur.com/GXrB95e.png)

#### Symfony profiler and debugging tools are conveniently activated
![](https://i.imgur.com/xeX2bky.png)

## Prerequisites

- [Node.js](https://nodejs.org/)
- [PHP 7.1+](http://www.php.net/)

## Installation

Install by entering `sudo npm install -g @dieschittigs/contao-dev-server`.

## Usage

Enter your Contao project or start a new one by using our [Yeoman Generator](https://github.com/dieschittigs/yeoman-contao).  
Launch by entering `contao-dev-server`.

### Options

    --help        Show help  
    --version     Show version number  
    --host        "127.0.0.1"  
    --port        9000  
    --rootDir     "./web"  
    --production  false (if true: use app.php)  
    --config      Add your own php.ini, if needed  
    --phpExec     "php"

## Licence

ISC © [Die Schittigs](https://dieschittigs.de)
