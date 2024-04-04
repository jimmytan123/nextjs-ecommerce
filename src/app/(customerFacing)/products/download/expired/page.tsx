import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

export default function Expired() {
  return (
    <>
      <h1 className="text-4xl mb-4">Download Link Expired</h1>
      <p>
        Dear customer, you download link expired unfortunately. Please get a new
        link.
      </p>
      <Button asChild size="lg" className="mt-2">
        <Link href="/orders">Get New Link</Link>
      </Button>
    </>
  );
}
