// FILE: pages/api/messages/index.js
import dbConnect from '../../../utils/dbConnect';
import Message from '../../../models/Message';
import { requireAuth } from '../../../utils/serverAuth';

export default async function handler(req, res) {
  const auth = requireAuth(req);
  if (!auth.ok) return res.status(401).json({ message: 'Unauthorized' });

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '30' } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [messages, total, unread] = await Promise.all([
        Message.find({ recipientId: auth.userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        Message.countDocuments({ recipientId: auth.userId }),
        Message.countDocuments({ recipientId: auth.userId, read: false }),
      ]);

      return res.status(200).json({ messages, total, unread, page: Number(page) });
    } catch (err) {
      console.error('[messages GET]', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { messageId } = req.body;
      if (messageId) {
        await Message.findOneAndUpdate(
          { _id: messageId, recipientId: auth.userId },
          { read: true }
        );
      } else {
        await Message.updateMany({ recipientId: auth.userId, read: false }, { read: true });
      }
      return res.status(200).json({ message: 'Marked as read' });
    } catch (err) {
      console.error('[messages PATCH]', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
