import db from '@/db/db';
import { notFound } from 'next/navigation';
import Stripe from 'stripe';
import CheckoutForm from './_components/CheckoutForm';

// Load Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

interface PurchasePageProps {
  params: { id: string };
}

export default async function PurchasePage({
  params: { id },
}: PurchasePageProps) {
  const product = await db.product.findUnique({ where: { id: id } });

  if (product == null) return notFound();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.priceInCents,
    currency: 'usd',
    metadata: { productId: product.id }, // inject custom metadata, will be used once payment successful
    automatic_payment_methods: {
      enabled: true,
    },
  });

  if (paymentIntent.client_secret === null) {
    throw Error('Stripe failed to create payment intent...');
  }

  return (
    <CheckoutForm
      product={product}
      clientSecret={paymentIntent.client_secret}
    />
  );
}
