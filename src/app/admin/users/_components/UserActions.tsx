'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { startTransition, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteUser } from '../../_actions/users';

interface DeleteDropdownItemProps {
  id: string;
}
export function DeleteDropdownItem({ id }: DeleteDropdownItemProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <DropdownMenuItem
      variant="destructive"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await deleteUser(id);
          router.refresh();
        })
      }
    >
      Delete
    </DropdownMenuItem>
  );
}
