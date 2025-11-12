import { SDKConfig } from './types';

export class PantryPalClient {
  private baseURL: string;
  private token?: string;

  constructor(config: SDKConfig) {
    this.baseURL = config.baseURL;
    this.token = config.token;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = undefined;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async signUp(email: string, password: string) {
    const data = await this.request<any>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async signIn(email: string, password: string) {
    const data = await this.request<any>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async signOut() {
    await this.request('/api/auth/signout', { method: 'POST' });
    this.clearToken();
  }

  async getCurrentUser() {
    return this.request<any>('/api/auth/me');
  }

  async signInWithGoogle(accessToken: string) {
    const data = await this.request<any>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    });
    this.setToken(data.token);
    return data;
  }

  async getPantryItems() {
    return this.request<any>('/api/pantry');
  }

  async getPantryItem(id: string) {
    return this.request<any>(`/api/pantry/${id}`);
  }

  async createPantryItem(item: any) {
    return this.request<any>('/api/pantry', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updatePantryItem(id: string, updates: any) {
    return this.request<any>(`/api/pantry/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePantryItem(id: string) {
    return this.request<any>(`/api/pantry/${id}`, { method: 'DELETE' });
  }

  async getRecipes() {
    return this.request<any>('/api/recipes');
  }

  async getRecipe(id: string) {
    return this.request<any>(`/api/recipes/${id}`);
  }

  async createRecipe(recipe: any) {
    return this.request<any>('/api/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    });
  }

  async updateRecipe(id: string, updates: any) {
    return this.request<any>(`/api/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteRecipe(id: string) {
    return this.request<any>(`/api/recipes/${id}`, { method: 'DELETE' });
  }

  async getFavoriteRecipes() {
    return this.request<any>('/api/recipes/favorites');
  }

  async getMealPlans(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any>(`/api/meal-plans${query}`);
  }

  async getMealPlan(id: string) {
    return this.request<any>(`/api/meal-plans/${id}`);
  }

  async createMealPlan(mealPlan: any) {
    return this.request<any>('/api/meal-plans', {
      method: 'POST',
      body: JSON.stringify(mealPlan),
    });
  }

  async updateMealPlan(id: string, updates: any) {
    return this.request<any>(`/api/meal-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteMealPlan(id: string) {
    return this.request<any>(`/api/meal-plans/${id}`, { method: 'DELETE' });
  }

  async getShoppingList() {
    return this.request<any>('/api/shopping-list');
  }

  async getShoppingListItem(id: string) {
    return this.request<any>(`/api/shopping-list/${id}`);
  }

  async createShoppingListItem(item: any) {
    return this.request<any>('/api/shopping-list', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateShoppingListItem(id: string, updates: any) {
    return this.request<any>(`/api/shopping-list/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteShoppingListItem(id: string) {
    return this.request<any>(`/api/shopping-list/${id}`, { method: 'DELETE' });
  }

  async clearCompletedShoppingItems() {
    return this.request<any>('/api/shopping-list', { method: 'DELETE' });
  }

  async getSettings() {
    return this.request<any>('/api/settings');
  }

  async updateSettings(settings: any) {
    return this.request<any>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}
