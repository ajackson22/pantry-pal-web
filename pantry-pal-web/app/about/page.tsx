import { Card, CardContent } from '@/components/ui/card';
import { Target, Heart, Leaf, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold md:text-5xl">About Pantry Pal</h1>
        <p className="mt-6 text-lg text-gray-600 md:text-xl">
          We're on a mission to reduce food waste and make kitchen management effortless for everyone.
        </p>

        <div className="mt-12 space-y-8">
          <div>
            <h2 className="text-2xl font-bold">Our Story</h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Pantry Pal was born from a simple observation: households waste billions of dollars worth of food every year,
              often because they forget what they have or when it expires. We knew technology could solve this problem.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Our team of developers, designers, and food enthusiasts came together to create an intelligent kitchen
              management system that's both powerful and easy to use. Today, thousands of families use Pantry Pal to
              reduce waste, save money, and enjoy their cooking more.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
                <p className="text-gray-600">
                  To empower every household with the tools they need to eliminate food waste, save money, and
                  live more sustainably.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Environmental Impact</h3>
                <p className="text-gray-600">
                  Our users have collectively prevented over 500 tons of food from going to waste, reducing
                  carbon emissions and helping the planet.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">User-Centric Design</h3>
                <p className="text-gray-600">
                  We listen to our users and continuously improve Pantry Pal based on real feedback from real
                  families around the world.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Community First</h3>
                <p className="text-gray-600">
                  Join a growing community of conscious consumers who share tips, recipes, and success stories
                  in reducing food waste.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-green-50 p-8">
            <h2 className="text-2xl font-bold mb-4">Join Us in Making a Difference</h2>
            <p className="text-gray-600 mb-6">
              Every meal planned, every expiration date tracked, and every item saved from the trash contributes
              to a more sustainable future. Together, we can make food waste a thing of the past.
            </p>
            <div className="grid gap-4 md:grid-cols-3 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">10,000+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">500+ tons</div>
                <div className="text-sm text-gray-600">Food Waste Prevented</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600">$5M+</div>
                <div className="text-sm text-gray-600">Saved Collectively</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
