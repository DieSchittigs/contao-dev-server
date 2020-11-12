#!/usr/bin/env node

process.stdin.resume();

const path = require("path");
const chalk = require("chalk");
const startHttpServer = require("./src/httpServer");
const startPhpServer = require("./src/phpServer");
const RouterContao = require("./src/RouterContao");
const pjson = require(path.join(__dirname, "./package.json"));
const homedir = require("os").homedir();
const fs = require("fs");

const defaultArgs = {
    host: "127.0.0.1",
    port: 9000,
    rootDir: "./web",
    phpWorkers: 5,
    production: false,
    config: null,
    phpExec: "php"
};

if (fs.existsSync(path.join(homedir, ".config/contao-dev-server.json"))) {
    Object.assign(
        defaultArgs,
        require(path.join(homedir, ".config/contao-dev-server.json"))
    );
}

let argv = require("yargs")
    .usage("Usage: $0 [options]")
    .default("host", defaultArgs.host)
    .default("port", defaultArgs.port)
    .default("rootDir", defaultArgs.rootDir)
    .default("phpWorkers", defaultArgs.phpWorkers)
    .default("production", defaultArgs.production)
    .default("config", defaultArgs.config)
    .default("phpExec", defaultArgs.php).argv;

console.log(
    "\n",
    chalk.bgMagenta(" Welcome to Contao Dev Server v" + pjson.version + " "),
    "\n"
);

const dotEnv = `APP_ENV=${argv.production ? "prod" : "dev"}\n`;
let createdDotEnv = false;

if (fs.existsSync("./composer.json")) {
    const cjson = require(path.resolve("./composer.json"));
    if (
        cjson.require["contao/manager-bundle"] &&
        cjson.require["contao/manager-bundle"].replace(/[^0-9]+/g, "") >= 48
    ) {
        if (!fs.existsSync(".env")) {
            console.log(
                chalk.yellow(
                    " Contao 4.8+ detected. Adding .env file to enable debug mode. "
                ),
                "\n"
            );
            fs.writeFileSync(".env", dotEnv);
            createdDotEnv = true;
        } else {
            console.log(
                chalk.yellow(
                    " Contao 4.8+ detected. Please consider adding APP_ENV=dev to your .env file "
                ),
                "\n * https://docs.contao.org/manual/en/system/debug-mode/#contao-4-8-and-up",
                "\n"
            );
        }
    }
}

const rootDir = path.resolve(argv.rootDir);

const phpServer = startPhpServer(
    "127.0.0.1",
    argv.port + 1,
    rootDir,
    null,
    argv.config,
    argv.phpExec
);

var contaoServers = [];
for (let i = 2; i < argv.phpWorkers; i++) {
    contaoServers.push(
        startPhpServer(
            "127.0.0.1",
            argv.port + i,
            rootDir,
            argv.production ? "router_prod.php" : "router_dev.php",
            argv.config,
            argv.phpExec
        )
    );
}

const contaoRouter = new RouterContao(
    rootDir,
    phpServer.url,
    contaoServers.map(server => {
        return server.url;
    })
);

startHttpServer(argv.host, argv.port, rootDir, (req, res) =>
    contaoRouter.handle(req, res)
)
    .then(({ host, port, rootDir }) => {
        console.log(
            "\n\n",
            chalk.bgMagenta(" Contao Dev Server launched successfully", "\n")
        );
        if (!fs.existsSync(path.join(rootDir, "../config/parameters.yml")))
            console.log(
                chalk.white(
                    " * Install:\thttp://" +
                        host +
                        ":" +
                        port +
                        "/contao/install"
                )
            );
        console.log(chalk.white(" * Frontend:\thttp://" + host + ":" + port));
        console.log(
            chalk.white(" * Backend:\thttp://" + host + ":" + port + "/contao")
        );
        if (fs.existsSync(path.join(rootDir, "contao-manager.phar.php")))
            console.log(
                chalk.white(
                    " * Manager:\thttp://" +
                        host +
                        ":" +
                        port +
                        "/contao-manager.phar.php"
                )
            );
        console.log("\n", chalk.gray(" Hit CTRL-C to stop the server"), "\n");
    })
    .catch(err => {
        console.error(err);
    });

function exitHandler(err) {
    if (err && err.stack) console.error("\n", chalk.red(err.stack), "\n");
    phpServer.proc.kill();
    contaoServers.forEach(server => {
        server.proc.kill();
    });
    if (createdDotEnv && fs.readFileSync(".env").toString() === dotEnv) {
        fs.unlinkSync(".env");
        createdDotEnv = false;
        console.log("\n", chalk.yellow(" Removed temporary .env file "), "\n");
    }
    process.exit();
}

process.on("exit", exitHandler);
process.on("SIGINT", exitHandler);
process.on("SIGUSR1", exitHandler);
process.on("SIGUSR2", exitHandler);
process.on("uncaughtException", exitHandler);
