This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## .env File

To run the app, you have to create a .env file that contains the folling info:

```
DATABASE_URL="file:./dev.db"

ADMIN_USERNAME=<your user name for login admin pages>
HASHED_ADMIN_PASSWORD=<password in the hashed version>

STRIPE_SECRET_KEY=<stripe secret key>
STRIPE_WEBHOOK_SECRET=<stripe webhook secret key>
RESEND_API_KEY=<resend api key>
SENDER_EMAIL=onboarding@resend.dev

NEXT_PUBLIC_STRIPE_PUBLIC_KEY=<stripe public key>
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

```

## Stripe Webhook

To listen for Stripe webhook locally,

Install Stripe CLI, login
```
stripe login
```

Forword Stripe wehbook to our api handler:
```
stripe listen --forward-to localhost:3000/webhooks/stripe
```

