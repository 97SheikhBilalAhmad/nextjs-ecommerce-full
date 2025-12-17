import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import dbConnect from '../_connect'
import Order from '../../../server/models/Order'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
})

const TEST_PAYMENT = process.env.TEST_PAYMENT === 'true'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()

  const { items, successUrl, cancelUrl, shipping, testMode } = req.body
  const useTestPayment = TEST_PAYMENT || !!testMode

  await dbConnect()

  if (useTestPayment) {
    // Bypass Stripe: create a paid test order directly
    const total = (items || []).reduce(
      (sum: number, i: any) => sum + (i.price || 0) * (i.quantity || 0),
      0,
    )

    const orderItems =
      (items || []).map((i: any) => ({
        product: i.id || i.productId || null,
        qty: i.quantity,
        price: i.price,
      })) ?? []

    const order = await Order.create({
      user: null,
      items: orderItems,
      total,
      status: 'paid-test',
      shipping,
    })

    return res.json({
      testPayment: true,
      orderId: order._id,
      redirectUrl: successUrl,
    })
  }

  // Normal Stripe checkout session
  const line_items = items.map((i: any) => ({
    price_data: {
      currency: 'usd',
      product_data: { name: i.name },
      unit_amount: Math.round(i.price * 100),
    },
    quantity: i.quantity,
  }))

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      items: JSON.stringify(items || []),
      shipping: JSON.stringify(shipping || {}),
    },
  })

  res.json({ url: session.url })
}

