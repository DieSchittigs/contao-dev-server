const HTTPServer = require('http-server');
const fs = require('fs');
const httpProxy = require('http-proxy');
const fileExists = require('file-exists');
const chalk = require('chalk');
const resolve = require('path').resolve;

const proxy = httpProxy.createProxyServer({});

function isFile(filePath){
    let isFile = false;
    try{
        isFile = fileExists.sync(filePath)
    } catch(err){}
    return isFile;
}

function route(req, res, rootDir, phpProxyUrl){
    const pathname = req.url.split('?')[0];
    if(req.method != 'GET' || pathname.endsWith('.php') || !isFile(resolve(rootDir + '/' + pathname))){
        console.log(chalk.blue(req.method, req.url));
        return proxy.web(req, res, {
            target: phpProxyUrl,
            changeOrigin: false
        });
    }
    console.log(chalk.gray(req.method, req.url));
    res.emit('next');
}

function startHttpServer(host='127.0.0.1', port=9000, rootDir='./', phpProxyUrl='http://127.0.0.1:9001'){
    const server = HTTPServer.createServer({
        root: rootDir,
        cache: false,
        before: [
            (req, res) => {
                route(req, res, rootDir, phpProxyUrl)
            }
        ]
    }); 
     
    server.listen(port, host, () => {
        console.log(chalk.green('Contao Dev Server available at'));
        console.log(chalk.green('  http://' + host + ':' + port));
        console.log(chalk.gray('Hit CTRL-C to stop the server'));
    });
}

module.exports = startHttpServer;