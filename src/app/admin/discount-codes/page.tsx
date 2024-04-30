import PageHeader from '../_components/PageHeader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import db from '@/db/db';
import {
  CheckCircle2,
  Globe,
  Infinity,
  Minus,
  MoreVertical,
  XCircle,
} from 'lucide-react';
import { Prisma } from '@prisma/client';
import {
  formatDateTime,
  formatDiscountCode,
  formatNumber,
} from '@/lib/formatters';
import {
  ActiveToggleDropdownItem,
  DeleteDropdownItem,
} from './_components/DiscountCodeActions';

/*
 * If limit not equal to null, and it is less than and equal to the actual uses
 * OR: If expiresAt not equal null, and it is less than and equal to the current date
 */
const WHERE_EXPIRED: Prisma.DiscountCodeWhereInput = {
  OR: [
    { limit: { not: null, lte: db.discountCode.fields.uses } },
    { expiresAt: { not: null, lte: new Date() } },
  ],
};

// Prisma select fields for discount codes query
const SELECT_FIELDS: Prisma.DiscountCodeSelect = {
  id: true,
  allProducts: true,
  code: true,
  discountAmount: true,
  discountType: true,
  expiresAt: true,
  limit: true,
  uses: true,
  isActive: true,
  products: { select: { name: true } },
  _count: { select: { orders: true } },
};

function getExpiredDiscountCodes() {
  return db.discountCode.findMany({
    select: SELECT_FIELDS,
    where: WHERE_EXPIRED,
    orderBy: { createdAt: 'asc' },
  });
}

function getUnexpiredDiscountCodes() {
  return db.discountCode.findMany({
    select: SELECT_FIELDS,
    where: { NOT: WHERE_EXPIRED },
    orderBy: { createdAt: 'asc' },
  });
}

export default async function DiscountCodesPage() {
  // Fetching discount codes
  const [expiredDiscountCodes, unexpiredDiscountCodes] = await Promise.all([
    getExpiredDiscountCodes(),
    getUnexpiredDiscountCodes(),
  ]);

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <PageHeader>Coupons</PageHeader>
        <Button asChild>
          <Link href="/admin/discount-codes/new">Add Coupon</Link>
        </Button>
      </div>
      <DiscountCodesTable
        discountCodes={unexpiredDiscountCodes}
        canDeactivate={true}
      />

      <div className="mt-8">
        <h2 className="text-xl font-bold">Expired Coupons</h2>
        <DiscountCodesTable
          discountCodes={expiredDiscountCodes}
          isInactive={true}
        />
      </div>
    </>
  );
}

interface DiscountCodesTableProps {
  discountCodes: Awaited<ReturnType<typeof getUnexpiredDiscountCodes>>;
  isInactive?: boolean;
  canDeactivate?: boolean;
}

async function DiscountCodesTable({
  discountCodes,
  isInactive = false,
  canDeactivate = false,
}: DiscountCodesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-0">
            <span className="sr-only">Is Active</span>
          </TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Remaining Uses</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead>Products</TableHead>
          <TableHead className="w-0">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {discountCodes.map((discountCode) => {
          return (
            <TableRow key={discountCode.id}>
              <TableCell>
                {discountCode.isActive && !isInactive ? (
                  <>
                    <CheckCircle2 />
                    <span className="sr-only">Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="stroke-destructive" />
                    <span className="sr-only">Inactive</span>
                  </>
                )}
              </TableCell>
              <TableCell>{discountCode.code}</TableCell>
              <TableCell>{formatDiscountCode(discountCode)}</TableCell>
              <TableCell>
                {discountCode.expiresAt === null ? (
                  <Minus />
                ) : (
                  formatDateTime(discountCode.expiresAt)
                )}
              </TableCell>
              <TableCell>
                {discountCode.limit === null ? (
                  <Infinity />
                ) : (
                  formatNumber(discountCode.limit - discountCode.uses) // Calculate the remaining uses
                )}
              </TableCell>
              <TableCell>{formatNumber(discountCode._count.orders)}</TableCell>
              <TableCell>
                {discountCode.allProducts === true ? (
                  <Globe />
                ) : (
                  discountCode.products
                    .map((product) => product.name)
                    .join(', ')
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical />
                    <span className="sr-only">Actions</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {canDeactivate && (
                      <>
                        <ActiveToggleDropdownItem
                          id={discountCode.id}
                          isActive={discountCode.isActive}
                        />
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DeleteDropdownItem
                      id={discountCode.id}
                      disabled={discountCode._count.orders > 0}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
