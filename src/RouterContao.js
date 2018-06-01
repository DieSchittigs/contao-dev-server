const httpProxy = require('http-proxy');
const chalk = require('chalk');
const fileExists = require('file-exists');
const path = require('path');

function isFile(filePath){
    let isFile = false;
    try{
        isFile = fileExists.sync(filePath)
    } catch(err){}
    return isFile;
}

class RouterContao{
    constructor(rootDir, phpProxyUrl, contaoProdProxy, contaoProxyPool){
        this.rootDir = rootDir;
        this.phpProxyUrl = phpProxyUrl;
        this.contaoProdProxy = contaoProdProxy;
        this.contaoProxyPool = contaoProxyPool;
        this.poolIndex = 0;
        this.proxy = httpProxy.createProxyServer({});
    }
    handle(req, res){
        const pathname = decodeURIComponent(req.url.split('?')[0]);

        // Serve static files
        if(req.method == 'GET' && !pathname.endsWith('.php') && isFile(path.join(this.rootDir, pathname))){
            console.log(chalk.gray(req.method, req.url));
            return res.emit('next');
        }
    
        // Special case: index.html/index.php
        let hasIndexPhp = false;
        if(!isFile(path.join(this.rootDir, pathname))){
            if(isFile(path.join(this.rootDir, pathname + 'index.html'))){
                console.log(chalk.gray(req.method, req.url));
                return res.emit('next');
            }
            if(isFile(path.join(this.rootDir, pathname, 'index.php'))) hasIndexPhp = true;
        }
    
        console.log(chalk.blue(req.method, req.url));
    
        // This is a PHP-script - no routing needed
        if(pathname.endsWith('.php') || pathname.indexOf('.php/') >= 0 || hasIndexPhp){
            return this.proxy.web(req, res, {
                target: this.phpProxyUrl,
                changeOrigin: false
            });
        }
    
        // The backend fails in dev-mode
        if(req.url.indexOf('contao') > -1){
            return this.proxy.web(req, res, {
                target: this.contaoProdProxy,
                changeOrigin: false
            });
        }
    
        // Let Contao do its thing
        if(this.poolIndex >= this.contaoProxyPool.length) this.poolIndex = 0;
        this.proxy.web(req, res, {
            target: this.contaoProxyPool[this.poolIndex],
            changeOrigin: false
        });
        this.poolIndex++;
        return;
    }
}

module.exports = RouterContao;
