import dbConnect from '../../../lib/mongodb';
import { Deposit } from '../../../lib/models';
import { getUser } from '../../../lib/jwt';

const ADDR = { BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf', LTC: 'LQ3wSNSaMBhJrVcCknXXFphnHJLKBVDGf' };
const RATE = { BTC: 68000, LTC: 85 };

export default async function handler(req, res) {
  await dbConnect();
  const me = getUser(req);
  if (!me) return res.status(401).json({ message: 'Not authenticated' });
  if (req.method === 'GET') {
    const deps = await Deposit.find({ username: me.username }).sort({ createdAt: -1 }).limit(20).lean();
    return res.json({ deposits: deps });
  }
  if (req.method === 'POST') {
    const { crypto, amountUSD } = req.body;
    if (!crypto || !amountUSD) return res.status(400).json({ message: 'crypto and amountUSD required' });
    const c = crypto.toUpperCase();
    const amountCrypto = (Number(amountUSD) / (RATE[c] || 68000)).toFixed(8);
    const dep = await Deposit.create({ userId: me.id, username: me.username, crypto: c, amountUSD: Number(amountUSD), amountCrypto, address: ADDR[c] || ADDR.BTC, expiresAt: new Date(Date.now() + 30 * 60 * 1000) });
    return res.status(201).json({ deposit: dep });
  }
  res.status(405).end();
}
