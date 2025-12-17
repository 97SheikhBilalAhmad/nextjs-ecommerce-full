import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../_connect'
import Order from '../../../server/models/Order'

type NotificationItem = {
  orderId: string
  status: string
  items: any[]
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NotificationItem[] | { message: string }>,
) {
  if (req.method !== 'GET') return res.status(405).end()

  const customerId = req.query.customerId as string
  if (!customerId) {
    return res.status(400).json({ message: 'customerId is required' })
  }

  await dbConnect()

  const orders = await Order.find({
    customerNotification: true,
    $or: [{ customer: customerId }, { user: customerId }],
  })
    .populate('items.product', 'name')
    .sort({ createdAt: -1 })
    .lean()

  const response: NotificationItem[] = orders.map((o: any) => {
    const adminComment =
      o.metadata?.adminComment ||
      o.metadata?.comment ||
      o.metadata?.note ||
      ''

    const statusMessage = adminComment
      ? adminComment
      : `Your order is ${o.status}.`

    return {
      orderId: String(o._id),
      status: o.status,
      items:
        o.items?.map((it: any) => ({
          name: it.product?.name || it.productName || 'Item',
          qty: it.qty ?? it.quantity ?? 0,
          price: it.price ?? 0,
        })) ?? [],
      message: statusMessage,
    }
  })

  return res.json(response)
}

