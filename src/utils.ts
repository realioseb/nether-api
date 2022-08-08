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
      const sum = input + nounce;

      const hexVal = createKeccakHash('keccak256')
        .update(sum.toString(16), 'hex')
        .digest('hex');

      if (hexVal < hex) {
        hash = hexVal;
        break;
      }
    }

    return [nounce.toString(), hash.toString()];
  } catch (err) {
    return ['', ''];
  }
};
