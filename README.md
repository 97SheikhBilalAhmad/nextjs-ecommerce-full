# Next.js E-commerce (TypeScript) — Starter Scaffold

## Features
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- MongoDB (Mongoose) models
- JWT authentication (register/login)
- Product CRUD (admin)
- Reviews & inventory fields
- Stripe checkout endpoint (server-side)

## Environment variables
Create a `.env.local` file in the project root with:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Run locally
```bash
npm install
npm run dev
```

## Notes
- This is a scaffold to get you started. Replace placeholders and test using Stripe test keys.
- I will help you extend any part: admin UI, payment flow, order management, deployment.
