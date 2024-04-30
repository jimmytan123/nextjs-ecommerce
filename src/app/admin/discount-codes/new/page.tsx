import db from '@/db/db';
import PageHeader from '../../_components/PageHeader';
import DiscountCodeForm from '../_components/DiscountCodeForm';

export default async function NewDiscountCodePage() {
  // Query for a list of products
  const products = await db.product.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  return (
    <>
      <PageHeader>Add Discount Code</PageHeader>
      <DiscountCodeForm products={products} />
    </>
  );
}
