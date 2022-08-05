import http from 'http';
import url from 'url';
import createKeccakHash from 'keccak';

const hostname = 'localhost';
const port = 3000;

const validate = (str) => {
  const re = /^[0-9A-Fa-f]{64}$/;
  return re.test(str);
};

const server = http.createServer((req, res) => {
  // global content type
  res.setHeader('Content-Type', 'application/json');

  const queryObject = url.parse(req.url, true).query;

  // validate
  if (
    typeof queryObject !== 'object' ||
    !queryObject.hex ||
    !validate(queryObject.hex)
  ) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'invalid-hex' }));
    return;
  }

  const input = BigInt(`0x${queryObject.hex}`);
  let nounce: number;
  let hash: string;

  for (let i = 0; i <= Number.MAX_SAFE_INTEGER; i++) {
    const int = BigInt(i);
    const sum = input + int;
    const hexVal = createKeccakHash('keccak256')
      .update(sum.toString(16), 'hex')
      .digest('hex');

    if (hexVal < queryObject.hex) {
      nounce = i;
      hash = hexVal;
      break;
    }
  }

  res.statusCode = 200;
  res.end(JSON.stringify({ hash, nounce }));
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
