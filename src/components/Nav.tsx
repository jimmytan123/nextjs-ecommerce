'use client';

import { ReactNode, ComponentProps } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavProps {
  children: ReactNode;
}

export function Nav({ children }: NavProps) {
  return (
    <nav className="bg-primary text-primary-foreground flex justify-center px-4">
      {children}
    </nav>
  );
}

// Omit - Constructs a type by picking all properties(<Link> props) from Type and then removing Keys('className')
type NavLinkProps = Omit<ComponentProps<typeof Link>, 'className'>;

export function NavLink(props: NavLinkProps) {
  const pathName = usePathname();

  return (
    <Link
      {...props}
      className={cn(
        'p-4 hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary focus-visible:text-secondary-foreground',
        pathName === props.href && 'bg-background text-foreground'
      )}
    />
  );
}
