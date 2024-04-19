'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { formatCurrency, formatDiscountCode } from '@/lib/formatters';
import { DiscountCodeType, Product } from '@prisma/client';
import {
  Elements,
  useElements,
  useStripe,
  PaymentElement,
  LinkAuthenticationElement,
} from '@stripe/react-stripe-js';
import {
  Appearance,
  StripeElementsOptions,
  StripeLinkAuthenticationElementChangeEvent,
  StripePaymentElementChangeEvent,
  loadStripe,
} from '@stripe/stripe-js';
import Image from 'next/image';
import { FormEvent, useRef, useState } from 'react';
import { userOrderExists } from '@/app/actions/orders';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getDiscountedAmount } from '@/lib/discountCodeHelper';

interface CheckoutFormProps {
  product: {
    id: string;
    imagePath: string;
    name: string;
    priceInCents: number;
    description: string;
  };
  discountCode?: {
    id: string;
    discountAmount: number;
    discountType: DiscountCodeType;
  };
  clientSecret: string;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

export default function CheckoutForm({
  product,
  clientSecret,
  discountCode,
}: CheckoutFormProps) {
  const appearance: Appearance = {
    theme: 'stripe',
  };

  // Options to initialize the Stripe Payment Element
  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  const amount =
    discountCode == null
      ? product.priceInCents
      : getDiscountedAmount(discountCode, product.priceInCents);

  const isDiscounted = amount !== product.priceInCents;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="flex gap-4 items-center">
        <div className="aspect-video flex-shrink-0 w-1/3 relative">
          <Image
            src={product.imagePath}
            alt={product.name}
            fill
            className="object-cover position-center"
          />
        </div>
        <div>
          <div className="text-lg flex gap-4 items-baseline">
            <div
              className={
                isDiscounted ? 'line-through text-muted-foreground text-sm' : ''
              }
            >
              {formatCurrency(product.priceInCents / 100)}
            </div>
            {isDiscounted && <div>{formatCurrency(amount / 100)}</div>}
          </div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="line-clamp-3 text-muted-foreground">
            {product.description}
          </div>
        </div>
      </div>
      <Elements options={options} stripe={stripePromise}>
        <Form
          priceInCents={product.priceInCents}
          productId={product.id}
          discountCode={discountCode}
        />
      </Elements>
    </div>
  );
}

// Child Component of CheckoutForm
function Form({
  priceInCents,
  productId,
  discountCode,
}: {
  priceInCents: number;
  productId: string;
  discountCode?: {
    id: string;
    discountAmount: number;
    discountType: DiscountCodeType;
  };
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [isInputCompleted, setIsInputCompleted] = useState<boolean>(false);
  const [isEmailCompleted, setIsEmailCompleted] = useState<boolean>(false);
  const [isFormRendered, setIsFormRendered] = useState<boolean>(false);

  const discountCodeRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const coupon = searchParams.get('coupon');

  // Handle form submission
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!stripe || !elements || !email) {
      // Stripe.js hasn't yet loaded or email field not provided
      // Disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    // Check for existing order for the current user
    const orderExists = await userOrderExists(email, productId);

    if (orderExists) {
      setErrorMessage(
        'You have already purchased this product. Try downloading it from the My Orders page'
      );
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Redirect URL after they complete the payment
        return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchase-success`,
      },
    });

    if (error.type === 'card_error' || error.type === 'validation_error') {
      setErrorMessage(error.message);
    } else {
      setErrorMessage('An unknown error occured');
    }

    setIsLoading(false);
  }

  function handleInputChange(event: StripePaymentElementChangeEvent) {
    if (event.complete) {
      setIsInputCompleted(true);
    } else {
      setIsInputCompleted(false);
    }
  }

  function handleEmailChange(
    event: StripeLinkAuthenticationElementChangeEvent
  ) {
    setEmail(event.value.email);

    if (event.complete) {
      setIsEmailCompleted(true);
    } else {
      setIsEmailCompleted(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>

          <CardDescription className="text-destructive">
            {errorMessage && <span>errorMessage</span>}
            {coupon != null && discountCode == null && (
              <span>Invalid discount code</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isFormRendered && (
            <div className="space-y-6 animate-pulse m-1">
              <div className="flex gap-2 h-6">
                <div className="w-3/5 h6 rounder bg-gray-100"></div>
                <div className="w-2/5 h6 rounder bg-gray-100"></div>
              </div>
              <div className="flex gap-2 h-6">
                <div className="w-1/2 h6 rounder bg-gray-100"></div>
                <div className="w-1/2 h6 rounder bg-gray-100"></div>
              </div>
              <div className="w-full h-6 rounded bg-gray-100"></div>
            </div>
          )}
          <PaymentElement
            id="payment-element"
            onChange={(e) => handleInputChange(e)}
            onReady={() => setIsFormRendered(true)}
          />
          <div className="mt-4">
            <LinkAuthenticationElement onChange={(e) => handleEmailChange(e)} />
          </div>
          {isFormRendered && (
            <div className="space-y-2 mt-4">
              <Label
                htmlFor="discountCode"
                className="text-[#30313D] text-[0.93rem]"
              >
                Coupon
              </Label>
              <div className="flex gap-4 items-center">
                <Input
                  id="discountCode"
                  type="text"
                  name="discountCode"
                  className="max-w-xs w-full"
                  ref={discountCodeRef}
                  defaultValue={coupon || ''}
                />
                <Button
                  type="button"
                  onClick={() => {
                    // Get the current params in the URL
                    const params = new URLSearchParams(searchParams);
                    // Set the coupon params
                    params.set('coupon', discountCodeRef.current?.value || '');
                    // Navigate to the updated URL with params (re-render)
                    router.push(`${pathname}?${params.toString()}`, {
                      scroll: false,
                    });
                  }}
                >
                  Apply
                </Button>
                {discountCode != null && (
                  <div className="text-orange-500 font-bold text-xs sm:text-sm md:text-base">
                    {formatDiscountCode(discountCode)} discount applied
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            disabled={
              !stripe ||
              !elements ||
              isLoading ||
              !isInputCompleted ||
              !isEmailCompleted
            }
          >
            {isLoading
              ? 'Purchasing...'
              : `Pay - ${formatCurrency(priceInCents / 100)}`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
