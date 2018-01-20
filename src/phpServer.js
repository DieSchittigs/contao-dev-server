const spawn = require('child_process').spawn;
const chalk = require('chalk');

function startPhpServer(host='127.0.0.1', port=9001, rootDir='./', router=null, configFile=null, phpExec='php') {
    let args = []
    .concat(['-S', host.concat(':').concat(port)])
    .concat(['-t', rootDir]);
    if(configFile) args = args.concat(['-c', configFile]);
    if(router) args.push(router);

    const serverProc = spawn(phpExec, args);
    
    serverProc.stdout.on('data', function (data) {
      console.log(chalk.green('PHP', data.toString()));
    });
    
    serverProc.stderr.on('data', function (data) {
      console.log(chalk.red('PHP', data.toString()));
    });
    
    serverProc.on('exit', function (code) {
      console.log(chalk.yellow('PHP', 'child process exited with code ' + code.toString()));
    });
}

module.exports = startPhpServer;
