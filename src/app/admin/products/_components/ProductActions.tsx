'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { startTransition, useTransition } from 'react';
import {
  toggleProductAvailability,
  deleteProduct,
} from '../../_actions/products';
import { useRouter } from 'next/navigation';

interface ActiveToggleDropdownItemProps {
  id: string;
  isAvailableForPurchase: boolean;
}

// Component
export function ActiveToggleDropdownItem({
  id,
  isAvailableForPurchase,
}: ActiveToggleDropdownItemProps) {
  // useTransition is a Hook that allows update the state without blocking the UI.
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await toggleProductAvailability(id, !isAvailableForPurchase);
          router.refresh();
        });
      }}
      className="cursor-pointer w-full"
    >
      {isAvailableForPurchase ? 'Deactivate' : 'Activate'}
    </DropdownMenuItem>
  );
}

interface DeleteDropdownItemProps {
  id: string;
  disabled: boolean;
}

// Component
export function DeleteDropdownItem({ id, disabled }: DeleteDropdownItemProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <DropdownMenuItem
      variant="destructive"
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          await deleteProduct(id);
          router.refresh();
        });
      }}
      className="cursor-pointer w-full"
    >
      Delete
    </DropdownMenuItem>
  );
}
