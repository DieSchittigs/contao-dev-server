const HTTPServer = require('http-server');
const chalk = require('chalk');

function startHttpServer(host='127.0.0.1', port=9000, rootDir='./', routerFunc = (req,res)=>{ res.next }){
    const server = HTTPServer.createServer({
        root: rootDir,
        cache: true,
        before: [ routerFunc ]
    }); 
     
    server.listen(port, host, () => {
        console.log(chalk.green('Listening at'));
        console.log(chalk.green('  http://' + host + ':' + port));
        console.log(chalk.gray('Hit CTRL-C to stop the server'));
    });
}

module.exports = startHttpServer;
