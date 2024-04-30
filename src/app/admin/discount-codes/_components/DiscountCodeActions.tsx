'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { startTransition, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  toggleDiscountCodeActive,
  deleteDiscountCode,
} from '../../_actions/discountCodes';

interface ActiveToggleDropdownItemProps {
  id: string;
  isActive: boolean;
}

// Component for toggle active state
export function ActiveToggleDropdownItem({
  id,
  isActive,
}: ActiveToggleDropdownItemProps) {
  // useTransition is a Hook that allows update the state without blocking the UI.
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await toggleDiscountCodeActive(id, !isActive);
          router.refresh();
        });
      }}
      className="cursor-pointer w-full"
    >
      {isActive ? 'Deactivate' : 'Activate'}
    </DropdownMenuItem>
  );
}

interface DeleteDropdownItemProps {
  id: string;
  disabled: boolean;
}

// Component for delete discount code
export function DeleteDropdownItem({ id, disabled }: DeleteDropdownItemProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <DropdownMenuItem
      variant="destructive"
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          await deleteDiscountCode(id);
          router.refresh();
        });
      }}
      className="cursor-pointer w-full"
    >
      Delete
    </DropdownMenuItem>
  );
}
