import AsyncStorage from '@react-native-async-storage/async-storage';
import { PantryPalSDK } from '../../pantry-pal-backend/lib/mobile-sdk/src/pantry-pal-sdk';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

class MobileApiClient {
  private sdk: PantryPalSDK;

  constructor() {
    this.sdk = new PantryPalSDK({
      baseUrl: API_BASE_URL,
    });
    this.initializeAuth();
  }

  private async initializeAuth() {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      this.sdk.setAuth({ accessToken: token, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    }
  }

  async setAuthToken(token: string) {
    await AsyncStorage.setItem('auth_token', token);
    this.sdk.setAuth({ accessToken: token, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  }

  async clearAuth() {
    await AsyncStorage.removeItem('auth_token');
    this.sdk.clearAuth();
  }

  get pantry() {
    return this.sdk.pantry;
  }

  get recipes() {
    return this.sdk.recipes;
  }

  get mealPlans() {
    return this.sdk.mealPlans;
  }

  get shoppingList() {
    return this.sdk.shoppingList;
  }

  get user() {
    return this.sdk.user;
  }

  get chat() {
    return this.sdk.chat;
  }

  get auth() {
    return this.sdk.auth;
  }
}

export const apiClient = new MobileApiClient();
export default apiClient;
