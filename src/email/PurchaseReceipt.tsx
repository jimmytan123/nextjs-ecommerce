import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
  Text,
  Heading,
} from '@react-email/components';
import OrderInfomation from './components/OrderInfomation';

type PurchaseReceiptEmailProps = {
  product: {
    name: string;
    imagePath: string;
    description: string;
  };
  order: { id: string; createdAt: Date; pricePaidInCents: number };
  downloadVerificationId: string;
};

PurchaseReceiptEmail.PreviewProps = {
  product: {
    name: 'Product name',
    imagePath:
      '/products/bfe85e66-1869-40e4-8e83-8341b8ef8e37-thinking-fast-slow.jpg',
    description: 'desc',
  },
  order: {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    pricePaidInCents: 10000,
  },
  downloadVerificationId: crypto.randomUUID(),
} satisfies PurchaseReceiptEmailProps;

export default function PurchaseReceiptEmail({
  product,
  order,
  downloadVerificationId,
}: PurchaseReceiptEmailProps) {
  return (
    <Html>
      <Preview>Download {product.name} and view receipt</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white min-h-screen">
          <Container className="max-w-xl">
            <Text className="text-3xl font-bold">Purchase Receipt</Text>
            <OrderInfomation
              order={order}
              product={product}
              downloadVerificationId={downloadVerificationId}
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
