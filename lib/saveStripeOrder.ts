import Stripe from 'stripe'
import dbConnect from '../pages/api/_connect'
import Order from '../server/models/Order'

type SaveParams = {
  session: Stripe.Checkout.Session
  lineItems?: Stripe.LineItem[]
}

export async function saveStripeOrder({ session, lineItems }: SaveParams) {
  await dbConnect()

  const stripeSessionId = session.id

  const existing = await Order.findOne({ stripeSessionId })
  if (existing) return existing

  let itemsMeta: any[] = []
  try {
    const raw = session.metadata?.items
    itemsMeta = raw ? JSON.parse(raw) : []
  } catch {
    itemsMeta = []
  }

  const shippingMetaRaw = session.metadata?.shipping
  let shippingMeta: any = {}
  try {
    shippingMeta = shippingMetaRaw ? JSON.parse(shippingMetaRaw) : {}
  } catch {
    shippingMeta = {}
  }

  const fallbackItems =
    itemsMeta?.map((i) => ({
      product: i.id || i.productId || null,
      qty: i.quantity,
      price: i.price,
    })) ?? []

  const items =
    lineItems?.map((li) => ({
      product: null,
      qty: li.quantity || 0,
      price: li.price?.unit_amount ? li.price.unit_amount / 100 : 0,
      name: li.description,
    })) ?? fallbackItems

  const total =
    (typeof session.amount_total === 'number'
      ? session.amount_total / 100
      : null) ??
    fallbackItems.reduce(
      (sum: number, i: any) => sum + (i.price || 0) * (i.qty || i.quantity || 0),
      0,
    )

  const shipping =
    Object.keys(shippingMeta || {}).length > 0
      ? shippingMeta
      : session.shipping_details

  const customer = {
    name: session.customer_details?.name,
    email: session.customer_details?.email,
  }

  const order = await Order.create({
    user: null,
    items,
    total,
    status: 'pending',
    paymentStatus: 'paid',
    paymentMethod: 'stripe',
    stripeSessionId,
    orderStatus: 'new',
    metadata: { sessionId: stripeSessionId },
    shipping,
    customer,
    customerDetails: {
      name: customer.name,
      email: customer.email,
      phone: shipping?.phone || shipping?.phone_number || '',
      address:
        (shipping?.address &&
          Object.values(shipping.address)
            .filter(Boolean)
            .join(', ')) ||
        '',
    },
    adminNotification: true,
    customerNotification: false,
  })

  return order
}


