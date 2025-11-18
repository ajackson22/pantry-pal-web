import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';

const posts = [
  {
    title: '10 Tips to Reduce Food Waste in Your Kitchen',
    excerpt: 'Learn practical strategies to minimize waste and save money on groceries.',
    date: '2024-01-15',
    readTime: '5 min read',
    category: 'Tips & Tricks',
  },
  {
    title: 'How to Organize Your Pantry Like a Pro',
    excerpt: 'Transform your pantry into an efficient, easy-to-navigate space with these expert tips.',
    date: '2024-01-10',
    readTime: '7 min read',
    category: 'Organization',
  },
  {
    title: 'Meal Planning 101: A Beginner\'s Guide',
    excerpt: 'Start meal planning with confidence using our step-by-step guide.',
    date: '2024-01-05',
    readTime: '6 min read',
    category: 'Meal Planning',
  },
  {
    title: 'The Environmental Impact of Food Waste',
    excerpt: 'Understanding how food waste affects our planet and what we can do about it.',
    date: '2023-12-28',
    readTime: '8 min read',
    category: 'Environment',
  },
  {
    title: 'Smart Shopping: How to Save Money on Groceries',
    excerpt: 'Expert strategies for reducing your grocery bill without sacrificing quality.',
    date: '2023-12-20',
    readTime: '5 min read',
    category: 'Budget',
  },
  {
    title: 'Recipe Substitutions: Make the Most of What You Have',
    excerpt: 'Learn creative ingredient swaps that let you cook without an extra trip to the store.',
    date: '2023-12-15',
    readTime: '6 min read',
    category: 'Recipes',
  },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold md:text-5xl">Blog</h1>
        <p className="mt-4 text-lg text-gray-600 md:text-xl">
          Tips, recipes, and insights to help you make the most of your kitchen
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.title} className="flex flex-col transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 text-sm font-medium text-primary">{post.category}</div>
              <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1" />
            <CardFooter className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-gray-600">More articles coming soon!</p>
      </div>
    </div>
  );
}
