export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-black mt-8">
      <div className="w-full py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs px-2 sm:px-3">
        <p className="text-white font-semibold">
          © {new Date().getFullYear()} Golden Feast. All rights reserved.
        </p>
        <div className="flex gap-4 text-white/80">
          <span className="hover:text-[#FFCC00] transition-colors">
            Fast, fresh, and delicious.
          </span>
          <span className="hidden sm:inline hover:text-[#FFCC00] transition-colors">
            Powered by Next.js
          </span>
        </div>
      </div>
    </footer>
  )
}
