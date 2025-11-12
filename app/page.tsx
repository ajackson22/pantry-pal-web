import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';
import {
  Package,
  Utensils,
  Calendar,
  BarChart3,
  Bell,
  Sparkles,
  TrendingDown,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Your Kitchen,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Smarter Than Ever
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 md:text-xl">
              Track your pantry, discover recipes, plan meals, and reduce food waste.
              Pantry Pal transforms your kitchen into an organized, efficient space.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="text-lg">
                <Link href="/auth/signup">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg">
                <Link href="/features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t bg-white py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
              Everything You Need
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-gray-600">
              Powerful features to help you manage your kitchen and reduce food waste
            </p>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={Package}
                title="Smart Inventory"
                description="Track what you have, when it expires, and get timely alerts"
              />
              <FeatureCard
                icon={Utensils}
                title="Recipe Discovery"
                description="Find recipes based on ingredients you already have"
              />
              <FeatureCard
                icon={Calendar}
                title="Meal Planning"
                description="Plan your week and automatically generate shopping lists"
              />
              <FeatureCard
                icon={BarChart3}
                title="Waste Analytics"
                description="Track savings and reduce food waste over time"
              />
            </div>
          </div>
        </section>

        <section className="border-t bg-gray-50 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Save Money, Save Time, Save the Planet
              </h2>
              <p className="mb-12 text-lg text-gray-600">
                Join thousands of users who are transforming their kitchens
              </p>
              <div className="grid gap-8 md:grid-cols-3">
                <StatCard
                  icon={TrendingDown}
                  stat="40%"
                  label="Average food waste reduction"
                />
                <StatCard
                  icon={Sparkles}
                  stat="$500+"
                  label="Saved per year on groceries"
                />
                <StatCard
                  icon={Bell}
                  stat="95%"
                  label="Users never miss expiration dates"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              Join Pantry Pal today and take control of your kitchen
            </p>
            <Button size="lg" asChild className="text-lg">
              <Link href="/auth/signup">Create Your Free Account</Link>
            </Button>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-2 transition-all hover:border-primary hover:shadow-lg">
      <CardContent className="pt-6">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatCard({
  icon: Icon,
  stat,
  label,
}: {
  icon: any;
  stat: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
        <Icon className="h-6 w-6 text-green-600" />
      </div>
      <div className="text-4xl font-bold text-gray-900">{stat}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
