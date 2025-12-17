import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../_connect'
import Order from '../../../../server/models/Order'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return res.status(405).end()

  const customerId = req.query.customerId as string
  if (!customerId) {
    return res.status(400).json({ message: 'customerId is required' })
  }

  await dbConnect()

  const orders = await Order.find({
    $or: [{ customer: customerId }, { user: customerId }],
  })
    .populate('items.product', 'name price')
    .sort({ createdAt: -1 })
    .lean()

  const payload = orders.map((o: any) => ({
    orderId: String(o._id),
    status: o.status,
    items:
      o.items?.map((it: any) => ({
        productName: it.product?.name || it.productName || 'Item',
        quantity: it.qty ?? it.quantity ?? 0,
        price: it.price ?? it.product?.price ?? 0,
      })) ?? [],
    total: o.total ?? 0,
    createdAt: o.createdAt,
  }))

  return res.json(payload)
}

