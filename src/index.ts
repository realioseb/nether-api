import http from 'http';
import url from 'url';
import createKeccakHash from 'keccak';
import dotenv from 'dotenv';

dotenv.config();

const hostname = process.env.HOST || 'localhost';
const port = parseInt(process.env.PORT) || 4000;

const validate = (str) => {
  const re = /^[0-9A-Fa-f]{64}$/;
  return re.test(str);
};

const server = http.createServer((req, res) => {
  // set headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const queryObject = url.parse(req.url, true).query;

  // validate
  if (
    typeof queryObject !== 'object' ||
    !queryObject.hex ||
    !validate(queryObject.hex)
  ) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'invalid hex' }));
    return;
  }

  const input = BigInt(`0x${queryObject.hex}`);
  let nounce: number;
  let hash: string;

  for (let i = 0; i <= Number.MAX_SAFE_INTEGER; i++) {
    const sum = input + BigInt(i);

    const hexVal = createKeccakHash('keccak256')
      .update(sum.toString(16), 'hex')
      .digest('hex');

    if (hexVal < queryObject.hex) {
      nounce = i;
      hash = hexVal;
      break;
    }
  }

  if (!hash) {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "lower hash wasn't found" }));
    return;
  }

  res.statusCode = 200;
  res.end(JSON.stringify({ hash, nounce }));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
