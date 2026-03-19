// FILE: lib/models.js  ← replace your existing lib/models.js with this
import mongoose from 'mongoose';

// ── USER ──────────────────────────────────────────────────────────────────────
const LoginRecordSchema = new mongoose.Schema(
  { ipAddress: { type: String, default: '' }, userAgent: { type: String, default: '' } },
  { timestamps: true }
);

const AuditLogEntrySchema = new mongoose.Schema(
  {
    action:    { type: String, required: true },
    ipAddress: { type: String, default: '' },
    details:   { type: String, default: '' },
    adminId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, minlength: 3, trim: true },
  // email is optional — users sign up with username + password only
  email:        { type: String, default: '', lowercase: true, trim: true },
  password:     { type: String },
  authMethod:   { type: String, enum: ['password', 'google', 'discord'], default: 'password' },
  googleId:     { type: String },
  discordId:    { type: String },
  avatarUrl:    { type: String, default: '' },
  balance:      { type: Number, default: 0 },
  rank:         { type: String, default: 'Bronze' },
  isSeller:     { type: Boolean, default: false },
  isAdmin:      { type: Boolean, default: false },  // legacy compat — prefer role:admin

  // Role for admin dashboard  ('user' | 'seller' | 'admin' | 'suspended')
  role:         { type: String, enum: ['user', 'seller', 'admin', 'suspended'], default: 'user' },
  status:       { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },

  // Risk / trust
  riskScore:     { type: Number, default: 0 },
  manualFlagged: { type: Boolean, default: false },
  disputeCount:  { type: Number, default: 0 },
  totalVolume:   { type: Number, default: 0 },

  // Network tracking
  registrationIp:      { type: String, default: '' },
  loginHistory:        { type: [LoginRecordSchema], default: [] },
  auditLog:            { type: [AuditLogEntrySchema], default: [] },

  // Seller application reference
  sellerApplicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'SellerApplication', default: null },

  createdAt: { type: Date, default: Date.now },
});

// ── SELLER PROFILE ────────────────────────────────────────────────────────────
const SellerSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  username:     { type: String, required: true },
  displayName:  { type: String, required: true },
  description:  { type: String, default: '' },
  games:        [{ type: String }],
  categories:   [{ type: String }],
  pricePerUnit: { type: Number, default: 0 },
  currency:     { type: String, default: 'Gold' },
  minOrder:     { type: Number, default: 1 },
  maxOrder:     { type: Number, default: 10000 },
  deliveryTime: { type: String, default: '1-24 hours' },
  totalSales:   { type: Number, default: 0 },
  rating:       { type: Number, default: 0 },
  reviewCount:  { type: Number, default: 0 },
  isVerified:   { type: Boolean, default: false },
  isOnline:     { type: Boolean, default: false },
  createdAt:    { type: Date, default: Date.now },
});

// ── LISTING ───────────────────────────────────────────────────────────────────
const ListingSchema = new mongoose.Schema({
  sellerId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  sellerUsername: { type: String },
  game:           { type: String, required: true },
  category:       { type: String, required: true },
  title:          { type: String, required: true },
  description:    { type: String, default: '' },
  price:          { type: Number },  // alias kept for checkout
  pricePerUnit:   { type: Number, required: true },
  currency:       { type: String, default: 'Gold' },
  minOrder:       { type: Number, default: 1 },
  maxOrder:       { type: Number, default: 10000 },
  deliveryTime:   { type: String, default: '1-24 hours' },
  rating:         { type: Number, default: 4.8 },
  reviewCount:    { type: Number, default: 0 },
  stock:          { type: Number, default: 999999 },
  isActive:       { type: Boolean, default: true },
  thumbnail:      { type: String, default: '' },
  createdAt:      { type: Date, default: Date.now },
});

// ── CONVERSATION ──────────────────────────────────────────────────────────────
const ConversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true },
  participants:   [{ type: String }],
  lastMessage:    { type: String, default: '' },
  lastMessageAt:  { type: Date, default: Date.now },
  unreadCount:    { type: Map, of: Number, default: {} },
  orderId:        { type: String, default: '' },
});

// ── MESSAGE (user ↔ user chat) ────────────────────────────────────────────────
const MessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  fromUsername:   { type: String, required: true },
  toUsername:     { type: String, required: true },
  text:           { type: String, required: true, maxlength: 2000 },
  read:           { type: Boolean, default: false },
  createdAt:      { type: Date, default: Date.now },
});

// ── SYSTEM INBOX MESSAGE (platform → user) ────────────────────────────────────
const SystemMessageSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    type:        { type: String, enum: ['system', 'user'], default: 'system' },
    subtype:     { type: String, default: '' },  // 'application_reviewing' | 'application_approved' | 'application_rejected'
    subject:     { type: String, default: '' },
    body:        { type: String, required: true },
    read:        { type: Boolean, default: false },
    referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

// ── SELLER APPLICATION ────────────────────────────────────────────────────────
const SellerApplicationSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    username:     { type: String, required: true },
    email:        { type: String, default: '' },
    categories:   { type: [String], default: [] },
    experience:   { type: String, default: '' },
    platforms:    { type: String, default: '' },
    reputation:   { type: String, default: '' },
    sourcing:     { type: String, default: '' },
    deliverySpeed:{ type: String, default: '' },
    discord:      { type: String, default: '' },
    ipAddress:    { type: String, default: '' },
    userAgent:    { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt:   { type: Date, default: null },
    reviewNotes:  { type: String, default: '' },
  },
  { timestamps: true }
);

// ── DEPOSIT ───────────────────────────────────────────────────────────────────
const DepositSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  crypto:        { type: String },
  amountUSD:     { type: Number },
  amountCrypto:  { type: String },
  address:       { type: String },
  location:      { type: String },
  status:        { type: String, enum: ['pending', 'confirmed', 'expired'], default: 'pending' },
  createdAt:     { type: Date, default: Date.now },
  expiresAt:     { type: Date },
});

// ── DISCOUNT CODE ─────────────────────────────────────────────────────────────
const DiscountCodeSchema = new mongoose.Schema(
  {
    code:      { type: String, required: true, unique: true, uppercase: true, trim: true },
    type:      { type: String, enum: ['percent', 'fixed'], default: 'fixed' },
    amount:    { type: Number, required: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },
    maxUses:   { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    active:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── EXPORTS ───────────────────────────────────────────────────────────────────
export const User             = mongoose.models.User             || mongoose.model('User',             UserSchema);
export const Seller           = mongoose.models.Seller           || mongoose.model('Seller',           SellerSchema);
export const Listing          = mongoose.models.Listing          || mongoose.model('Listing',          ListingSchema);
export const Message          = mongoose.models.Message          || mongoose.model('Message',          MessageSchema);
export const Conversation     = mongoose.models.Conversation     || mongoose.model('Conversation',     ConversationSchema);
export const SystemMessage    = mongoose.models.SystemMessage    || mongoose.model('SystemMessage',    SystemMessageSchema);
export const SellerApplication= mongoose.models.SellerApplication|| mongoose.model('SellerApplication',SellerApplicationSchema);
export const Deposit          = mongoose.models.Deposit          || mongoose.model('Deposit',          DepositSchema);
export const DiscountCode     = mongoose.models.DiscountCode     || mongoose.model('DiscountCode',     DiscountCodeSchema);