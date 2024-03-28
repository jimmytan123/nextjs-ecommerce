import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// For shadcn/ui for classNames
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
