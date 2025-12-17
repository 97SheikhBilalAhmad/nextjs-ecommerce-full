import mongoose, { Schema, model, Model } from 'mongoose'

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        qty: Number,
        price: Number,
      },
    ],
    total: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'processing', 'completed', 'paid-test'],
      default: 'pending',
      index: true,
    },
    metadata: Schema.Types.Mixed,
    shipping: Schema.Types.Mixed,
    customer: Schema.Types.Mixed,
    customerDetails: {
      name: String,
      email: String,
      phone: String,
      address: String,
    },
    adminNotification: { type: Boolean, default: true },
    customerNotification: { type: Boolean, default: false },
    paymentStatus: { type: String, default: 'pending' },
    paymentMethod: { type: String, default: 'stripe' },
    stripeSessionId: { type: String, index: true, unique: false },
    orderStatus: { type: String, default: 'new' },
  },
  { timestamps: true },
)
const Order = (mongoose.models.Order || model('Order', OrderSchema))
export default Order
