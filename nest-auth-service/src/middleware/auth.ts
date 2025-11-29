import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import axios, { AxiosResponse } from 'axios';
import NodeCache, { Options } from 'node-cache';
import { env } from '../../config/env';

const options: Options = { stdTTL: 3600 };
const cache = new NodeCache(options);

interface PublicKeyResponse {
  publicKey?: string;
  publicKeyPem?: string;
  public_key?: string;
}

async function getPublicKey(): Promise<string> {
  const cached = cache.get<string>('auth_pub');
  if (cached) return cached;

  const res: AxiosResponse<PublicKeyResponse> = await axios.get(
    `${env.authServiceUrl}/auth/public-key`,
  );

  const key =
    res.data.publicKey || res.data.publicKeyPem || res.data.public_key;
  if (!key) throw new Error('Public key missing from auth service');

  cache.set('auth_pub', key);
  return key;
}

// 👉 Safe type guard
function isMyPayload(decoded: string | JwtPayload): decoded is MyPayload {
  return typeof decoded === 'object' && 'email' in decoded && 'sub' in decoded;
}

interface MyPayload extends JwtPayload {
  sub: string;
  email: string;
}

export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Missing token' });

  const token = auth.split(' ')[1];

  try {
    const publicKey = await getPublicKey();
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });

    if (!isMyPayload(decoded)) {
      return res.status(401).json({ message: 'Invalid JWT payload' });
    }

    req.user = decoded; // now type-safe ✨
    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return res.status(401).json({ message: 'Invalid token', detail: message });
  }
};
