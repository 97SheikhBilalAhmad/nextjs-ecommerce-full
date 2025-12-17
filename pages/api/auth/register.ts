import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../_connect'
import User from '../../../server/models/User'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).end()
  await dbConnect()
  const { name, email, password } = req.body
  const exists = await User.findOne({ email })
  if(exists) return res.status(400).json({ message: 'User exists' })
  const hash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, password: hash, role: 'customer' })
  res.json({ id: user._id, email: user.email })
}
