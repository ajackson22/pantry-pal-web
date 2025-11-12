# Pantry Pal Backend

Backend API server for Pantry Pal - a kitchen management application for tracking pantry inventory, discovering recipes, planning meals, and managing shopping lists.

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Supabase Auth (Email/Password + Google OAuth)
- **API**: REST endpoints under `/api/*`
- **Port**: 3000

## Project Structure

```
pantry-pal-backend/
├── app/
│   ├── api/              # API route handlers
│   │   ├── auth/         # Authentication endpoints
│   │   ├── pantry/       # Pantry item management
│   │   ├── recipes/      # Recipe management
│   │   ├── meal-plans/   # Meal planning
│   │   ├── shopping-list/# Shopping list management
│   │   └── settings/     # User settings
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── lib/
│   ├── services/         # Business logic services
│   ├── types/            # TypeScript type definitions
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Utility functions
├── sdk/                  # TypeScript SDK package
│   ├── src/
│   │   ├── client.ts     # SDK client implementation
│   │   ├── types.ts      # Shared types
│   │   └── index.ts      # Package entry point
│   ├── package.json
│   └── tsconfig.json
├── scripts/              # Utility scripts
│   └── migration/        # Data migration tools
│       ├── export-data.ts        # Export from old database
│       ├── import-data.ts        # Import to new database
│       ├── verify-integrity.ts   # Verify data integrity
│       ├── rollback.ts           # Rollback to backup
│       ├── MIGRATION_GUIDE.md    # Detailed migration guide
│       └── QUICK_START.md        # Quick reference
├── middleware.ts         # CORS configuration
├── package.json
├── tsconfig.json
├── next.config.js
├── .env.example
└── README.md
```

## Database Schema

The following tables are created with Row Level Security (RLS):

1. **pantry_items** - Track pantry inventory with expiration alerts
2. **recipes** - Store and manage recipes
3. **recipe_images** - Store recipe images (base64)
4. **meal_plans** - Plan meals with calendar integration
5. **shopping_list_items** - Manage shopping lists
6. **user_recipe_data** - Track favorites, ratings, and cook counts
7. **user_settings** - User preferences and settings

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Supabase account and project

### Installation

1. Clone the repository

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `JWT_SECRET` - Secret key for JWT tokens
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (optional)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (optional)
- `OPENAI_API_KEY` - OpenAI API key (for recipe generation)
- `PERPLEXITY_API_KEY` - Perplexity API key (for recipe discovery)

4. The database schema is already created via Supabase migrations

5. Build the SDK:

```bash
cd sdk
npm install
npm run build
cd ..
```

### Running the Server

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Sign up with email/password
- `POST /api/auth/signin` - Sign in with email/password
- `POST /api/auth/signout` - Sign out
- `POST /api/auth/google` - Sign in with Google (existing token)
- `GET /api/auth/google/url` - Get Google OAuth URL
- `GET /api/auth/google/callback` - Handle Google OAuth callback
- `GET /api/auth/me` - Get current user

### Pantry Management

- `GET /api/pantry` - Get pantry items with filtering (location, category, search, expiring)
- `POST /api/pantry` - Create pantry item
- `PUT /api/pantry` - Bulk update pantry items
- `DELETE /api/pantry` - Bulk delete pantry items
- `GET /api/pantry/[id]` - Get specific pantry item
- `PUT /api/pantry/[id]` - Update pantry item
- `DELETE /api/pantry/[id]` - Delete pantry item
- `POST /api/pantry/analyze-image` - Analyze image with AI and extract items
- `POST /api/pantry/image-upload` - Upload image and get URL

### Recipe Management

- `GET /api/recipes` - Get all recipes
- `POST /api/recipes` - Create recipe
- `GET /api/recipes/[id]` - Get specific recipe
- `PUT /api/recipes/[id]` - Update recipe
- `DELETE /api/recipes/[id]` - Delete recipe
- `GET /api/recipes/favorites` - Get favorite recipes
- `GET /api/recipes/search` - Search recipes with filters (genres, dietary, maxCookingTime, difficulty, servings, limit)
- `POST /api/recipes/generate` - AI-powered recipe generation with image generation
- `POST /api/recipes/[id]/save` - Save recipe to user's collection
- `DELETE /api/recipes/[id]/save` - Remove recipe from user's collection

### Meal Planning

- `GET /api/meal-plans?start=&end=` - Get meal plans with full recipe data
- `POST /api/meal-plans` - Create meal plans with Google Calendar sync
- `GET /api/meal-plans/context` - Get user settings and calendar events for planning UI
- `GET /api/meal-plans/[id]` - Get specific meal plan
- `PUT /api/meal-plans/[id]` - Update meal plan
- `DELETE /api/meal-plans/[id]` - Delete meal plan (and calendar event)

### Shopping List

- `GET /api/shopping-list?completed=true|false` - Get shopping list items (optional filter by completed status)
- `POST /api/shopping-list` - Create shopping list item
- `GET /api/shopping-list/[id]` - Get specific item
- `PUT /api/shopping-list/[id]` - Update item (supports { updates: {...} } or direct fields)
- `DELETE /api/shopping-list/[id]` - Delete item
- `DELETE /api/shopping-list` - Clear completed items

### Chat/Voice Assistant

- `POST /api/chat` - AI assistant with function calling (manages pantry, recipes, meal plans)

### User Profile & Settings

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile (fullName, avatarUrl)
- `GET /api/user/settings` - Get user settings (auto-creates if not exists)
- `PUT /api/user/settings` - Update user settings (meal_times, sync_with_calendar, recipe_preferences)

### Settings (Legacy - use /api/user/settings)

- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## Using the SDK

The TypeScript SDK (`@pantrypal/sdk`) can be used by both web and mobile frontends:

```typescript
import { PantryPalClient } from '@pantrypal/sdk';

const client = new PantryPalClient({
  baseURL: 'http://localhost:3000',
});

// Sign in
const { user, token } = await client.signIn('email@example.com', 'password');

// Get pantry items
const { items } = await client.getPantryItems();

// Create recipe
const { recipe } = await client.createRecipe({
  title: 'Spaghetti Carbonara',
  ingredients: [{ name: 'pasta', quantity: 400, unit: 'g' }],
  instructions: ['Boil pasta', 'Mix with eggs and cheese'],
  cooking_time: 20,
  servings: 4,
});
```

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

Supabase handles the underlying authentication (email/password and Google OAuth), and the API generates JWT tokens for client use.

## CORS

CORS is enabled for all origins. Configure `middleware.ts` to restrict origins in production.

## Security

- Row Level Security (RLS) enforced on all database tables
- Users can only access their own data
- JWT tokens expire after 7 days
- Passwords are hashed using bcrypt (via Supabase)

## Data Migration

If you have existing data in another Supabase database, use the migration tools:

```bash
# Quick start
npm run migrate:export    # Export from old database
npm run migrate:import    # Import to new database
npm run migrate:verify    # Verify data integrity
npm run migrate:rollback  # Rollback if needed (uses backup)
```

**Documentation:**
- 📖 **Full Guide**: `scripts/migration/MIGRATION_GUIDE.md`
- 🚀 **Quick Start**: `scripts/migration/QUICK_START.md`

**Features:**
- ✅ Automatic backups before import
- ✅ Batch processing for large datasets
- ✅ Foreign key integrity checks
- ✅ Rollback capabilities
- ✅ Progress logging and error handling

See the migration guide for setup instructions and user authentication migration.

## License

MIT
