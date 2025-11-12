# @pantrypal/sdk

Official TypeScript SDK for PantryPal API - Your complete kitchen management solution.

## Features

- 🔐 **Authentication** - Email/password and Google OAuth support
- 🥫 **Pantry Management** - Track items, locations, and expiry dates
- 🍳 **Recipe Discovery** - Search, generate AI recipes, and manage favorites
- 📅 **Meal Planning** - Plan meals with Google Calendar integration
- 🛒 **Shopping Lists** - Organize and track shopping items
- 💬 **AI Assistant** - Chat with AI for kitchen help
- 👤 **User Management** - Profile and settings management
- 📱 **Universal** - Works in Node.js, browsers, React Native, and Expo

## Installation

```bash
npm install @pantrypal/sdk
```

Or with yarn:

```bash
yarn add @pantrypal/sdk
```

## Quick Start

### Initialize the SDK

```typescript
import { PantryPalSDK } from '@pantrypal/sdk';

const sdk = new PantryPalSDK({
  baseUrl: 'https://api.pantrypal.app', // or http://localhost:3000 for dev
});
```

### Authentication

```typescript
// Sign up
const signUpResult = await sdk.auth.signUp('user@example.com', 'password123');
if (signUpResult.data) {
  console.log('Signed up successfully!', signUpResult.data.user);
}

// Sign in (automatically sets auth token)
const signInResult = await sdk.auth.signIn('user@example.com', 'password123');
if (signInResult.data) {
  console.log('Signed in!', signInResult.data.user);
}

// Or set auth token manually
sdk.setAuth({
  accessToken: 'your-jwt-token',
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
});

// Sign out
await sdk.auth.signOut();
```

### Google OAuth

```typescript
// Get Google OAuth URL
const { data } = await sdk.auth.getGoogleAuthUrl();
if (data?.url) {
  // Redirect user to data.url
  window.location.href = data.url;
}

// After callback, the backend returns a JWT token
// Set it in the SDK
sdk.setAuth({
  accessToken: tokenFromCallback,
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
});
```

## API Reference

### Pantry Management

```typescript
// Get all pantry items
const { data: items } = await sdk.pantry.getItems();

// Filter pantry items
const { data: fridgeItems } = await sdk.pantry.getItems({
  location: 'fridge',
  expiring: 7, // items expiring in 7 days
});

// Add item to pantry
const { data: newItem } = await sdk.pantry.addItem({
  name: 'Milk',
  quantity: 2,
  unit: 'liters',
  category: 'Dairy',
  location: 'fridge',
  expiry_date: '2024-12-31',
});

// Update single item
const { data: updated } = await sdk.pantry.updateItem('item-id', {
  quantity: 1,
});

// Bulk update items
const { data: updated } = await sdk.pantry.updateItems([
  { id: 'item-1', updates: { quantity: 5 } },
  { id: 'item-2', updates: { location: 'freezer' } },
]);

// Delete item
await sdk.pantry.deleteItem('item-id');

// Bulk delete items
await sdk.pantry.deleteItems(['item-1', 'item-2', 'item-3']);

// Add items from image (AI analysis)
const { data: extractedItems } = await sdk.pantry.addItemsFromImage(
  imageFile,
  'fridge'
);
```

### Recipe Management

```typescript
// Search recipes
const { data: recipes } = await sdk.recipes.search({
  genres: ['Italian', 'Mexican'],
  dietaryRestrictions: ['vegetarian'],
  maxCookingTime: 30,
  difficulty: 'easy',
  servings: 4,
  limit: 10,
});

// Generate AI recipes
const { data: generated } = await sdk.recipes.generate({
  numOfRecipesToGenerate: 3,
  selectedGenres: ['Asian'],
  selectedDietary: ['gluten-free'],
  maxCookingTime: 45,
  childFriendly: true,
  usePantryIngredients: true, // Use items from your pantry
});

// Get recipe by ID
const { data: recipe } = await sdk.recipes.getById('recipe-id');

// Save recipe to favorites
await sdk.recipes.save('recipe-id');

// Remove from favorites
await sdk.recipes.unsave('recipe-id');

// Get all favorites
const { data: favorites } = await sdk.recipes.getFavorites();
```

### Meal Planning

```typescript
// Get meal plans for date range
const { data: mealPlans } = await sdk.mealPlans.get(
  '2024-01-01',
  '2024-01-07'
);

// Create meal plans (with optional calendar sync)
const { data: created } = await sdk.mealPlans.create({
  scheduled_meals: [
    {
      recipe_id: 'recipe-1',
      date: '2024-01-01',
      meal_type: 'Breakfast',
    },
    {
      recipe_id: 'recipe-2',
      date: '2024-01-01',
      meal_type: 'Dinner',
    },
  ],
  syncWithCalendar: true, // Sync to Google Calendar
});

// Get context for meal planning UI
const { data: context } = await sdk.mealPlans.getContext();
console.log(context.settings); // User settings
console.log(context.calendarEvents); // Existing calendar events

// Delete meal plan
await sdk.mealPlans.delete('meal-plan-id');
```

### Shopping List

