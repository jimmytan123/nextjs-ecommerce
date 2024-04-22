'use server';

import db from '@/db/db';
import { z } from 'zod';
import { Resend } from 'resend';
import OrderHistoryEmail from '@/email/OrderHistory';
import {
  getDiscountedAmount,
  usableDiscountCodeWhere,
} from '@/lib/discountCodeHelper';
import Stripe from 'stripe';

const resend = new Resend(process.env.RESEND_API_KEY as string);

const emailSchema = z.string().email();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function emailOrderHistory(
  prevState: unknown,
  formData: FormData
): Promise<{ message?: string; error?: string }> {
  const result = emailSchema.safeParse(formData.get('email'));

  if (result.success === false) {
    return { error: 'Invalid email address' };
  }

  const user = await db.user.findUnique({
    where: { email: result.data },
    select: {
      email: true,
      orders: {
        select: {
          pricePaidInCents: true,
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (user === null) {
    // For security concern, here display a more generic error message
    return {
      message:
        'Check your email to view your order history and download your prodcuts.',
    };
  }

  const orders = user.orders.map(async (order) => {
    return {
      ...order,
      downloadVerificationId: (
        await db.downloadVerification.create({
          data: {
            expiresAt: new Date(Date.now() + 24 * 1000 * 60 * 60),
            productId: order.product.id,
          },
        })
      ).id,
    };
  });

  const data = await resend.emails.send({
    from: `Support <${process.env.SENDER_EMAIL}>`,
    to: user.email,
    subject: 'Order History',
    react: <OrderHistoryEmail orders={await Promise.all(orders)} />,
  });

  if (data.error) {
    return {
      error:
        'There was an error when sending your email. Please try again later.',
    };
  }

  return {
    message:
      'Check your email to view your order history and download your prodcuts.',
  };
}

export async function createPaymentIntent(
  email: string,
  productId: string,
  discountCodeId?: string
) {
  const product = await db.product.findUnique({ where: { id: productId } });

  if (!product) return { error: 'Unexpected Error' };

  const discountCode =
    discountCodeId == null
      ? null
      : await db.discountCode.findUnique({
          where: { id: discountCodeId, ...usableDiscountCodeWhere(productId) },
        });

  // To handle the situation that user enterned the coupon(still valid), and stay in the checkout page for a while, when user actually click submit the form, check coupon code validaility again in case it expires
  if (discountCode == null && discountCodeId != null) {
    return { error: 'Coupon has expired' };
  }

  // Check for existing order for the current user
  const existingOrder = await db.order.findFirst({
    where: { user: { email }, productId },
    select: { id: true },
  });

  if (existingOrder) {
    return {
      error:
        'You have already purchased this product. Try downloading it from the My Orders page',
    };
  }

  const amount =
    discountCode == null
      ? product.priceInCents
      : getDiscountedAmount(discountCode, product.priceInCents);

  // Create a payment intent object from Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    metadata: {
      productId: product.id,
      discountCodeId: discountCode?.id || null,
    }, // inject custom metadata, will be used once payment successful to look for product (https://docs.stripe.com/api/metadata)
    automatic_payment_methods: {
      enabled: true,
    },
  });

  if (paymentIntent.client_secret === null) {
    return {
      error: 'Stripe failed to create payment intent...',
    };
  }

  return { clientSecret: paymentIntent.client_secret };
}
