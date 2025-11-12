import type {
  PantryPalConfig,
  AuthTokens,
  ApiResponse,
  PantryItem,
  PantryItemInput,
  PantryFilters,
  Recipe,
  RecipeSearchCriteria,
  RecipeGenerateInput,
  MealPlan,
  MealPlanInput,
  MealPlanContext,
  ShoppingListItem,
  ShoppingListItemInput,
  UserProfile,
  UserProfileInput,
  UserSettings,
  UserSettingsInput,
  ChatRequest,
  ChatResponse,
} from './types';

export class PantryPalSDK {
  private baseUrl: string;
  private apiKey?: string;
  private authTokens?: AuthTokens;

  constructor(config: PantryPalConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
  }

  setAuth(tokens: AuthTokens): void {
    this.authTokens = tokens;
  }

  clearAuth(): void {
    this.authTokens = undefined;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.authTokens?.accessToken) {
      headers['Authorization'] = `Bearer ${this.authTokens.accessToken}`;
    }

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      if (!response.ok) {
        if (isJson) {
          const errorData = await response.json();
          return {
            error: errorData.error || errorData.message || 'Request failed',
            message: errorData.message,
            code: errorData.code,
          };
        }
        return {
          error: `Request failed with status ${response.status}`,
        };
      }

      if (isJson) {
        const data = await response.json();
        return data;
      }

