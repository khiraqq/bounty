// FILE: models/Message.js
import mongoose from 'mongoose';

// A single message in a user's inbox.
// "system" messages are sent by the platform (Bounty Official).
const MessageSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // null = system/Bounty Official message
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // 'system' | 'user'
    type: {
      type: String,
      enum: ['system', 'user'],
      default: 'user',
    },

    // 'application_reviewing' | 'application_approved' | 'application_rejected'
    subtype: { type: String, default: '' },

    subject: { type: String, default: '' },
    body:    { type: String, required: true },

    read:    { type: Boolean, default: false },

    referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Message ||
  mongoose.model('Message', MessageSchema);