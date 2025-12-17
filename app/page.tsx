import Link from 'next/link'
import HomeFeaturedProducts from '../components/HomeFeaturedProducts'

const HERO_IMAGE =
  process.env.NEXT_PUBLIC_HERO_IMAGE ||
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1800&q=80'

export default function Home() {
  return (
    <div className="space-y-14">
      <section
        className="relative overflow-hidden w-full min-h-[460px] sm:min-h-[520px] flex items-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
      >
        <div className="absolute inset-0 bg-black/45" />
        <div className="space-y-6 relative z-10 max-w-3xl px-4 sm:px-10">
          <span className="inline-flex items-center rounded-full bg-[#FFCC00] text-black px-3 py-1 text-xs font-semibold">
            Golden Feast · Fast-food favorites
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Fresh Burgers, Hot Pizzas & Crispy Fries — Delivered Fast!
          </h1>
          <p className="text-white/85 text-base sm:text-lg max-w-2xl">
            Smash burgers, loaded pizzas, golden fries, saucy wings, and ice-cold shakes.
            Tap order and we&apos;ll fire it up, fresh and fast.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-[#FFD400] px-6 py-2.75 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(0,0,0,0.2)] hover:bg-[#e6b800] transition"
            >
              Order Now
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white border border-white/15 hover:border-[#FFD400] transition"
            >
              View Menu
            </Link>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-xs sm:text-sm text-white/80 max-w-md">
            <div className="rounded-lg bg-white/10 p-3 shadow-sm border border-white/10">
              <dt className="font-semibold text-white">Hot & fresh</dt>
              <dd>Ready in 30–45 minutes</dd>
            </div>
            <div className="rounded-lg bg-white/10 p-3 shadow-sm border border-white/10">
              <dt className="font-semibold text-white">Secure checkout</dt>
              <dd>Stripe payments</dd>
            </div>
            <div className="rounded-lg bg-white/10 p-3 shadow-sm border border-white/10">
              <dt className="font-semibold text-white">Combo deals</dt>
              <dd>Save on meals & drinks</dd>
            </div>
          </dl>
        </div>
      </section>

      <HomeFeaturedProducts />

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Explore our menu
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: 'Pizzas',
              description: 'Cheesy classics and loaded specials.',
              slug: 'pizza',
              icon: '🍕',
            },
            {
              name: 'Burgers',
              description: 'Smash burgers, chicken stacks, veggie picks.',
              slug: 'burgers',
              icon: '🍔',
            },
            {
              name: 'Fries & Sides',
              description: 'Crispy fries, wings, nuggets, sauces.',
              slug: 'fries',
              icon: '🍟',
            },
            {
              name: 'Drinks & Shakes',
              description: 'Shakes, sodas, lemonades, iced tea.',
              slug: 'drinks',
              icon: '🥤',
            },
          ].map((cat) => (
            <Link
              key={cat.name}
              href={`/products?category=${encodeURIComponent(cat.slug)}`}
              className="group rounded-2xl border border-black/5 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,0,0,0.12)] hover:border-[#FFD400]"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="text-lg" aria-hidden>
                      {cat.icon}
                    </span>
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {cat.description}
                  </p>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FFD400]/20 text-[#FFD400] text-sm group-hover:bg-[#FFD400] group-hover:text-black shadow-inner">
                  →
                </span>
              </div>
            </Link>
          ))}
      </div>
    </section>
    </div>
  )
}
