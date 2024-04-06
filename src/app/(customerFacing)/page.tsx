import db from '@/db/db';
import ProductGridSection from './_components/ProductGridSection';
import { cache } from '@/lib/cache';

// Fetching most popular products, wrapped by the custom cache function, revalidate for 24 hours
const getMostPopularProducts = cache(
  () => {
    return db.product.findMany({
      where: {
        isAvailableForPurchase: true,
      },
      orderBy: {
        orders: {
          _count: 'desc',
        },
      },
      take: 6,
    });
  },
  ['/', 'getMostPopularProducts'],
  { revalidate: 60 * 60 * 24 }
);

// Fetching newest products, wrapped by the custom cache function, revalidate for 24 hours
const getNewestProducts = cache(
  () => {
    return db.product.findMany({
      where: {
        isAvailableForPurchase: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
    });
  },
  ['/', 'getNewestProducts'],
  { revalidate: 60 * 60 * 24 }
);

export default function HomePage() {
  return (
    <main className="space-y-12">
      <ProductGridSection
        productsFetcher={getMostPopularProducts}
        title="Most Popular"
      />
      <ProductGridSection productsFetcher={getNewestProducts} title="Newest" />
    </main>
  );
}
