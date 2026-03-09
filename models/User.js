// FILE: models/User.js  (replace your existing User model with this)
import mongoose from 'mongoose';

// ── Security audit log entry ─────────────────────────────────────────────────
const AuditLogEntrySchema = new mongoose.Schema(
  {
    action:    { type: String, required: true },  // e.g. 'login_failed', 'admin_flag', 'password_changed'
    ipAddress: { type: String, default: '' },
    country:   { type: String, default: '' },
    details:   { type: String, default: '' },
    adminId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// ── Login IP record ──────────────────────────────────────────────────────────
const LoginRecordSchema = new mongoose.Schema(
  {
    ipAddress: { type: String, default: '' },
    country:   { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

// ── Main User schema ─────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema(
  {
    username:     { type: String, required: true, unique: true, trim: true, index: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    // 'user' | 'seller' | 'admin' | 'suspended'
    role:   { type: String, enum: ['user', 'seller', 'admin', 'suspended'], default: 'user', index: true },
    status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active', index: true },

    // ── Profile ──────────────────────────────────────────────────────────────
    avatar:       { type: String, default: '' },
    bio:          { type: String, default: '' },
    sellerRating: { type: Number, default: 0 },

    // ── Wallet ───────────────────────────────────────────────────────────────
    balance:         { type: Number, default: 0 },
    walletAddresses: { type: [String], default: [] },   // all submitted addresses
    totalVolume:     { type: Number, default: 0 },      // cumulative order volume $

    // ── Risk / trust ─────────────────────────────────────────────────────────
    riskScore:     { type: Number, default: 0, index: true },
    manualFlagged: { type: Boolean, default: false },   // admin manual flag (+5)
    disputeCount:  { type: Number, default: 0 },

    // ── Network ──────────────────────────────────────────────────────────────
    registrationIp: { type: String, default: '' },
    loginHistory:   { type: [LoginRecordSchema], default: [] },

    // ── Security audit log ───────────────────────────────────────────────────
    auditLog: { type: [AuditLogEntrySchema], default: [] },

    // ── Seller application reference ─────────────────────────────────────────
    sellerApplicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerApplication',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);