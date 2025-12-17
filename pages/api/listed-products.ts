import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from './_connect'
import Product from '../../server/models/Product'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return res.status(405).end()

  await dbConnect()

  // Get all products sorted by newest first, then pick first per category
  const all = await Product.find().sort({ createdAt: -1 }).lean()

  const byCategory = new Map<string, any>()
  for (const p of all) {
    const key = (p.category as string) || 'uncategorized'
    if (!byCategory.has(key)) {
      byCategory.set(key, p)
    }
  }

  const result = Array.from(byCategory.entries()).map(([category, product]) => ({
    category,
    product,
  }))

  return res.json(result)
}






