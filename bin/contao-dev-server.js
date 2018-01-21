#!/usr/bin/env node

resolve = require('path').resolve;
const argv = require('yargs')
    .usage('Usage: $0 [options]')
    .default('host', '127.0.0.1')
    .default('port', 9000)
    .default('rootDir', './web')
    .default('production', false)
    .default('config', resolve(__dirname.concat('/../conf/php.ini')))
    .default('phpExec', 'php')
    .argv;
const startHttpServer = require('../src/httpServer');
const startPhpServer = require('../src/phpServer');

startPhpServer(
    '127.0.0.1',
    argv.port+1,
    resolve(argv.rootDir),
    argv.production ? 'app.php': 'app_dev.php',
    argv.config,
    argv.phpExec
);

startHttpServer(
    argv.host,
    argv.port,
    resolve(argv.rootDir),
    'http://127.0.0.1:'.concat(argv.port + 1)
);