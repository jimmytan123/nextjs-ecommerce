'use server';

import { coerce, z } from 'zod';
import db from '@/db/db';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { DiscountCodeType } from '@prisma/client';

// Zod schema for adding discount code(all input fields from the form)
const addSchema = z
  .object({
    code: z.string().min(1),
    discountAmount: z.coerce.number().int().min(1),
    discountType: z.nativeEnum(DiscountCodeType),
    allProducts: z.coerce.boolean(),
    productIds: z.array(z.string()).optional(),
    expiresAt: z.preprocess(
      (value) => (value === '' ? undefined : value), // If empty string(no date input, convert to undefined)
      z.coerce.date().min(new Date()).optional()
    ),
    limit: z.preprocess(
      (value) => (value === '' ? undefined : value), // If empty string(no limit input, convert to undefined)
      z.coerce.number().int().min(1).optional()
    ),
  })
  .refine(
    // Custom validation logic. Any truthy value will pass the validation
    (data) =>
      data.discountAmount <= 100 ||
      data.discountType !== DiscountCodeType.PERCENTAGE,
    {
      path: ['discountAmount'], // appended to error path
      message: 'Percentage discount must be less than or equal to 100', // override error message
    }
  )
  .refine((data) => !data.allProducts || data.productIds == null, {
    path: ['productIds'],
    message: 'Cannot select products when all products is selected', // override error message
  })
  .refine((data) => data.allProducts || data.productIds != null, {
    path: ['productIds'],
    message: 'Must select products when All Products is not selected', // override error message
  });

export async function addDiscountCode(prevState: unknown, formData: FormData) {
  const productIds = formData.getAll('productIds');

  const result = addSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    productIds: productIds.length > 0 ? productIds : undefined,
  });

  // If validation fails, returns errors
  if (result.success === false) {
    // console.log(result.error.formErrors.fieldErrors);
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  await db.discountCode.create({
    data: {
      code: data.code,
      discountAmount: data.discountAmount,
      discountType: data.discountType,
      allProducts: data.allProducts,
      products:
        data.productIds !== null
          ? { connect: data.productIds?.map((id) => ({ id: id })) } // If I have product ids, connect the current products to the new discount code created
          : undefined,
      expiresAt: data.expiresAt,
      limit: data.limit,
    },
  });

  redirect('/admin/discount-codes');
}

export async function toggleDiscountCodeActive(id: string, isActive: boolean) {
  await db.discountCode.update({
    where: { id },
    data: {
      isActive,
    },
  });
}

export async function deleteDiscountCode(id: string) {
  const discountCode = await db.discountCode.delete({ where: { id } });

  if (!discountCode) return notFound();

  return discountCode;
}
