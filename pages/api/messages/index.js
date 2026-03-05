import dbConnect from '../../../lib/mongodb';
import { Conversation } from '../../../lib/models';
import { getUser } from '../../../lib/jwt';

export default async function handler(req, res) {
  await dbConnect();
  const me = getUser(req);
  if (!me) return res.status(401).json({ message: 'Not authenticated' });
  if (req.method === 'GET') {
    const convos = await Conversation.find({ participants: me.username }).sort({ lastMessageAt: -1 }).lean();
    return res.json({ conversations: convos });
  }
  res.status(405).end();
}
