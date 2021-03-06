const spawn = require("child_process").spawn;
const chalk = require("chalk");
const path = require("path");

function startPhpServer(
    host = "127.0.0.1",
    port = 9001,
    rootDir = "./",
    router = null,
    configFile = null,
    phpExec = "php"
) {
    let args = []
        .concat(["-S", host.concat(":").concat(port)])
        .concat(["-d", "display_errors=on"])
        .concat(["-d", "open_basedir=/"])
        .concat(["-d", "upload_max_filesize=1G"])
        .concat(["-d", "post_max_size=1G"])
        .concat(["-d", "memory_limit=512M"])
        .concat([
            "-d",
            "error_log=".concat(path.resolve("contao-dev-server-error.log"))
        ])
        .concat(["-t", rootDir]);
    if (configFile) args = args.concat(["-c", configFile]);
    if (router) args.push(path.join(__dirname, router));

    const serverProc = spawn(phpExec, args);

    serverProc.stdout.on("data", function(data) {
        const line = data.toString().trim();
        if (!line) return;
        console.log(chalk.blue("PHP", line));
    });

    serverProc.stderr.on("data", function(data) {
        const line = data.toString().trim();
        if (!line) return;
        console.log(chalk.blueBright("PHP", line));
    });

    serverProc.on("exit", function(code) {
        console.log(
            chalk[code == 0 ? "green" : "yellow"](
                "PHP",
                "child process exited with code " + code.toString()
            )
        );
    });
    console.log(chalk.green("PHP instance spawned at", host + ":" + port));
    return { proc: serverProc, url: "http://" + host + ":" + port };
}

module.exports = startPhpServer;
