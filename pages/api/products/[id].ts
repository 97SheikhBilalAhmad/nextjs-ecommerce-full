import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../_connect'
import Product from '../../../server/models/Product'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  await dbConnect()
  const { id } = req.query
  if(req.method === 'GET'){
    const p = await Product.findById(id).lean()
    return res.json(p)
  }
  if(req.method === 'PUT'){
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true })
    return res.json(updated)
  }
  if(req.method === 'DELETE'){
    await Product.findByIdAndDelete(id)
    return res.json({ ok: true })
  }
  res.status(405).end()
}
