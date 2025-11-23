import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

export const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
  credentialsRequired: true,
  requestProperty: 'auth'
});

export const handleJwtError = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    console.error('JWT Error:', err.message);
    console.error('Auth Header:', req.headers.authorization ? 'Present' : 'Missing');
    console.error('Token Claims:', req.auth);
    return res.status(401).json({ error: 'Unauthorized', details: err.message });
  }
  next(err);
};