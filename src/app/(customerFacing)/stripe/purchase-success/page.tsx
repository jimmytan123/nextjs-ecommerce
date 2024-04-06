import Image from 'next/image';
import { formatCurrency } from '@/lib/formatters';
import Stripe from 'stripe';
import { notFound } from 'next/navigation';
import db from '@/db/db';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Load Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// SuccessPage - after Stripe redirect
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: {
    payment_intent: string;
  };
}) {
  // Fetches the payment intent status after payment submission
  const paymentIntent = await stripe.paymentIntents.retrieve(
    searchParams.payment_intent
  );

  if (paymentIntent.metadata.productId == null) return notFound();

  // Find product based on productId from the metadata of the paymentIntent
  const product = await db.product.findUnique({
    where: { id: paymentIntent.metadata.productId },
  });

  if (product == null) return notFound();

  const isSuccess = paymentIntent.status === 'succeeded';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold">
        {isSuccess ? 'Success!' : 'Error!'}
      </h1>
      <div className="flex gap-4 items-center">
        <div className="aspect-video flex-shrink-0 w-1/3 relative">
          <Image
            src={product.imagePath}
            alt={product.name}
            fill
            className="object-cover position-center"
          />
        </div>
        <div>
          <div className="text-lg">
            {formatCurrency(product.priceInCents / 100)}
          </div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="line-clamp-3 text-muted-foreground">
            {product.description}
          </div>
          <Button className="mt-4" size="lg" asChild>
            {isSuccess ? (
              <a
                href={`/products/download/${await createDownloadVerification(
                  product.id
                )}`}
              >
                Download
              </a>
            ) : (
              <Link href={`/products/${product.id}/purchase`}>Try Again</Link>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Create download verification after receiving the successful paymentIntent status
async function createDownloadVerification(productId: string) {
  return (
    await db.downloadVerification.create({
      data: {
        productId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // last for 24 hrs
      },
    })
  ).id;
}
