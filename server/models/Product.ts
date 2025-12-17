import mongoose, { Schema, model, Model } from 'mongoose'

export interface IProduct {
  name: string
  description?: string
  price: number
  images?: string[]
  inventory?: number
  category?: string
}

const ProductSchema = new Schema<IProduct>(
  {
    name: String,
    description: String,
    price: Number,
    images: [String],
    inventory: { type: Number, default: 0 },
    category: { type: String },
  },
  { timestamps: true },
)

const Product = (mongoose.models.Product ||
  model<IProduct>('Product', ProductSchema)) as Model<IProduct>
export default Product
