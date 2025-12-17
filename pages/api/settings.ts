import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import dbConnect from './_connect'
import Setting from '../../server/models/Setting'
import User from '../../server/models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'change_this'

type TokenPayload = { userId?: string; role?: string }

function getTokenFromReq(req: NextApiRequest) {
  const auth = req.headers.authorization
  if (!auth) return null
  if (auth.startsWith('Bearer ')) return auth.slice(7)
  return auth
}

function getAuth(req: NextApiRequest): TokenPayload | null {
  const token = getTokenFromReq(req)
  if (!token) return null
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

function sanitize(settings: any) {
  if (!settings) return {}
  return {
    storeName: settings.storeName,
    supportEmail: settings.supportEmail,
    supportPhone: settings.supportPhone,
    address: settings.address,
    logoUrl: settings.logoUrl,
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    accentColor: settings.accentColor,
    useBoldPhotos: settings.useBoldPhotos,
    roundedUI: settings.roundedUI,
    notifyOrderConfirmations: settings.notifyOrderConfirmations,
    notifyLowStock: settings.notifyLowStock,
    notifyWeeklySummary: settings.notifyWeeklySummary,
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await dbConnect()

  const auth = getAuth(req)
  const isAdmin = auth?.role === 'admin'

  if (req.method === 'GET') {
    let settings = await Setting.findOne()
    if (!settings) {
      settings = await Setting.create({})
    }
    const data = settings.toObject()
    return res.json({ settings: isAdmin ? data : sanitize(data) })
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    if (!isAdmin) return res.status(401).json({ message: 'Unauthorized' })

    const {
      storeName,
      supportEmail,
      supportPhone,
      address,
      logoUrl,
      fullName,
      adminEmail,
      adminPhone,
      primaryColor,
      secondaryColor,
      accentColor,
      useBoldPhotos,
      roundedUI,
      notifyOrderConfirmations,
      notifyLowStock,
      notifyWeeklySummary,
      stripePublicKey,
      stripeSecretKey,
    } = req.body || {}

    const updated = await Setting.findOneAndUpdate(
      {},
      {
        $set: {
          storeName,
          supportEmail,
          supportPhone,
          address,
          logoUrl,
          fullName,
          adminEmail,
          adminPhone,
          primaryColor,
          secondaryColor,
          accentColor,
          useBoldPhotos,
          roundedUI,
          notifyOrderConfirmations,
          notifyLowStock,
          notifyWeeklySummary,
          stripePublicKey,
          stripeSecretKey,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )

    if (auth?.userId && (adminEmail || fullName)) {
      try {
        const user = await User.findById(auth.userId)
        if (user) {
          if (adminEmail) user.email = adminEmail
          if (fullName) user.name = fullName
          await user.save()
        }
      } catch (err) {
        // ignore user update failure to not block settings save
        console.error('Failed to sync admin user profile', err)
      }
    }

    return res.json({ settings: updated })
  }

  return res.status(405).end()
}

