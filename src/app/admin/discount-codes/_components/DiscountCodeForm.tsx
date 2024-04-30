'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import * as actions from '../../_actions/discountCodes';
import { useFormState, useFormStatus } from 'react-dom';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DiscountCodeType } from '@prisma/client';
import { Checkbox } from '@/components/ui/checkbox';

interface DiscountCodeFormProps {
  products: {
    name: string;
    id: string;
  }[];
}

export default function DiscountCodeForm({ products }: DiscountCodeFormProps) {
  const [error, action] = useFormState(actions.addDiscountCode, {});
  const [allProductsChecked, setAllProductsChecked] = useState(true);
  
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());

  return (
    <form action={action} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input type="text" id="code" name="code" required />
        {error.code && (
          <div className="text-destructive-foreground bg-destructive p-2 rounded text-sm">
            {error.code}
          </div>
        )}
      </div>
      <div className="space-y-2 flex flex-row gap-8 items-baseline">
        <div className="space-y-2">
          <Label htmlFor="discount-type">Discount Type</Label>
          <RadioGroup
            defaultValue={DiscountCodeType.PERCENTAGE}
            id="discountType"
            name="discountType"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                value={DiscountCodeType.PERCENTAGE}
                id="percentage"
              />
              <Label htmlFor="percentage">Percentage</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value={DiscountCodeType.FIXED} id="fixed" />
              <Label htmlFor="fixed">Fixed</Label>
            </div>
          </RadioGroup>
          {error.discountType && (
            <div className="text-destructive-foreground bg-destructive p-2 rounded text-sm">
              {error.discountType}
            </div>
          )}
        </div>
        <div className="space-y-2 flex-grow">
          <Label htmlFor="discountAmount">Discount Amount</Label>
          <Input
            type="number"
            id="discountAmount"
            name="discountAmount"
            required
          />
          {error.discountAmount && (
            <div className="text-destructive-foreground bg-destructive p-2 rounded text-sm">
              {error.discountAmount}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="limit">Limit</Label>
        <Input type="number" id="limit" name="limit" />
        <div className="text-muted-foreground">
          Leave blank for infinite uses
        </div>
        {error.limit && (
          <div className="text-destructive-foreground bg-destructive p-2 rounded text-sm">
            {error.limit}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="expiresAt">Expiration</Label>
        <Input
          className="w-max"
          type="datetime-local"
          id="expiresAt"
          name="expiresAt"
          min={today.toJSON().split(':').slice(0, -1).join(':')}
        />
        <div className="text-muted-foreground">
          Leave blank for no expiration
        </div>
        {error.expiresAt && (
          <div className="text-destructive-foreground bg-destructive p-2 rounded text-sm">
            {error.expiresAt}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label>Allowed Product</Label>
        {error.allProducts && (
          <div className="text-destructive-foreground bg-destructive p-2 rounded text-sm">
            {error.allProducts}
          </div>
        )}
        {error.productIds && (
          <div className="text-destructive-foreground bg-destructive p-2 rounded text-sm">
            {error.productIds}
          </div>
        )}
        <div className="flex gap-2 items-center">
          <Checkbox
            id="allProducts"
            name="allProducts"
            checked={allProductsChecked}
            onCheckedChange={(e) => setAllProductsChecked(e === true)}
          />
          <Label htmlFor="allProducts">All Products</Label>
        </div>
        {products.map((product) => {
          return (
            <div key={product.id} className="flex gap-2 items-center">
              <Checkbox
                id={product.id}
                name="productIds"
                value={product.id}
                disabled={allProductsChecked}
              />
              <Label htmlFor={product.id}>{product.name}</Label>
            </div>
          );
        })}
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
