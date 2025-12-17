    import '../app/styles.css'
    import Header from '../components/Header'
    import Footer from '../components/Footer'
    import type { ReactNode } from 'react'
import CartProvider from '../components/CartProvider'

    export const metadata = {
  title: 'Golden Feast | Fast Food Delivered',
  description: 'Fresh burgers, hot pizzas, crispy fries, and ice-cold drinks delivered fast.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#fff9e6] text-slate-900">
        <CartProvider>
        <Header />
          <main className="flex-grow w-full py-6 px-0 sm:px-2">{children}</main>
        <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
