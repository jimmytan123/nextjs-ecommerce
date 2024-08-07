import { Suspense } from 'react';
import { ProductCardSkeleton } from '@/components/ProductCard';
import ProductCard from '@/components/ProductCard';
import db from '@/db/db';
import { cache } from '@/lib/cache';

// Get all available products from DB
const getProducts = cache(() => {
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { name: 'asc' },
  });
}, ['/products', 'getProducts']);

export default function ProductsPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Suspense
        fallback={
          <>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </>
        }
      >
        <ProductSuspense />
      </Suspense>
    </div>
  );
}

async function ProductSuspense() {
  const products = await getProducts();

  if (products.length === 0) return <p>No Products...</p>;

  return products.map((product) => {
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
  });
}
