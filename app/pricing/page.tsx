import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for individuals getting started',
    features: [
      'Up to 50 pantry items',
      'Basic recipe suggestions',
      'Shopping list creation',
      'Expiration date tracking',
      'Mobile app access',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'Best for families and power users',
    features: [
      'Unlimited pantry items',
      'AI recipe generator',
      'Smart receipt scanning',
      'Meal planning calendar',
      'Waste analytics dashboard',
      'Priority support',
      'Family sharing (up to 5 members)',
      'Advanced notifications',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Family',
    price: '$16.99',
    period: '/month',
    description: 'For large families and households',
    features: [
      'Everything in Pro',
      'Unlimited family members',
      'Multiple pantry locations',
      'Custom meal planning',
      'Grocery budget tracking',
      'Premium recipe collection',
      'Dedicated account manager',
      'Early access to new features',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold md:text-5xl">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-lg text-gray-600 md:text-xl">
          Choose the plan that fits your needs. All plans include a 14-day free trial.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col ${
              plan.highlighted
                ? 'border-2 border-primary shadow-xl'
                : 'border'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-white">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-gray-600">{plan.period}</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className="w-full"
                variant={plan.highlighted ? 'default' : 'outline'}
              >
                <Link href="/auth/signup">{plan.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 rounded-lg border bg-gray-50 p-8 text-center">
        <h2 className="text-2xl font-bold">Enterprise Solutions</h2>
        <p className="mt-2 text-gray-600">
          Need a custom solution for your organization? We offer tailored plans for businesses,
          schools, and community organizations.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/contact">Contact Sales</Link>
        </Button>
      </div>
    </div>
  );
}
