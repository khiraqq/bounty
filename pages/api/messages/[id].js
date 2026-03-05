import dbConnect from '../../../lib/mongodb';
import { Message, Conversation } from '../../../lib/models';
import { getUser } from '../../../lib/jwt';

export default async function handler(req, res) {
  await dbConnect();
  const me = getUser(req);
  if (!me) return res.status(401).json({ message: 'Not authenticated' });
  const { id } = req.query;

  if (req.method === 'GET') {
    const msgs = await Message.find({ conversationId: id }).sort({ createdAt: 1 }).lean();
    await Message.updateMany({ conversationId: id, toUsername: me.username, read: false }, { read: true });
    const conv = await Conversation.findOne({ conversationId: id });
    if (conv) {
      if (conv.participantA === me.username) conv.unreadA = 0;
      else conv.unreadB = 0;
      await conv.save();
    }
    return res.json({ messages: msgs });
  }

  if (req.method === 'POST') {
    const { text, toUsername } = req.body;
    if (!text?.trim() || !toUsername) return res.status(400).json({ message: 'text and toUsername required' });
    const msg = await Message.create({ conversationId: id, fromUsername: me.username, toUsername, text: text.trim() });
    const parts = [me.username, toUsername].sort();
    const isA = parts[0] === toUsername;
    await Conversation.findOneAndUpdate(
      { conversationId: id },
      { $set: { conversationId: id, participants: parts, participantA: parts[0], participantB: parts[1], lastMessage: text.trim().slice(0, 120), lastMessageAt: new Date() }, $inc: { [isA ? 'unreadA' : 'unreadB']: 1 } },
      { upsert: true }
    );
    return res.status(201).json({ message: msg });
  }
  res.status(405).end();
}
