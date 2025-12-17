import mongoose, { Schema, model, type Model } from 'mongoose'

export interface ISetting {
  storeName?: string
  supportEmail?: string
  supportPhone?: string
  address?: string
  logoUrl?: string
  fullName?: string
  adminEmail?: string
  adminPhone?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  useBoldPhotos?: boolean
  roundedUI?: boolean
  notifyOrderConfirmations?: boolean
  notifyLowStock?: boolean
  notifyWeeklySummary?: boolean
  stripePublicKey?: string
  stripeSecretKey?: string
}

const SettingSchema = new Schema<ISetting>(
  {
    storeName: { type: String, default: 'Golden Feast' },
    supportEmail: { type: String, default: 'support@goldenfeast.com' },
    supportPhone: { type: String, default: '+1 (555) 987-6543' },
    address: { type: String, default: '123 Food Street, Flavor Town' },
    logoUrl: { type: String, default: '' },
    fullName: { type: String, default: 'Golden Feast Admin' },
    adminEmail: { type: String, default: 'admin@gmail.com' },
    adminPhone: { type: String, default: '+1 (555) 123-4567' },
    primaryColor: { type: String, default: '#FFCC00' },
    secondaryColor: { type: String, default: '#000000' },
    accentColor: { type: String, default: '#FFFFFF' },
    useBoldPhotos: { type: Boolean, default: true },
    roundedUI: { type: Boolean, default: true },
    notifyOrderConfirmations: { type: Boolean, default: true },
    notifyLowStock: { type: Boolean, default: true },
    notifyWeeklySummary: { type: Boolean, default: false },
    stripePublicKey: { type: String, default: '' },
    stripeSecretKey: { type: String, default: '' },
  },
  { timestamps: true },
)

const Setting = (mongoose.models.Setting ||
  model<ISetting>('Setting', SettingSchema)) as Model<ISetting>

export default Setting


