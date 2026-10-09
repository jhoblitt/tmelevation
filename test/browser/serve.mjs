// A static file server for the browser tests, on 127.0.0.1 and an ephemeral
// port. A query string is ignored when mapping a URL to a file, so an
// artifact's ?v= URLs resolve. Paths in fail404 answer 404, and override
// maps a path to a replacement body (to inject a broken module); both match
// the decoded path without its query, e.g. '/js/flight.js'.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
};

export function serve(dir, { fail404 = [], override = {} } = {}) {
  const root = resolve(dir);
  const requests = [];
  const server = createServer(async (request, response) => {
    let path = new URL(request.url, 'http://localhost').pathname;
    try {
      path = decodeURIComponent(path);
    } catch {
      // A malformed escape cannot name a file; it falls through to 404.
    }
    if (path.endsWith('/')) {
      path += 'index.html';
    }
    const record = { path, status: 0 };
    requests.push(record);
    const reply = (status, body, type = 'text/plain; charset=utf-8') => {
      record.status = status;
      response.writeHead(status, { 'content-type': type });
      response.end(body);
    };
    const type = TYPES[extname(path)] ?? 'application/octet-stream';
    if (fail404.includes(path)) {
      reply(404, 'not found');
      return;
    }
    if (Object.hasOwn(override, path)) {
      reply(200, override[path], type);
      return;
    }
    const file = join(root, path);
    if (!file.startsWith(root + sep)) {
      reply(404, 'not found');
      return;
    }
    try {
      reply(200, await readFile(file), type);
    } catch {
      reply(404, 'not found');
    }
  });
  return new Promise((done, fail) => {
    server.once('error', fail);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      done({
        url: `http://127.0.0.1:${port}`,
        requests,
        close: () =>
          new Promise((closed) => {
            server.close(() => closed());
            server.closeAllConnections();
          }),
      });
    });
  });
}
