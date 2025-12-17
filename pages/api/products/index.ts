import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/lib/dbConnect'
import Product from '../../../server/models/Product'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  await dbConnect()
  if(req.method === 'GET'){
    const products = await Product.find().lean()
    return res.json(products)
  }
  if(req.method === 'POST'){
    // create product (admin) - in real app validate auth
    const p = await Product.create(req.body)
    return res.json(p)
  }
  res.status(405).end()
}
