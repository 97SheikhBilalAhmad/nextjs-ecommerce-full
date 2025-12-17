import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { buffer } from 'micro'
import dbConnect from '../_connect'
import { saveStripeOrder } from '../../../lib/saveStripeOrder'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return res.status(400).send('Missing webhook signature or secret')
  }

  let event: Stripe.Event
  const buf = await buffer(req)

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    try {
      await dbConnect()
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
      await saveStripeOrder({ session, lineItems: lineItems.data as any })
    } catch (err) {
      console.error('Failed to persist Stripe order from webhook', err)
    }
  }

  res.json({ received: true })
}


