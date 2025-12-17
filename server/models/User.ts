import mongoose, { Schema, model, Model } from 'mongoose'

export interface IUser { name: string; email: string; password: string; role: string }

const UserSchema = new Schema<IUser>({ name: String, email: { type: String, unique: true }, password: String, role: { type: String, default: 'customer' } }, { timestamps: true })

const User = (mongoose.models.User || model<IUser>('User', UserSchema)) as Model<IUser>
export default User
