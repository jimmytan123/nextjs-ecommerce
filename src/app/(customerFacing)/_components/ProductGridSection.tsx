import { Product } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

interface ProductGridSectionProps {
  productsFetcher: () => Promise<Product[]>;
  title: string;
}

export default async function ProductGridSection({
  productsFetcher,
  title,
}: ProductGridSectionProps) {
  const products = await productsFetcher();

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button asChild variant="outline">
          <Link href="/products" className="space-x-2">
            <span>View All</span>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          return (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              priceInCents={product.priceInCents}
              imagePath={product.imagePath}
            />
          );
        })}
      </div>
    </div>
  );
}
