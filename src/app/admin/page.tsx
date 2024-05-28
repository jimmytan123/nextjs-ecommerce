import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ChartCard from './_components/ChartCard';
import db from '@/db/db';
import { formatCurrency, formatDate, formatNumber } from '@/lib/formatters';
import OrdersByDayChart from './_components/charts/OrdersByDayChart';
import UsersByDayChart from './_components/charts/UsersByDayChart';
import RevenueByProductChart from './_components/charts/RevenueByProductChart';
import { Prisma } from '@prisma/client';
import {
  interval,
  eachDayOfInterval,
  startOfDay,
  differenceInDays,
  differenceInWeeks,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  max,
  min,
  differenceInMonths,
  eachMonthOfInterval,
  eachYearOfInterval,
} from 'date-fns';
import { RANGE_OPTIONS, getRangeOption } from '@/lib/rangeOptions';
import { array, date } from 'zod';

async function getSalesData(
  createdAfter: Date | null,
  createdBefore: Date | null
) {
  // Create a query for finding chart data if any date range params exists
  const createdAtQuery: Prisma.OrderWhereInput['createdAt'] = {};
  if (createdAfter) createdAtQuery.gte = createdAfter;
  if (createdBefore) createdAtQuery.lte = createdBefore;

  const [data, chartData] = await Promise.all([
    db.order.aggregate({
      _sum: { pricePaidInCents: true },
      _count: true,
    }),
    db.order.findMany({
      select: { createdAt: true, pricePaidInCents: true },
      where: { createdAt: createdAtQuery },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // Construct an array of dates for the given range, with each day's total sales as 0
  const { array, format } = getChartDateArray(
    createdAfter || startOfDay(chartData[0].createdAt),
    createdBefore || new Date()
  );

  const dayArray = array.map((date) => {
    return {
      date: format(date),
      totalSales: 0,
    };
  });

  return {
    // Reduce function: Taking all orders, totaling all the sales for each individual date
    chartData: chartData.reduce((data, order) => {
      const formattedDate = format(order.createdAt);

      // Find the current date entry we are interested in(working on)
      const entry = dayArray.find((day) => day.date === formattedDate);

      if (entry == null) return data;

      // Update the total sales in that date, add to the data
      entry.totalSales += order.pricePaidInCents / 100;

      return data;
    }, dayArray),
    amount: (data._sum.pricePaidInCents || 0) / 100,
    numberofSales: data._count,
  };
}

async function getUserData(
  createdAfter: Date | null,
  createdBefore: Date | null
) {
  // Create a query for finding chart data if any date range params exists
  const createdAtQuery: Prisma.UserWhereInput['createdAt'] = {};
  if (createdAfter) createdAtQuery.gte = createdAfter;
  if (createdBefore) createdAtQuery.lte = createdBefore;

  const [userCount, orderData, chartData] = await Promise.all([
    db.user.count(),
    db.order.aggregate({
      _sum: { pricePaidInCents: true },
    }),
    db.user.findMany({
      select: { createdAt: true },
      where: { createdAt: createdAtQuery },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const { array, format } = getChartDateArray(
    createdAfter || startOfDay(chartData[0].createdAt),
    createdBefore || new Date()
  );

  const dayArray = array.map((date) => {
    return {
      date: format(date),
      totalUsers: 0,
    };
  });

  return {
    chartData: chartData.reduce((data, user) => {
      const formattedDate = format(user.createdAt);

      // Find the current date entry we are interested in(working on)
      const entry = dayArray.find((day) => day.date === formattedDate);

      if (entry == null) return data;

      entry.totalUsers += 1;

      return data;
    }, dayArray),
    userCount: userCount,
    averageValuePerUser:
      userCount === 0
        ? 0
        : (orderData._sum.pricePaidInCents || 0) / userCount / 100,
  };
}

async function getProductData(
  createdAfter: Date | null,
  createdBefore: Date | null
) {
  const createdAtQuery: Prisma.OrderWhereInput['createdAt'] = {};
  if (createdAfter) createdAtQuery.gte = createdAfter;
  if (createdBefore) createdAtQuery.lte = createdBefore;

  const [activeProductsCount, inactiveProductsCount, chartData] =
    await Promise.all([
      db.product.count({ where: { isAvailableForPurchase: true } }),
      db.product.count({ where: { isAvailableForPurchase: false } }),
      db.product.findMany({
        select: {
          name: true,
          orders: {
            select: { pricePaidInCents: true },
            where: { createdAt: createdAtQuery },
          },
        },
      }),
    ]);

  return {
    chartData: chartData
      .map((product) => {
        return {
          name: product.name,
          revenue: product.orders.reduce((sum, order) => {
            return sum + order.pricePaidInCents / 100;
          }, 0), // Sum the every order amount for that individual product
        };
      })
      .filter((product) => product.revenue > 0), // Not showing the product to the chart if no revenue
    activeProductsCount,
    inactiveProductsCount,
  };
}

interface AdminDashboardProps {
  searchParams: {
    totalSalesRange?: string;
    totalSalesRangeFrom?: string;
    totalSalesRangeTo?: string;
    newCustomersRange?: string;
    newCustomersFrom?: string;
    newCustomersTo?: string;
    revenueByProductRange?: string;
    revenueByProductRangeFrom?: string;
    revenueByProductRangeTo?: string;
  };
}

export default async function AdminDashboard({
  searchParams: {
    totalSalesRange,
    totalSalesRangeFrom,
    totalSalesRangeTo,
    newCustomersRange,
    newCustomersFrom,
    newCustomersTo,
    revenueByProductRange,
    revenueByProductRangeFrom,
    revenueByProductRangeTo,
  },
}: AdminDashboardProps) {
  // Obtain the range obtion based on the search params through props, defaulted to last 7 days/all time option if there is no search params
  const totalSalesRangeOption =
    getRangeOption(totalSalesRange, totalSalesRangeFrom, totalSalesRangeTo) ||
    RANGE_OPTIONS.last_7_days;

  const newCustomersRangeOption =
    getRangeOption(newCustomersRange, newCustomersFrom, newCustomersTo) ||
    RANGE_OPTIONS.last_7_days;

  const revenueByProductRangeOption =
    getRangeOption(
      revenueByProductRange,
      revenueByProductRangeFrom,
      revenueByProductRangeTo
    ) || RANGE_OPTIONS.all_time;

  const [salesData, userData, productData] = await Promise.all([
    getSalesData(
      totalSalesRangeOption.startDate,
      totalSalesRangeOption.endDate
    ),
    getUserData(
      newCustomersRangeOption.startDate,
      newCustomersRangeOption.endDate
    ),
    getProductData(
      revenueByProductRangeOption.startDate,
      revenueByProductRangeOption.endDate
    ),
  ]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Sales"
          subtitle={`${formatNumber(salesData.numberofSales)} Orders`}
          body={formatCurrency(salesData.amount)}
        />
        <DashboardCard
          title="Customers"
          subtitle={`${formatCurrency(
            userData.averageValuePerUser
          )} Average Value`}
          body={formatNumber(userData.userCount)}
        />
        <DashboardCard
          title="Active Products"
          subtitle={`${formatNumber(
            productData.inactiveProductsCount
          )} Inactive ${
            productData.inactiveProductsCount > 1 ? 'Products' : 'Product'
          } `}
          body={formatNumber(productData.activeProductsCount)}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
        <ChartCard
          title="Total Sales"
          queryKey="totalSalesRange"
          selectedRangeLabel={totalSalesRangeOption.label}
        >
          <OrdersByDayChart data={salesData.chartData} />
        </ChartCard>
        <ChartCard
          title="New Customers"
          queryKey="newCustomersRange"
          selectedRangeLabel={newCustomersRangeOption.label}
        >
          <UsersByDayChart data={userData.chartData} />
        </ChartCard>
        <ChartCard
          title="Revenue By Product"
          queryKey="revenueByProductRange"
          selectedRangeLabel={revenueByProductRangeOption.label}
        >
          <RevenueByProductChart data={productData.chartData} />
        </ChartCard>
      </div>
    </>
  );
}

interface DashboardCardProps {
  title: string;
  subtitle: string;
  body: string;
}

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
    </Card>
  );
}

// Return the array of dates within the specified time interval conditionally.
function getChartDateArray(startDate: Date, endDate: Date = new Date()) {
  // Obtain the days range
  const days = differenceInDays(endDate, startDate);

  // If date range is less than 30 days, return an object with date array by each day and a format function
  if (days < 30) {
    return {
      array: eachDayOfInterval(interval(startDate, endDate)),
      format: formatDate,
    };
  }

  // If range is more than 30 days, less than 30 weeks, display by week
  const weeks = differenceInWeeks(endDate, startDate);
  if (weeks < 30) {
    return {
      array: eachWeekOfInterval(interval(startDate, endDate)),
      format: (date: Date) => {
        const start = max([startOfWeek(date), startDate]);
        const end = min([endOfWeek(date), endDate]);

        return `${formatDate(start)} - ${formatDate(end)}`;
      },
    };
  }

  // If range is more than 30 weeks, less than 30 months, display by month
  const months = differenceInMonths(endDate, startDate);
  if (months < 30) {
    return {
      array: eachMonthOfInterval(interval(startDate, endDate)),
      format: new Intl.DateTimeFormat('en', {
        month: 'long',
        year: 'numeric',
      }).format,
    };
  }

  // If range is more than 30 months, display by year
  return {
    array: eachYearOfInterval(interval(startDate, endDate)),
    format: new Intl.DateTimeFormat('en', {
      year: 'numeric',
    }).format,
  };
}
