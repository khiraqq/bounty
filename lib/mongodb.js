import mongoose from 'mongoose';
const URI = process.env.MONGODB_URI;
if (!URI) throw new Error('Set MONGODB_URI in .env.local');
let g = global._mongoose || (global._mongoose = { conn: null, promise: null });
export default async function dbConnect() {
  if (g.conn) return g.conn;
  if (!g.promise) g.promise = mongoose.connect(URI, { dbName: 'bounty', bufferCommands: false });
  g.conn = await g.promise;
  return g.conn;
}
