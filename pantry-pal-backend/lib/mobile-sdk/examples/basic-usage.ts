import { PantryPalSDK } from '../src/pantry-pal-sdk';

async function main() {
  const sdk = new PantryPalSDK({
    baseUrl: 'http://localhost:3000',
  });

  console.log('=== PantryPal SDK Example ===\n');

  console.log('1. Signing up...');
  const signUpResult = await sdk.auth.signUp('test@example.com', 'password123');
  if (signUpResult.error) {
    console.error('Sign up error:', signUpResult.error);
  } else {
    console.log('✓ Signed up successfully!');
  }

  console.log('\n2. Signing in...');
  const signInResult = await sdk.auth.signIn('test@example.com', 'password123');
  if (signInResult.error) {
    console.error('Sign in error:', signInResult.error);
    return;
  }
  console.log('✓ Signed in successfully!');

  console.log('\n3. Adding items to pantry...');
  const items = [
    { name: 'Milk', quantity: 2, unit: 'liters', location: 'fridge' as const, category: 'Dairy' },
    { name: 'Eggs', quantity: 12, unit: 'pcs', location: 'fridge' as const, category: 'Dairy' },
    { name: 'Chicken', quantity: 1, unit: 'kg', location: 'freezer' as const, category: 'Meat' },
  ];

  for (const item of items) {
    const result = await sdk.pantry.addItem(item);
    if (result.error) {
      console.error(`Error adding ${item.name}:`, result.error);
    } else {
      console.log(`✓ Added ${item.name}`);
    }
  }

  console.log('\n4. Getting all pantry items...');
  const pantryResult = await sdk.pantry.getItems();
  if (pantryResult.error) {
    console.error('Error:', pantryResult.error);
  } else {
    console.log(`✓ Found ${pantryResult.data?.length} items in pantry`);
    pantryResult.data?.forEach((item) => {
      console.log(`  - ${item.name}: ${item.quantity} ${item.unit} (${item.location})`);
    });
  }

  console.log('\n5. Searching for recipes...');
  const recipesResult = await sdk.recipes.search({
    difficulty: 'easy',
    maxCookingTime: 30,
    limit: 5,
  });
  if (recipesResult.error) {
    console.error('Error:', recipesResult.error);
  } else {
    console.log(`✓ Found ${recipesResult.data?.length} recipes`);
    recipesResult.data?.forEach((recipe) => {
      console.log(`  - ${recipe.title} (${recipe.cooking_time} min, ${recipe.difficulty})`);
    });
  }

  console.log('\n6. Adding item to shopping list...');
  const shoppingResult = await sdk.shoppingList.addItem({
    name: 'Bread',
    quantity: 2,
    unit: 'loaves',
    category: 'Bakery',
  });
  if (shoppingResult.error) {
    console.error('Error:', shoppingResult.error);
  } else {
    console.log('✓ Added to shopping list');
  }

  console.log('\n7. Getting shopping list...');
  const listResult = await sdk.shoppingList.getItems();
  if (listResult.error) {
    console.error('Error:', listResult.error);
  } else {
    console.log(`✓ Shopping list has ${listResult.data?.length} items`);
    listResult.data?.forEach((item) => {
      console.log(`  - ${item.name}: ${item.quantity} ${item.unit}`);
    });
  }

  console.log('\n8. Chatting with AI assistant...');
  const chatResult = await sdk.chat.send({
    message: "What's in my pantry?",
  });
  if (chatResult.error) {
    console.error('Error:', chatResult.error);
  } else {
    console.log('✓ AI Response:', chatResult.data?.response);
    if (chatResult.data?.functionCalled) {
      console.log(`  Function called: ${chatResult.data.functionCalled}`);
    }
  }

  console.log('\n=== Example Complete! ===');
}

main().catch(console.error);
