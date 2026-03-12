// FILE: models/SellerApplication.js
import mongoose from 'mongoose';

const SellerApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    username: { type: String, required: true },
    email:    { type: String, default: '' },

    categories:    { type: [String], default: [] },
    experience:    { type: String, default: '' },
    platforms:     { type: String, default: '' },
    reputation:    { type: String, default: '' },
    sourcing:      { type: String, default: '' },
    deliverySpeed: { type: String, default: '' },
    discord:       { type: String, default: '' },

    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },

    status: {
      type: String,
      enum: ['pending', 'reviewing', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },

    reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt:  { type: Date, default: null },
    reviewNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.SellerApplication ||
  mongoose.model('SellerApplication', SellerApplicationSchema);

