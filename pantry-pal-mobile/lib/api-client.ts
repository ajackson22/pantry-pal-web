import { PantryPalSDK } from '../../pantry-pal-backend/lib/mobile-sdk/src/pantry-pal-sdk';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = new PantryPalSDK({
  baseUrl: API_BASE_URL,
});

export default apiClient;
