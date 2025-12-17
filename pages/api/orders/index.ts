import type { NextApiRequest, NextApiResponse } from 'next'
import type { Server as IOServer } from 'socket.io'
import dbConnect from '../_connect'
import Order from '../../../server/models/Order'

const getIO = (res: NextApiResponse): IOServer | null => {
  // @ts-ignore - Next.js attaches the server instance here at runtime
  return res?.socket?.server?.io || null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await dbConnect()

  if (req.method === 'GET') {
    const grouped = req.query.grouped === '1'
    const orders = await Order.find()
      .populate('user', 'email name')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .lean()

    const withCustomer = orders.map((o: any) => ({
      ...o,
      customerDetails: o.customerDetails || o.customer || {
        name: o.user?.name,
        email: o.user?.email,
      },
      items:
        o.items?.map((it: any) => ({
          ...it,
          name: it.product?.name || it.productName || 'Item',
        })) ?? [],
    }))

    if (grouped) {
      const groups: Record<string, any[]> = {
        pending: [],
        accepted: [],
        rejected: [],
        processing: [],
        completed: [],
        'paid-test': [],
      }
      withCustomer.forEach((o) => {
        const key = o.status || 'pending'
        if (!groups[key]) groups[key] = []
        groups[key].push(o)
      })
      return res.json(groups)
    }

    return res.json(withCustomer)
  }

  if (req.method === 'POST') {
    const { user, items, total, customerDetails, shipping, metadata } = req.body
    const order = await Order.create({
      user: user || null,
      items,
      total,
      status: 'pending',
      customerDetails,
      shipping,
      metadata,
      adminNotification: true,
      customerNotification: false,
      paymentStatus: 'pending',
      paymentMethod: req.body.paymentMethod || 'stripe',
    })

    const io = getIO(res)
    if (io) {
      io.emit('newOrder', {
        orderId: order._id,
        customerName:
          customerDetails?.name ||
          order.customerDetails?.name ||
          order.customer?.name ||
          order.user?.name ||
          'Customer',
        status: 'pending',
        items,
      })
    }

    return res.status(201).json(order)
  }

  res.status(405).end()
}






