# Pantry Pal

A comprehensive food management application with web and mobile interfaces.

## Project Structure

```
pantry-pal/
├── pantry-pal-web/        # Next.js web application
├── pantry-pal-mobile/     # React Native Expo mobile application
└── pantry-pal-backend/    # Backend services (reserved)
```

## Getting Started

### Web Application

```bash
cd pantry-pal-web
npm install
npm run dev
```

The web app will be available at `http://localhost:3001`

### Mobile Application

```bash
cd pantry-pal-mobile
npm install
npm start
```

Follow the Expo CLI instructions to run on iOS, Android, or web.

## Environment Variables

Both applications require Supabase configuration:

### Web (.env in pantry-pal-web/)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Mobile (.env in pantry-pal-mobile/)
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features

- Pantry Management
- Recipe Discovery
- Meal Planning
- Shopping Lists
- Analytics
- User Authentication

## Tech Stack

### Web
- Next.js 13
- TypeScript
- Tailwind CSS
- Supabase
- shadcn/ui

### Mobile
- React Native
- Expo
- TypeScript
- React Navigation
- Supabase
