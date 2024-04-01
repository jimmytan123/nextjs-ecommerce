'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';
import * as actions from '../../_actions/products';
import { useFormState, useFormStatus } from 'react-dom';
import { Product } from '@prisma/client';
import Image from 'next/image';

interface ProductFormProps {
  product?: Product | null;
}

export default function ProductForm({ product }: ProductFormProps) {
  const [error, action] = useFormState(
    product == null
      ? actions.addProduct
      : actions.updateProduct.bind(null, product.id),
    {}
  );
  const [priceInCents, setPriceIncents] = useState<number | undefined>(
    product?.priceInCents
  );

  return (
    <form action={action} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={product?.name || ''}
        />
        {error.name && (
          <div className="text-destructive-foreground bg-destructive p-2 rounded text-sm">
            {error.name}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="priceInCents">Price(In Cents)</Label>
        <Input
          type="number"
          id="priceInCents"
          name="priceInCents"
          required
          value={priceInCents}
          onChange={(e) => setPriceIncents(Number(e.target.value) || undefined)}
        />
        <div className="text-muted-foreground">
          {formatCurrency((priceInCents || 0) / 100)}
        </div>
        {error.priceInCents && (
          <div className="text-destructive-foreground bg-destructive p-2 rounded text-sm">
            {error.priceInCents}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={product?.description}
        />
        {error.description && (
          <div className="text-destructive-foreground bg-destructive p-2 rounded text-sm">
            {error.description}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <Input
          type="file"
          id="file"
          name="file"
          required={product == null}
          className="cursor-pointer"
        />
        {product != null && (
          <div className="text-muted-foreground text-sm">
            {product.filePath}
          </div>
        )}
        {error.file && (
          <div className="text-destructive-foreground bg-destructive p-2 rounded text-sm">
            {error.file}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input
          type="file"
          id="image"
          name="image"
          required={product == null}
          className="cursor-pointer"
        />
        {product != null && (
          <>
            <p className="text-sm text-muted-foreground">Existing Image: </p>
            <Image
              src={product.imagePath}
              height="300"
              width="300"
              alt="product image"
            />
          </>
        )}
        {error.image && (
          <div className="text-destructive-foreground bg-destructive p-2 rounded text-sm">
            {error.image}
          </div>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save'}
    </Button>
  );
}
