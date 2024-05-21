import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import db from '@/db/db';
import { formatCurrency, formatDate, formatNumber } from '@/lib/formatters';
import OrdersByDayChart from './_components/charts/OrdersByDayChart';
import UsersByDayChart from './_components/charts/UsersByDayChart';
import RevenueByProductChart from './_components/charts/RevenueByProductChart';
import { Prisma } from '@prisma/client';
import { interval, eachDayOfInterval, startOfDay, subDays } from 'date-fns';
import { ReactNode } from 'react';

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

  // eachDayOfInterval - Return the array of dates within the specified time interval.
  // Construct an array of dates for the given range, with each day's total sales as 0
  const dayArray = eachDayOfInterval(
    interval(
      createdAfter || startOfDay(chartData[0].createdAt),
      createdBefore || new Date()
    )
  ).map((date) => {
    return {
      date: formatDate(date),
      totalSales: 0,
    };
  });

  return {
    // Reduce function: Taking all orders, totaling all the sales for each individual date
    chartData: chartData.reduce((data, order) => {
      const formattedDate = formatDate(order.createdAt);

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

  const dayArray = eachDayOfInterval(
    interval(
      createdAfter || startOfDay(chartData[0].createdAt),
      createdBefore || new Date()
    )
  ).map((date) => {
    return {
      date: formatDate(date),
      totalUsers: 0,
    };
  });

  return {
    chartData: chartData.reduce((data, user) => {
      const formattedDate = formatDate(user.createdAt);

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

export default async function AdminDashboard() {
  const [salesData, userData, productData] = await Promise.all([
    getSalesData(subDays(new Date(), 13), new Date()), // previous 6 days + the current day
    getUserData(subDays(new Date(), 5), new Date()),
    getProductData(subDays(new Date(), 6), new Date()),
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
        <ChartCard title="Total Sales">
          <OrdersByDayChart data={salesData.chartData} />
        </ChartCard>
        <ChartCard title="New Customers">
          <UsersByDayChart data={userData.chartData} />
        </ChartCard>
        <ChartCard title="Revenue By Product">
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

interface ChartCardProps {
  title: string;
  children: ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
