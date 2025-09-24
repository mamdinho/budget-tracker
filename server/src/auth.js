import { createRemoteJWKSet, jwtVerify } from 'jose';
import 'dotenv/config';

const { COGNITO_REGION, COGNITO_USER_POOL_ID, COGNITO_APP_CLIENT_ID } = process.env;

if (!COGNITO_REGION || !COGNITO_USER_POOL_ID || !COGNITO_APP_CLIENT_ID) {
  throw new Error('Missing Cognito env vars');
}

const ISSUER = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`;
const JWKS = createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`));

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: ISSUER,
    // don't set audience here; access tokens don't have aud
  });

  // Ensure this is a Cognito token for our client
  if (payload.token_use === 'id') {
    if (payload.aud !== COGNITO_APP_CLIENT_ID) {
      throw new Error('Invalid audience for ID token');
    }
  } else if (payload.token_use === 'access') {
    if (payload.client_id !== COGNITO_APP_CLIENT_ID) {
      throw new Error('Invalid client for Access token');
    }
  } else {
    throw new Error('Invalid token_use');
  }

  // Normalize a "user" object
  return {
    sub: payload.sub,
    email: payload.email || null,
    username: payload['cognito:username'] || null,
    token_use: payload.token_use,
    scopes: payload.scope ? String(payload.scope).split(' ') : []
  };
}

export function authRequired() {
  return async (req, res, next) => {
    try {
      const hdr = req.headers.authorization || '';
      const [, token] = hdr.split(' ');
      if (!token) return res.status(401).json({ error: 'Missing Bearer token' });

      req.user = await verifyToken(token);
      next();
    } catch (e) {
      return res.status(401).json({ error: 'Unauthorized', detail: e.message });
    }
  };
}
