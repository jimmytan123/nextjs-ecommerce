'use server';

import { z } from 'zod';
import fs from 'fs/promises';
import db from '@/db/db';
import { notFound, redirect } from 'next/navigation';

// Custom schema type(File & Image) with the help of ZOD
const fileScehma = z.instanceof(File, { message: 'Required' });
const imageScehma = fileScehma.refine(
  (file) => file.size === 0 || file.type.startsWith('image/')
);

const addSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  priceInCents: z.coerce.number().int().min(1), // Price needs to convert to number first
  file: fileScehma.refine((file) => file.size > 0, 'Required'), // File size have to greater than 0
  image: imageScehma.refine((file) => file.size > 0, 'Required'),
});

export async function addProduct(prevState: unknown, formData: FormData) {
  const formDataObj = Object.fromEntries(formData.entries());

  const result = addSchema.safeParse(formDataObj);

  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }

  // For saving the file path via the File system (root dir products folder)
  await fs.mkdir('products', { recursive: true });
  const filePath = `products/${crypto.randomUUID()}-${result.data.file.name}`;
  await fs.writeFile(
    filePath,
    Buffer.from(await result.data.file.arrayBuffer())
  );

  // For saving the images via the File system (under public/products folder)
  await fs.mkdir('public/products', { recursive: true });
  const imagePath = `/products/${crypto.randomUUID()}-${
    result.data.image.name
  }`;
  await fs.writeFile(
    `public${imagePath}`,
    Buffer.from(await result.data.image.arrayBuffer())
  );

  // TODO: error handling
  await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: result.data.name,
      description: result.data.description,
      priceInCents: result.data.priceInCents,
      filePath,
      imagePath,
    },
  });

  redirect('/admin/products');
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.product.update({
    where: { id: id },
    data: {
      isAvailableForPurchase,
    },
  });
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({
    where: { id: id },
  });

  if (product == null) return notFound();

  // Delete file and image when delete the product
  await fs.unlink(product.filePath);
  await fs.unlink(`public${product.imagePath}`);
}

const editSchema = addSchema.extend({
  file: fileScehma.optional(),
  image: imageScehma.optional(),
});

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  const formDataObj = Object.fromEntries(formData.entries());

  const result = editSchema.safeParse(formDataObj);

  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;
  const product = await db.product.findUnique({ where: { id: id } });

  if (product == null) return notFound();

  let filePath = product.filePath;
  if (data.file != null && data.file.size > 0) {
    // Remove old file
    await fs.unlink(product.filePath);

    // Update the new file path and save
    filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
  }

  let imagePath = product.imagePath;
  if (data.image != null && data.image.size > 0) {
    //Remove the old image
    await fs.unlink(`public${product.imagePath}`);

    // Update the new image path and save
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer())
    );
  }

  // TODO: error handling
  await db.product.update({
    where: { id: id },
    data: {
      name: result.data.name,
      description: result.data.description,
      priceInCents: result.data.priceInCents,
      filePath,
      imagePath,
    },
  });

  redirect('/admin/products');
}
