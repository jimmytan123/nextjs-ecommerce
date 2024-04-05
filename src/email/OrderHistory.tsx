import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
  Text,
  Heading,
  Hr,
} from '@react-email/components';
import OrderInfomation from './components/OrderInfomation';
import React from 'react';

type OrderHistoryEmailProps = {
  orders: {
    id: string;
    createdAt: Date;
    pricePaidInCents: number;
    downloadVerificationId: string;
    product: {
      name: string;
      imagePath: string;
      description: string;
    };
  }[];
};

OrderHistoryEmail.PreviewProps = {
  orders: [
    {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      pricePaidInCents: 1000,
      downloadVerificationId: crypto.randomUUID(),
      product: {
        name: 'Test Product',
        imagePath:
          '/products/bfe85e66-1869-40e4-8e83-8341b8ef8e37-thinking-fast-slow.jpg',
        description: 'Test Desc',
      },
    },
    {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      pricePaidInCents: 2500,
      downloadVerificationId: crypto.randomUUID(),
      product: {
        name: 'Test Product 2',
        imagePath:
          '/products/bfe85e66-1869-40e4-8e83-8341b8ef8e37-thinking-fast-slow.jpg',
        description: 'Test Desc 2',
      },
    },
  ],
} satisfies OrderHistoryEmailProps;

export default function OrderHistoryEmail({ orders }: OrderHistoryEmailProps) {
  return (
    <Html>
      <Preview>Order Hisotry & Downloads</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white min-h-screen">
          <Container className="max-w-xl">
            <Text className="text-3xl font-bold">Order History</Text>
            {orders.map((order, index) => {
              return (
                <React.Fragment key={order.id}>
                  <OrderInfomation
                    order={order}
                    product={order.product}
                    downloadVerificationId={order.downloadVerificationId}
                  />
                  {index < orders.length - 1 && <Hr />}
                </React.Fragment>
              );
            })}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
