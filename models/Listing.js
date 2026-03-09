// FILE: models/Listing.js
import mongoose from 'mongoose';

const ListingSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'deleted'],
      default: 'active',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // Add other fields as needed
  },
  { timestamps: true }
);

export default mongoose.models.Listing || mongoose.model('Listing', ListingSchema);