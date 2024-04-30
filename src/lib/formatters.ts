import { DiscountCodeType } from '@prisma/client';

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
  minimumFractionDigits: 0,
});

const NUMBER_FORMATTER = new Intl.NumberFormat('en-US');

const PERCENT_FORMATTER = new Intl.NumberFormat('en-US', { style: 'percent' });

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount);
}

export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number);
}

export function formatDiscountCode({
  discountAmount,
  discountType,
}: {
  discountAmount: number;
  discountType: DiscountCodeType;
}) {
  switch (discountType) {
    case 'PERCENTAGE':
      return PERCENT_FORMATTER.format(discountAmount / 100);
    case 'FIXED':
      return CURRENCY_FORMATTER.format(discountAmount);
    default:
      // https://stackoverflow.com/a/75217377/5357917
      throw new Error(
        `Invalid discount code type: ${discountType satisfies never}`
      );
  }
}

export function formatDateTime(date: Date) {
  return DATE_TIME_FORMATTER.format(date);
}
