import db from '@/db/db';
import { DiscountCodeType, Prisma } from '@prisma/client';

// For Prisma query where
export function usableDiscountCodeWhere(productId: string) {
  return {
    isActive: true,
    AND: [
      {
        OR: [{ allProducts: true }, { products: { some: { id: productId } } }], // all products selected or it is valid for this product
      },
      {
        OR: [{ limit: null }, { limit: { gt: db.discountCode.fields.uses } }], // don't have limit or it has a limit but haven't use it all
      },
      {
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }], // don't have expiry date or it has but still valid
      },
    ],
  } satisfies Prisma.DiscountCodeWhereInput;
}

// For calcuating the discount amount
export function getDiscountedAmount(
  discountCode: {
    discountAmount: number;
    discountType: DiscountCodeType;
  },
  priceInCents: number
) {
  switch (discountCode.discountType) {
    case 'PERCENTAGE':
      return Math.max(
        1,
        Math.ceil(
          priceInCents - (priceInCents * discountCode.discountAmount) / 100
        )
      );
    case 'FIXED':
      return Math.max(
        1,
        Math.ceil(priceInCents - discountCode.discountAmount * 100)
      );
    default:
      throw new Error(
        `Invalid discount type ${discountCode.discountType satisfies never}`
      );
  }
}
