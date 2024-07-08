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

  // Find discount code in DB by the search params ?coupon=<> (optional)
  const discountCode =
    coupon == null ? undefined : await getDiscountCode(coupon, product.id);

  return (
    <CheckoutForm product={product} discountCode={discountCode || undefined} />
  );
}

function getDiscountCode(coupon: string, productId: string) {
  return db.discountCode.findUnique({
    where: { ...usableDiscountCodeWhere(productId), code: coupon },
    select: { id: true, discountAmount: true, discountType: true },
  });
}
