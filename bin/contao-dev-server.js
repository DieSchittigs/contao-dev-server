#!/usr/bin/env node

resolve = require('path').resolve;
const path = require('path');
const argv = require('yargs')
    .usage('Usage: $0 [options]')
    .default('host', '127.0.0.1')
    .default('port', 9000)
    .default('rootDir', './web')
    .default('phpWorkers', 5)
    .default('production', false)
    .default('config', resolve(path.join(__dirname, '/../conf/php.ini')))
    .default('phpExec', 'php')
    .argv;
const startHttpServer = require('../src/httpServer');
const startPhpServer = require('../src/phpServer');
const RouterContao = require('../src/RouterContao');

const rootDir = resolve(argv.rootDir);

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
    'app.php',
    argv.config,
    argv.phpExec
);

var contaoServers = [];
for(let i = 3; i <= argv.phpWorkers+2; i++){
    contaoServers.push(startPhpServer(
        '127.0.0.1',
        argv.port+i,
        rootDir,
        argv.production ? 'app.php': 'app_dev.php',
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
);
