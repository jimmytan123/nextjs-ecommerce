import db from '@/db/db';
import ProductGridSection from './_components/ProductGridSection';

function getMostPopularProducts() {
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
}

function getNewestProducts() {
  return db.product.findMany({
    where: {
      isAvailableForPurchase: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 6,
  });
}

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
