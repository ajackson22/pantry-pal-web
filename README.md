# Pantry Pal Web Frontend

Next.js 14 web application for Pantry Pal - Smart Kitchen Management

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## Project Structure

```
pantry-pal-web/
├── app/                          # Next.js App Router
│   ├── (authenticated)/          # Protected routes
│   │   ├── dashboard/
│   │   ├── pantry/
│   │   ├── recipes/
│   │   ├── meal-plan/
│   │   ├── shopping/
│   │   ├── analytics/
│   │   ├── settings/
│   │   └── profile/
│   ├── (public)/                 # Public pages layout
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/
│   ├── about/
│   ├── features/
│   ├── pricing/
│   └── blog/
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/                # Dashboard layout components
│   ├── landing/                  # Landing page components
│   ├── pantry/
│   ├── recipes/
│   ├── meal-plan/
│   ├── shopping/
│   └── auth/
├── lib/
│   ├── api-client.ts            # API client wrapper
│   ├── supabase.ts              # Supabase client
│   ├── hooks/                   # Custom React hooks
│   │   └── use-api-client.ts
│   └── providers/               # Context providers
│       └── supabase-provider.tsx
└── middleware.ts                 # Route protection
```

## Features

- **Authentication**: Email/password with Supabase Auth
- **Protected Routes**: Automatic redirect for unauthenticated users
- **API Client**: Type-safe wrapper around backend API with automatic session management
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: shadcn/ui component library

## Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Authentication Flow

1. Users sign up or log in through `/auth/signup` or `/auth/login`
2. Supabase handles authentication and session management
3. Session state is managed globally via `SupabaseProvider`
4. Protected routes automatically redirect unauthenticated users
5. API client includes session token in all requests to backend

## API Integration

The application uses a wrapper around the `@pantrypal/sdk` package (to be implemented):

```typescript
import { useApiClient } from '@/lib/hooks/use-api-client';

function MyComponent() {
  const apiClient = useApiClient();

  // API calls automatically include auth token
  const data = await apiClient.get('/pantry');
}
```

## Next Steps

This is the foundational setup for the Pantry Pal web frontend. The following features will be implemented in subsequent prompts:

1. Pantry inventory management
2. Recipe discovery and search
3. Meal planning with calendar
4. Shopping list management
5. Analytics and reporting
6. User profile and settings

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **State Management**: React Context
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
