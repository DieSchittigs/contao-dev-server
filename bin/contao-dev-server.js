#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');
const argv = require('yargs')
    .usage('Usage: $0 [options]')
    .default('host', '127.0.0.1')
    .default('port', 9000)
    .default('rootDir', './web')
    .default('phpWorkers', 5)
    .default('production', false)
    .default('config', null)
    .default('phpExec', 'php')
    .argv;
const startHttpServer = require('../src/httpServer');
const startPhpServer = require('../src/phpServer');
const RouterContao = require('../src/RouterContao');
const pjson = require(path.join(__dirname, '../package.json'));
const homedir = require('os').homedir();
var fs = require('fs');

if(fs.existsSync(path.join(homedir, '.config/contao-dev-server.json'))){
    Object.assign(
        argv,
        require(
            path.join(homedir, '.config/contao-dev-server.json')
        )
    );
}

console.log('\n', chalk.bgMagenta(' Welcome to Contao Dev Server v' + pjson.version + ' '), '\n');

const rootDir = path.resolve(argv.rootDir);

const phpServer = startPhpServer(
    '127.0.0.1',
    argv.port+1,
    rootDir,
    null,
    argv.config,
    argv.phpExec
);

const contaoProdServer = startPhpServer(
    '127.0.0.1',
    argv.port+2,
    rootDir,
    'router_prod.php',
    argv.config,
    argv.phpExec
);

var contaoServers = [];
for(let i = 3; i <= argv.phpWorkers+2; i++){
    contaoServers.push(startPhpServer(
        '127.0.0.1',
        argv.port+i,
        rootDir,
        argv.production ? 'router_prod.php': 'router_dev.php',
        argv.config,
        argv.phpExec
    ));
}

const contaoRouter = new RouterContao(rootDir, phpServer, contaoProdServer, contaoServers);

startHttpServer(
    argv.host,
    argv.port,
    rootDir,
    (req, res) => contaoRouter.handle(req, res)
)
.then(({ host, port, rootDir })=>{
    console.log(chalk.bgGreen('\n\n', ' Contao Dev Server launched successfully', '\n'));
    console.log(chalk.white('  http://' + host + ':' + port));
    console.log(chalk.white('  http://' + host + ':' + port + '/contao'));
    if(!fs.existsSync(path.join(rootDir, '../app/config/paramters.yml')))
        console.log(chalk.white('  http://' + host + ':' + port + '/contao/install'));
    if(fs.existsSync(path.join(rootDir, 'contao-manager.phar.php')))
        console.log(chalk.white('  http://' + host + ':' + port + '/contao-manager.phar.php'));
    console.log('\n', chalk.gray(' Hit CTRL-C to stop the server'), '\n');
})
.catch(err=>{
    console.error(err);
});
