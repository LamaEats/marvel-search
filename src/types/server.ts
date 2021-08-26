import { VercelRequest, VercelResponse } from '@vercel/node';

export interface ApiHandler {
  (req: VercelRequest, res: VercelResponse): void;
}
