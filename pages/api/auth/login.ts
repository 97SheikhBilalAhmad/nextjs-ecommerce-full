import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../_connect'
import User from '../../../server/models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'change_this'

const DEFAULT_ADMIN_EMAIL = 'admin@gmail.com'
const DEFAULT_ADMIN_PASSWORD = 'admin@123'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()
  await dbConnect()
  const { email, password } = req.body

  // Hard-coded admin credentials
  if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
    let adminUser = await User.findOne({ email: DEFAULT_ADMIN_EMAIL })
    if (!adminUser) {
      const hash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10)
      adminUser = await User.create({
        name: 'Admin',
        email: DEFAULT_ADMIN_EMAIL,
        password: hash,
        role: 'admin',
      })
    } else if (adminUser.role !== 'admin') {
      adminUser.role = 'admin'
      await adminUser.save()
    }

    const token = jwt.sign(
      { userId: adminUser._id, role: adminUser.role },
      JWT_SECRET,
      { expiresIn: '7d' },
    )
    return res.json({ token })
  }

  // Normal user login
  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ message: 'Invalid' })
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ message: 'Invalid' })
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' },
  )
  res.json({ token })
}
