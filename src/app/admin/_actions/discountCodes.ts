'use server';

import { z } from 'zod';
import db from '@/db/db';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Zod schema for adding discount code
const addSchema = z.object({});

export async function addDiscountCode(prevState: unknown, formData: FormData) {
  return {};
}
