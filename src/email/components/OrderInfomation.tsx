import {
  Button,
  Column,
  Img,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { formatCurrency } from '@/lib/formatters';

type OrderInfomationProps = {
  order: { id: string; createdAt: Date; pricePaidInCents: number };
  product: { imagePath: string; name: string; description: string };
  downloadVerificationId: string;
};

const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });

export default function OrderInfomation({
  order,
  product,
  downloadVerificationId,
}: OrderInfomationProps) {
  return (
    <>
      <Section>
        <Row>
          <Column>
            <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
              Order Id
            </Text>
            <Text className="mt-0 mr-4">{order.id}</Text>
          </Column>
          <Column>
            <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
              Purchase On
            </Text>
            <Text className="mt-0 mr-4">
              {dateFormatter.format(order.createdAt)}
            </Text>
          </Column>
          <Column>
            <Text className="mb-0 text-gray-500 whitespace-nowrap text-nowrap mr-4">
              Price Paid
            </Text>
            <Text className="mt-0 mr-4">
              {formatCurrency(order.pricePaidInCents / 100)}
            </Text>
          </Column>
        </Row>
      </Section>
      <Section className="border border-solid rounded-lg border-gray-500 p-4 md:p-6 my-4">
        <Img
          width="100%"
          alt={product.name}
          src={`${process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_SERVER_URL : 'http://localhost:3000'}${product.imagePath}`}
        />
        <Row className="mt-8">
          <Column className="align-bottom">
            <Text className="text-lg font-bold m-0 mr-4">{product.name}</Text>
          </Column>
          <Column align="right">
            <Button
              href={`${process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_SERVER_URL : 'http://localhost:3000'}/products/download/${downloadVerificationId}`}
              className="bg-blue-600 text-white px-2 py-2 md:px-4 md:py-3 rounded text-md"
            >
              Download
            </Button>
          </Column>
          <Row>
            <Column>
              <Text className="text-gray-500 mb-0">{product.description}</Text>
            </Column>
          </Row>
        </Row>
      </Section>
    </>
  );
}
