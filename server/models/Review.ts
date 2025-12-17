import mongoose, { Schema, model } from 'mongoose'
const ReviewSchema = new Schema( {
     product:{ type: Schema.Types.ObjectId, ref: 'Product' },
     user: { type: Schema.Types.ObjectId, ref: 'User' },
     rating: Number, text: String }, { timestamps: true })
const Review = (mongoose.models.Review || model('Review', ReviewSchema))
export default Review
