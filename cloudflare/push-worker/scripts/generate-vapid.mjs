import { generateKeyPairSync } from 'node:crypto';

const encodeBase64Url = (buffer) => Buffer.from(buffer).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const { publicKey, privateKey } = generateKeyPairSync('ec', {
  namedCurve: 'prime256v1',
});

const publicJwk = publicKey.export({ format: 'jwk' });
const privateJwk = privateKey.export({ format: 'jwk' });
const publicBytes = Buffer.concat([
  Buffer.from([4]),
  Buffer.from(publicJwk.x, 'base64url'),
  Buffer.from(publicJwk.y, 'base64url'),
]);
const privateBytes = Buffer.from(privateJwk.d, 'base64url');

console.log(JSON.stringify({
  publicKey: encodeBase64Url(publicBytes),
  privateKey: encodeBase64Url(privateBytes),
}, null, 2));
