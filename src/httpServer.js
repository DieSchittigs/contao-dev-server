const HTTPServer = require("http-server");
const chalk = require("chalk");

function startHttpServer(
    host = "127.0.0.1",
    port = 9000,
    rootDir = "./",
    routerFunc = (req, res) => {
        res.next;
    }
) {
    return new Promise((resolve, reject) => {
        const server = HTTPServer.createServer({
            root: rootDir,
            cache: true,
            before: [routerFunc],
        });
        try {
            server.listen(port, host, () => {
                resolve({ host, port, rootDir });
            });
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = startHttpServer;
