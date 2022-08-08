import http from 'http';
import url from 'url';
import dotenv from 'dotenv';
import { findLowerKeccak, validate } from './utils';

dotenv.config();

const hostname = process.env.HOST || 'localhost';
const port = parseInt(process.env.PORT) || 4000;

const server = http.createServer((req, res) => {
  // set headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const queryObject = url.parse(req.url, true).query;

  // validate
  if (
    typeof queryObject !== 'object' ||
    typeof queryObject.hex !== 'string' ||
    !validate(queryObject.hex)
  ) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Invalid hex' }));
    return;
  }

  const [nounce, hash] = findLowerKeccak(queryObject.hex);

  if (!hash) {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Unable to find a lower hash' }));
    return;
  }

  res.statusCode = 200;
  res.end(JSON.stringify({ hash, nounce }));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
