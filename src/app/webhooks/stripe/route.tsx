import db from '@/db/db';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import PurchaseReceiptEmail from '@/email/PurchaseReceipt';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const resend = new Resend(process.env.RESEND_API_KEY as string);

// Stripe will push real-time event data to this webhook endpoint when events happen
export async function POST(req: NextRequest) {
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get('stripe-signature') as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    return new NextResponse(`Webhook Error: ${err}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    //https://docs.stripe.com/api/events/types#event_types-charge.succeeded
    case 'charge.succeeded':
      const charge = event.data.object;
      const productId = charge.metadata.productId; // provided manually by the metadata(when creating the payment indent)
      const discountCodeId = charge.metadata.discountCodeId; // from metadata
      const email = charge.billing_details.email;
      const pricePaidInCents = charge.amount;

      const product = await db.product.findUnique({ where: { id: productId } });
      if (product == null || email == null) {
        return new NextResponse('Bad Request', { status: 400 });
      }

      // Create a new user and add an order. If user exist, then add an order only
      const userFields = {
        email,
        orders: { create: { productId, pricePaidInCents, discountCodeId } },
      };

      // Create order
      const {
        orders: [order],
      } = await db.user.upsert({
        where: { email },
        create: userFields,
        update: userFields,
        select: { orders: { orderBy: { createdAt: 'desc' }, take: 1 } },
      });

      // Create downloadVerification
      const downloadVerification = await db.downloadVerification.create({
        data: {
          productId,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      });

      // Increase the discount code uses if being used
      if (discountCodeId != null) {
        await db.discountCode.update({
          where: { id: discountCodeId },
          data: { uses: { increment: 1 } },
        });
      }

      // Send Email to customer
      await resend.emails.send({
        from: `Support <${process.env.SENDER_EMAIL}>`,
        to: email,
        subject: 'Order Confirmation',
        react: (
          <PurchaseReceiptEmail
            order={order}
            product={product}
            downloadVerificationId={downloadVerification.id}
          />
        ),
      });

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new NextResponse();
}
