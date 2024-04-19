import db from '@/db/db';
import { notFound } from 'next/navigation';
import Stripe from 'stripe';
import CheckoutForm from './_components/CheckoutForm';
import { usableDiscountCodeWhere } from '@/lib/discountCodeHelper';

// Load Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

interface PurchasePageProps {
  params: { id: string };
  searchParams: { coupon?: string };
}

export default async function PurchasePage({
  params: { id },
  searchParams: { coupon },
}: PurchasePageProps) {
  // Find the product based on the id from the URL params
  const product = await db.product.findUnique({ where: { id: id } });

  if (product == null) return notFound();

  // Find discount code in DB by the search params ?coupon=<>
  const discountCode =
    coupon == null ? undefined : await getDiscountCode(coupon, product.id);

  // Create a payment intent object from Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.priceInCents,
    currency: 'usd',
    metadata: { productId: product.id }, // inject custom metadata, will be used once payment successful to look for product (https://docs.stripe.com/api/metadata)
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
      discountCode={discountCode || undefined}
    />
  );
}

function getDiscountCode(coupon: string, productId: string) {
  return db.discountCode.findUnique({
    where: { ...usableDiscountCodeWhere(productId), code: coupon },
    select: { id: true, discountAmount: true, discountType: true },
  });
}
