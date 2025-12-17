import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dbConnect from '../_connect'
import User from '../../../server/models/User'

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()

  const auth = getAuth(req)
  if (!auth?.userId) return res.status(401).json({ message: 'Unauthorized' })

  const { currentPassword, newPassword } = req.body || {}
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Missing fields' })
  }

  await dbConnect()
  const user = await User.findById(auth.userId)
  if (!user) return res.status(404).json({ message: 'User not found' })

  const ok = await bcrypt.compare(currentPassword, user.password || '')
  if (!ok) return res.status(401).json({ message: 'Invalid current password' })

  const hash = await bcrypt.hash(newPassword, 10)
  user.password = hash
  await user.save()

  return res.json({ success: true })
}


