import mongoose from 'mongoose';
const S = mongoose.Schema;

const UserSchema = new S({
  username: { type: String, required: true, unique: true, minlength: 3, trim: true },
  email: { type: String, default: '', trim: true, lowercase: true },
  password: { type: String, default: '' },
  authMethod: { type: String, enum: ['password','google','discord'], default: 'password' },
  googleId: { type: String, default: '' },
  discordId: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  balance: { type: Number, default: 0 },
  rank: { type: String, default: 'Bronze' },
  isSeller: { type: Boolean, default: false },
  description: { type: String, default: '' },
  notifSettings: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

const ListingSchema = new S({
  sellerId: { type: S.Types.ObjectId, ref: 'User' },
  sellerUsername: { type: String, default: '' },
  sellerRating: { type: Number, default: 5.0 },
  sellerReviews: { type: Number, default: 0 },
  sellerOrders: { type: Number, default: 0 },
  isSellerOnline: { type: Boolean, default: false },
  isSellerVerified: { type: Boolean, default: false },
  game: { type: String, required: true },
  category: { type: String, default: 'Currency' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  priceUnit: { type: String, default: 'per 1000 gold' },
  minOrder: { type: Number, default: 100 },
  maxOrder: { type: Number, default: 10000000 },
  deliveryTime: { type: String, default: '1-24 hours' },
  stock: { type: Number, default: 99999 },
  isFeatured: { type: Boolean, default: false },
  completionRate: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const OrderSchema = new S({
  buyerId: { type: S.Types.ObjectId, ref: 'User' },
  sellerId: { type: S.Types.ObjectId, ref: 'User' },
  buyerUsername: { type: String },
  sellerUsername: { type: String },
  listingId: { type: S.Types.ObjectId, ref: 'Listing' },
  game: { type: String },
  category: { type: String },
  title: { type: String },
  quantity: { type: Number, default: 1 },
  price: { type: Number },
  total: { type: Number },
  status: { type: String, enum: ['pending','active','completed','disputed','cancelled'], default: 'pending' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const MessageSchema = new S({
  conversationId: { type: String, required: true, index: true },
  fromUsername: { type: String, required: true },
  toUsername: { type: String, required: true },
  text: { type: String, required: true, maxlength: 4000 },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const ConversationSchema = new S({
  conversationId: { type: String, required: true, unique: true },
  participants: [{ type: String }],
  participantA: { type: String, default: '' },
  participantB: { type: String, default: '' },
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  unreadA: { type: Number, default: 0 },
  unreadB: { type: Number, default: 0 },
});

const SellerSchema = new S({
  userId: { type: S.Types.ObjectId, ref: 'User' },
  username: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  description: { type: String, default: '' },
  games: [{ type: String }],
  categories: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  totalSales: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  reviewCount: { type: Number, default: 0 },
  responseTime: { type: String, default: 'Within 1 hour' },
  createdAt: { type: Date, default: Date.now },
});

const DepositSchema = new S({
  userId: { type: S.Types.ObjectId, ref: 'User' },
  username: { type: String },
  crypto: { type: String },
  amountUSD: { type: Number },
  amountCrypto: { type: String },
  address: { type: String },
  status: { type: String, enum: ['pending','confirmed','expired'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
});

const ReviewSchema = new S({
  orderId: { type: S.Types.ObjectId, ref: 'Order' },
  reviewerUsername: { type: String },
  sellerUsername: { type: String },
  listingId: { type: S.Types.ObjectId, ref: 'Listing' },
  rating: { type: Number, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Listing = mongoose.models.Listing || mongoose.model('Listing', ListingSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
export const Seller = mongoose.models.Seller || mongoose.model('Seller', SellerSchema);
export const Deposit = mongoose.models.Deposit || mongoose.model('Deposit', DepositSchema);
export const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
