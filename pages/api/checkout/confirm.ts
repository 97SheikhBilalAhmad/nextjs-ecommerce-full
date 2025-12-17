import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import dbConnect from '../_connect'
import { saveStripeOrder } from '../../../lib/saveStripeOrder'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()
  const { sessionId } = req.body || {}
  if (!sessionId) return res.status(400).json({ message: 'sessionId required' })

  await dbConnect()

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    })

    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Session not paid' })
    }

    const order = await saveStripeOrder({
      session,
      lineItems: session.line_items?.data as any,
    })

    return res.json({ orderId: order._id, status: order.status })
  } catch (err: any) {
    console.error('Confirm order failed', err)
    return res.status(500).json({ message: 'Failed to confirm order' })
  }
}

