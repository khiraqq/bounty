// FILE: lib/session.js
const COOKIE_NAME = 'bounty_session';

/** Encode a session object into a base64url token */
export function encodeSession(data) {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

/** Decode a token back to an object, or null on failure */
export function decodeSession(token) {
  try {
    return JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
