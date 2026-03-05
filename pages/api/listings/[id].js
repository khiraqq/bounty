import dbConnect from '../../../lib/mongodb';
import { Listing } from '../../../lib/models';
import { getUser } from '../../../lib/jwt';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const listing = await Listing.findById(id).lean();
      if (!listing) return res.status(404).json({ message: 'Listing not found' });
      return res.json({ listing });
    } catch { return res.status(404).json({ message: 'Not found' }); }
  }

  if (req.method === 'PATCH') {
    const me = getUser(req);
    if (!me) return res.status(401).json({ message: 'Not authenticated' });
    try {
      const listing = await Listing.findById(id);
      if (!listing) return res.status(404).json({ message: 'Not found' });
      if (listing.sellerId.toString() !== me.id) return res.status(403).json({ message: 'Forbidden' });
      const allowed = ['title','description','price','priceUnit','minOrder','maxOrder','deliveryTime','stock','isActive'];
      const updates = {};
      for (const k of allowed) { if (req.body[k] !== undefined) updates[k] = req.body[k]; }
      Object.assign(listing, updates);
      await listing.save();
      return res.json({ listing });
    } catch (e) { return res.status(400).json({ message: e.message }); }
  }

  if (req.method === 'DELETE') {
    const me = getUser(req);
    if (!me) return res.status(401).json({ message: 'Not authenticated' });
    try {
      const listing = await Listing.findById(id);
      if (!listing) return res.status(404).json({ message: 'Not found' });
      if (listing.sellerId.toString() !== me.id) return res.status(403).json({ message: 'Forbidden' });
      await listing.deleteOne();
      return res.json({ message: 'Deleted' });
    } catch (e) { return res.status(400).json({ message: e.message }); }
  }

  res.status(405).end();
}
