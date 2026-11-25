/**
 * Static file server for the Playwright suite (playwright.config.cjs starts
 * it as its webServer). The app fetches each location's climate station
 * (climate/stations/<id>.json + .bin), which a file:// page cannot, so the
 * specs open the app over http for the ISO 52016-1 cooling to run.
 *
 *   node test/static-server.cjs [port]      # serves the repo root, 127.0.0.1
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.argv[2]) || 8771;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".cjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

http
  .createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname
      );
    } catch {
      res.writeHead(400).end("Bad request");
      return;
    }
    if (pathname.endsWith("/")) pathname += "index.html";
    const file = path.join(ROOT, pathname);
    if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    fs.readFile(file, (err, body) => {
      if (err) {
        res.writeHead(404).end("Not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type":
          TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      res.end(body);
    });
  })
  .listen(PORT, "127.0.0.1", () => {
    console.log(`Serving ${ROOT} at http://127.0.0.1:${PORT}`);
  });