```typescript
// Get all shopping list items
const { data: items } = await sdk.shoppingList.getItems();

// Get only incomplete items
const { data: incomplete } = await sdk.shoppingList.getItems(false);

// Add item to shopping list
const { data: newItem } = await sdk.shoppingList.addItem({
  name: 'Eggs',
  quantity: 12,
  unit: 'pcs',
  category: 'Dairy',
});

// Update item (e.g., mark as completed)
const { data: updated } = await sdk.shoppingList.updateItem('item-id', {
  completed: true,
});

// Delete item
await sdk.shoppingList.deleteItem('item-id');

// Clear all completed items
await sdk.shoppingList.clearCompleted();
```

### AI Chat Assistant

```typescript
// Send message to AI assistant
const { data: response } = await sdk.chat.send({
  message: "What's in my pantry?",
});

console.log(response.response); // AI's text response
console.log(response.functionCalled); // Function that was called (e.g., "getPantryItems")
console.log(response.functionResults); // Results from function call

// Continue conversation with history
const { data: response2 } = await sdk.chat.send({
  message: 'Can you suggest some recipes with those ingredients?',
  conversationHistory: [
    { role: 'user', content: "What's in my pantry?" },
    { role: 'assistant', content: response.response },
  ],
});
```

The AI assistant can:
- View your pantry items
- Add items to pantry
- Search and generate recipes
- Create meal plans
- Get meal plan context
- And more!

### User Management

```typescript
// Get user profile
const { data: profile } = await sdk.user.getProfile();
console.log(profile.email, profile.fullName);

// Update profile
const { data: updated } = await sdk.user.updateProfile({
  fullName: 'John Doe',
  avatarUrl: 'https://example.com/avatar.jpg',
});

// Get user settings
const { data: settings } = await sdk.user.getSettings();

// Update settings
const { data: updated } = await sdk.user.updateSettings({
  meal_times: {
    breakfast: '08:00',
    lunch: '12:00',
    dinner: '18:00',
    snacks: '15:00',
  },
  sync_with_calendar: true,
  recipe_preferences: {
    dietary_restrictions: ['vegetarian', 'gluten-free'],
    favorite_genres: ['Italian', 'Asian'],
    cooking_skill: 'intermediate',
  },
});
```

## Error Handling

All SDK methods return an `ApiResponse<T>` object:

```typescript
interface ApiResponse<T> {
  data?: T;        // Response data if successful
  error?: string;  // Error message if failed
  message?: string; // Additional message
  code?: string;   // Error code
}
```

Always check for errors:

```typescript
const result = await sdk.pantry.getItems();

if (result.error) {
  console.error('Error:', result.error);
  // Handle error
} else {
  console.log('Items:', result.data);
  // Use data
}
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```typescript
import type {
  PantryItem,
  Recipe,
  MealPlan,
  ShoppingListItem,
  UserProfile,
  UserSettings,
} from '@pantrypal/sdk';

const items: PantryItem[] = result.data || [];
```

## React Native / Expo

The SDK works seamlessly in React Native and Expo:

```typescript
import { PantryPalSDK } from '@pantrypal/sdk';

const sdk = new PantryPalSDK({
  baseUrl: 'https://api.pantrypal.app',
});

// Use AsyncStorage for token persistence
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save token
const saveAuth = async (tokens: AuthTokens) => {
  await AsyncStorage.setItem('auth_tokens', JSON.stringify(tokens));
  sdk.setAuth(tokens);
};

// Load token
const loadAuth = async () => {
  const stored = await AsyncStorage.getItem('auth_tokens');
  if (stored) {
    const tokens = JSON.parse(stored);
    sdk.setAuth(tokens);
  }
};
```

## Image Upload (React Native)

```typescript
import * as ImagePicker from 'expo-image-picker';

// Pick image
const result = await ImagePicker.launchCameraAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 0.8,
});

if (!result.canceled) {
  const uri = result.assets[0].uri;

  // Create blob from URI
  const response = await fetch(uri);
  const blob = await response.blob();

  // Upload to PantryPal
  const { data } = await sdk.pantry.addItemsFromImage(blob, 'fridge');

  console.log('Extracted items:', data);
}
```

## Advanced Usage

### Token Refresh

```typescript
// Check if token is expired
const isTokenExpired = (expiresAt: number) => {
  return Date.now() >= expiresAt;
};

// Refresh token if needed (implement your refresh logic)
if (isTokenExpired(tokens.expiresAt)) {
  // Re-authenticate or refresh token
  await sdk.auth.signIn(email, password);
}
```

### Custom Headers

```typescript
// The SDK automatically handles Authorization headers
// You can extend the SDK for custom needs by wrapping it

class CustomSDK extends PantryPalSDK {
  constructor(config: PantryPalConfig & { customHeader?: string }) {
    super(config);
    // Add custom logic
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build SDK
npm run build

# Watch mode
npm run dev
```

## License

MIT

## Support

- Documentation: https://docs.pantrypal.app
- Issues: https://github.com/yourusername/pantry-pal/issues
- Email: support@pantrypal.app

## Contributing

Contributions are welcome! Please read our contributing guide.

---

Made with ❤️ by the PantryPal Team
