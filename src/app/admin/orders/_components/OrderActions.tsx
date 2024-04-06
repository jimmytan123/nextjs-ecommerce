'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { startTransition, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteOrder } from '../../_actions/orders';

interface DeleteDropdownItemProps {
  id: string;
}

// Component
export function DeleteDropdownItem({ id }: DeleteDropdownItemProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <DropdownMenuItem
      variant="destructive"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await deleteOrder(id);
          router.refresh();
        })
      }
    >
      Delete
    </DropdownMenuItem>
  );
}
