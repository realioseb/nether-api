import createKeccakHash from 'keccak';

export const validate = (str: string) => {
  const re = /^[0-9A-Fa-f]{64}$/;
  return re.test(str);
};

export const findLowerKeccak = (hex: string): [string, string] => {
  try {
    const input = BigInt(`0x${hex}`);

    let hash: string;
    let nounce = -1n;

    // try til memory's enough
    while (true) {
      nounce += 1n;

      // sum
      const sum = input + nounce;

      const hexSum = createKeccakHash('keccak256')
        .update(sum.toString(16), 'hex')
        .digest('hex');

      if (hexSum < hex) {
        hash = hexSum;
        break;
      }

      // subtract
      const subt = input - nounce;

      const hexSubt = createKeccakHash('keccak256')
        .update(subt.toString(16), 'hex')
        .digest('hex');

      if (hexSubt < hex) {
        hash = hexSubt;
        nounce = -nounce;
        break;
      }
    }

    return [nounce.toString(), hash.toString()];
  } catch (err) {
    return ['', ''];
  }
};