      return {} as ApiResponse<T>;
    } catch (error: any) {
      return {
        error: error.message || 'Network error',
      };
    }
  }

  public pantry = {
    getItems: async (filters?: PantryFilters): Promise<ApiResponse<PantryItem[]>> => {
      const params = new URLSearchParams();

      if (filters?.location) params.append('location', filters.location);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.expiring) params.append('expiring', filters.expiring.toString());

      const query = params.toString();
      const endpoint = `/api/pantry${query ? `?${query}` : ''}`;

      return this.request<PantryItem[]>(endpoint);
    },

    addItem: async (item: PantryItemInput): Promise<ApiResponse<PantryItem>> => {
      return this.request<PantryItem>('/api/pantry', {
        method: 'POST',
        body: JSON.stringify(item),
      });
    },

    updateItem: async (
      id: string,
      updates: Partial<PantryItem>
    ): Promise<ApiResponse<PantryItem>> => {
      return this.request<PantryItem>(`/api/pantry/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ updates }),
      });
    },

    updateItems: async (
      items: Array<{ id: string; updates: Partial<PantryItem> }>
    ): Promise<ApiResponse<PantryItem[]>> => {
      return this.request<PantryItem[]>('/api/pantry', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      });
    },

    deleteItem: async (id: string): Promise<ApiResponse<void>> => {
      return this.request<void>(`/api/pantry/${id}`, {
        method: 'DELETE',
      });
    },

    deleteItems: async (ids: string[]): Promise<ApiResponse<void>> => {
      return this.request<void>('/api/pantry', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
      });
    },

    addItemsFromImage: async (
      file: File | Blob,
      location: 'fridge' | 'freezer' | 'pantry'
    ): Promise<ApiResponse<PantryItem[]>> => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('location', location);

      const headers: Record<string, string> = {};
      if (this.authTokens?.accessToken) {
        headers['Authorization'] = `Bearer ${this.authTokens.accessToken}`;
      }

      try {
        const response = await fetch(`${this.baseUrl}/api/pantry/analyze-image`, {
          method: 'POST',
          headers,
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          return {
            error: errorData.error || 'Image analysis failed',
          };
        }

        return await response.json();
      } catch (error: any) {
        return {
          error: error.message || 'Failed to upload image',
        };
      }
    },
  };

  public recipes = {
    search: async (
      criteria?: RecipeSearchCriteria
    ): Promise<ApiResponse<Recipe[]>> => {
      const params = new URLSearchParams();

      if (criteria?.genres?.length) {
        params.append('genres', criteria.genres.join(','));
      }
      if (criteria?.dietaryRestrictions?.length) {
        params.append('dietary', criteria.dietaryRestrictions.join(','));
      }
      if (criteria?.maxCookingTime) {
        params.append('maxCookingTime', criteria.maxCookingTime.toString());
      }
      if (criteria?.difficulty) {
        params.append('difficulty', criteria.difficulty);
      }
      if (criteria?.servings) {
        params.append('servings', criteria.servings.toString());
      }
      if (criteria?.limit) {
        params.append('limit', criteria.limit.toString());
      }

      const query = params.toString();
      const endpoint = `/api/recipes/search${query ? `?${query}` : ''}`;

      return this.request<Recipe[]>(endpoint);
    },

    generate: async (
      preferences: RecipeGenerateInput
    ): Promise<ApiResponse<Recipe[]>> => {
      return this.request<Recipe[]>('/api/recipes/generate', {
        method: 'POST',
        body: JSON.stringify(preferences),
      });
    },

    save: async (recipeId: string): Promise<ApiResponse<void>> => {
      return this.request<void>(`/api/recipes/${recipeId}/save`, {
        method: 'POST',
      });
    },

    unsave: async (recipeId: string): Promise<ApiResponse<void>> => {
      return this.request<void>(`/api/recipes/${recipeId}/save`, {
        method: 'DELETE',
      });
    },

    getFavorites: async (): Promise<ApiResponse<Recipe[]>> => {
      return this.request<Recipe[]>('/api/recipes/favorites');
    },

    getById: async (recipeId: string): Promise<ApiResponse<Recipe>> => {
      return this.request<Recipe>(`/api/recipes/${recipeId}`);
    },
  };

  public mealPlans = {
    get: async (
      startDate: string,
      endDate: string
    ): Promise<ApiResponse<MealPlan[]>> => {
      const params = new URLSearchParams({
        start: startDate,
        end: endDate,
      });

      return this.request<MealPlan[]>(`/api/meal-plans?${params.toString()}`);
    },

    create: async (
      mealPlan: MealPlanInput
    ): Promise<ApiResponse<MealPlan[]>> => {
      return this.request<MealPlan[]>('/api/meal-plans', {
        method: 'POST',
        body: JSON.stringify(mealPlan),
      });
    },

    getContext: async (): Promise<ApiResponse<MealPlanContext>> => {
      return this.request<MealPlanContext>('/api/meal-plans/context');
    },

    delete: async (mealPlanId: string): Promise<ApiResponse<void>> => {
      return this.request<void>(`/api/meal-plans/${mealPlanId}`, {
        method: 'DELETE',
      });
    },
  };

  public shoppingList = {
    getItems: async (completed?: boolean): Promise<ApiResponse<ShoppingListItem[]>> => {
      const params = new URLSearchParams();
      if (completed !== undefined) {
        params.append('completed', completed.toString());
      }

      const query = params.toString();
      const endpoint = `/api/shopping-list${query ? `?${query}` : ''}`;

      return this.request<ShoppingListItem[]>(endpoint);
    },

    addItem: async (
      item: ShoppingListItemInput
    ): Promise<ApiResponse<ShoppingListItem>> => {
      return this.request<ShoppingListItem>('/api/shopping-list', {
        method: 'POST',
        body: JSON.stringify(item),
      });
    },

    updateItem: async (
      id: string,
      updates: Partial<ShoppingListItem>
    ): Promise<ApiResponse<ShoppingListItem>> => {
      return this.request<ShoppingListItem>(`/api/shopping-list/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ updates }),
      });
    },

    deleteItem: async (id: string): Promise<ApiResponse<void>> => {
      return this.request<void>(`/api/shopping-list/${id}`, {
        method: 'DELETE',
      });
    },

    clearCompleted: async (): Promise<ApiResponse<void>> => {
      return this.request<void>('/api/shopping-list', {
        method: 'DELETE',
      });
    },
  };

  public user = {
    getProfile: async (): Promise<ApiResponse<UserProfile>> => {
      return this.request<UserProfile>('/api/user/profile');
    },

    updateProfile: async (
      profile: UserProfileInput
    ): Promise<ApiResponse<UserProfile>> => {
      return this.request<UserProfile>('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
    },

    getSettings: async (): Promise<ApiResponse<UserSettings>> => {
      return this.request<UserSettings>('/api/user/settings');
    },

    updateSettings: async (
      settings: UserSettingsInput
    ): Promise<ApiResponse<UserSettings>> => {
      return this.request<UserSettings>('/api/user/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    },
  };

  public chat = {
    send: async (request: ChatRequest): Promise<ApiResponse<ChatResponse>> => {
      return this.request<ChatResponse>('/api/chat', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    },
  };

  public auth = {
    signUp: async (
      email: string,
      password: string
    ): Promise<ApiResponse<{ user: any; token: string }>> => {
      return this.request<{ user: any; token: string }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    signIn: async (
      email: string,
      password: string
    ): Promise<ApiResponse<{ user: any; token: string }>> => {
      const response = await this.request<{ user: any; token: string }>(
        '/api/auth/signin',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      );

      if (response.data?.token) {
        this.setAuth({
          accessToken: response.data.token,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });
      }

      return response;
    },

    signOut: async (): Promise<ApiResponse<void>> => {
      const response = await this.request<void>('/api/auth/signout', {
        method: 'POST',
      });
      this.clearAuth();
      return response;
    },

    getGoogleAuthUrl: async (): Promise<ApiResponse<{ url: string }>> => {
      return this.request<{ url: string }>('/api/auth/google/url');
    },

    getCurrentUser: async (): Promise<ApiResponse<{ user: any }>> => {
      return this.request<{ user: any }>('/api/auth/me');
    },
  };
}

export default PantryPalSDK;
