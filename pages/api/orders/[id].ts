import type { NextApiRequest, NextApiResponse } from 'next'
import type { Server as IOServer } from 'socket.io'
import dbConnect from '../_connect'
import Order from '../../../server/models/Order'

const ALLOWED_STATUSES = [
  'pending',
  'accepted',
  'rejected',
  'processing',
  'completed',
  'paid-test',
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await dbConnect()

  const idParam = req.query.id
  const id = Array.isArray(idParam) ? idParam[0] : idParam

  if (!id) return res.status(400).json({ message: 'Order id is required' })

  if (req.method === 'GET') {
    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      

    if (!order) return res.status(404).json({ message: 'Order not found' })

    return res.json({
      _id: order._id,
      status: order.status,
      items:
        order.items?.map((it: any) => ({
          ...it,
          name: it.product?.name || it.productName || 'Item',
        })) ?? [],
      customerDetails: order.customerDetails || order.customer || {},
      shipping: order.shipping,
      adminNotification: order.adminNotification,
      customerNotification: order.customerNotification,
      createdAt: order.createdAt,
      user: order.user || null,
      metadata: order.metadata || {},
    })
  }

  if (req.method === 'PUT') {
    const { status, comment } = req.body as { status?: string; comment?: string }

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const update: any = {
      status,
      adminNotification: false,
      customerNotification: true,
    }
    if (comment) {
      update['metadata.adminComment'] = comment
    }

    const order = await Order.findByIdAndUpdate(id, update, { new: true })

    if (!order) return res.status(404).json({ message: 'Order not found' })

    const io: IOServer | null =
      // @ts-ignore Next.js attaches server instance
      (res as any)?.socket?.server?.io || null
    if (io) {
      const customerId =
        (order.customer && order.customer._id) ||
        (order.customer && order.customer.id) ||
        (order.user && order.user._id) ||
        (order.user && order.user.id) ||
        order.customer ||
        order.user

      if (customerId) {
        const adminComment =
          (order.metadata && (order.metadata as any).adminComment) || comment || ''
        const message =
          adminComment && adminComment.trim().length > 0
            ? adminComment
            : `Your order is ${order.status}.`
        io.to(String(customerId)).emit(`orderUpdate:${customerId}`, {
          orderId: order._id,
          status: order.status,
          items:
            order.items?.map((it: any) => ({
              name: it.product?.name || it.productName || 'Item',
              qty: it.qty ?? it.quantity ?? 0,
              price: it.price ?? 0,
            })) ?? [],
          message,
        })
      }
    }

    return res.json(order)
  }

  return res.status(405).end()
}

