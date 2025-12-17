import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../_connect'
import Order from '../../../server/models/Order'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return res.status(405).end()

  await dbConnect()

  const orders = await Order.find({ adminNotification: true })
    .populate('user', 'name email')
    .populate('items.product', 'name price')
    .sort({ createdAt: -1 })
    .lean()

  const payload = orders.map((o: any) => ({
    _id: o._id,
    status: o.status,
    items:
      o.items?.map((it: any) => ({
        ...it,
        name: it.product?.name || it.productName || 'Item',
      })) ?? [],
    customerDetails: o.customerDetails || o.customer || {
      name: o.user?.name,
      email: o.user?.email,
    },
    shipping: o.shipping,
    createdAt: o.createdAt,
    adminNotification: o.adminNotification,
  }))

  return res.json(payload)
}

