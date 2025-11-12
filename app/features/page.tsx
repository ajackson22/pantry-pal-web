import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Camera,
  Package,
  Sparkles,
  Calendar,
  ShoppingCart,
  TrendingDown,
  Zap,
  Clock,
  Shield,
} from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'Smart Receipt Scanner',
    description: 'Snap a photo of your receipt and let AI automatically add items to your pantry with expiration dates.',
    benefits: ['Instant item recognition', 'Auto-populated expiration dates', 'No manual typing required'],
  },
  {
    icon: Package,
    title: 'Intelligent Inventory',
    description: 'Track everything in your pantry, fridge, and freezer with smart categorization and quantity monitoring.',
    benefits: ['Real-time stock levels', 'Location-based organization', 'Batch expiration tracking'],
  },
  {
    icon: Sparkles,
    title: 'AI Recipe Generator',
    description: 'Get personalized recipe suggestions based on what you have, what expires soon, and your preferences.',
    benefits: ['Use-what-you-have recipes', 'Dietary preference matching', 'Step-by-step instructions'],
  },
  {
    icon: Calendar,
    title: 'Meal Planning Assistant',
    description: 'Plan your week effortlessly with AI-powered meal suggestions and automatic shopping list generation.',
    benefits: ['Weekly meal calendars', 'Nutritional balance', 'Family preference learning'],
  },
  {
    icon: ShoppingCart,
    title: 'Smart Shopping Lists',
    description: 'Auto-generated shopping lists based on your meal plans, pantry levels, and shopping history.',
    benefits: ['Organized by store section', 'Price tracking', 'Shared family lists'],
  },
  {
    icon: TrendingDown,
    title: 'Waste Reduction Analytics',
    description: 'Track your food waste patterns and get insights on how to reduce waste and save money.',
    benefits: ['Waste tracking dashboard', 'Savings calculator', 'Improvement suggestions'],
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Sync across all your devices instantly. Family members can update the same pantry in real-time.',
    benefits: ['Multi-device sync', 'Family collaboration', 'Offline mode support'],
  },
  {
    icon: Clock,
    title: 'Time-Saving Automation',
    description: 'Smart notifications, automatic reordering suggestions, and routine task automation.',
    benefits: ['Expiration alerts', 'Low-stock notifications', 'Recurring item reminders'],
  },
  {
    icon: Shield,
    title: 'Secure Data Protection',
    description: 'Your data is encrypted and securely stored. Full privacy controls and data export options.',
    benefits: ['End-to-end encryption', 'GDPR compliant', 'Easy data export'],
  },
];

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold md:text-5xl">Powerful Features</h1>
        <p className="mt-4 text-lg text-gray-600 md:text-xl">
          Everything you need to manage your kitchen efficiently and reduce food waste
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription className="text-base">{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feature.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start text-sm text-gray-600">
                    <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
