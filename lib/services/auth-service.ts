export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export interface SessionResponse {
  user: {
    id: string;
    email: string;
  } | null;
}

class AuthService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(error.error || error.message || 'Failed to login');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Signup failed' }));
      throw new Error(error.error || error.message || 'Failed to create account');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/signout`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    this.clearToken();

    if (!response.ok) {
      throw new Error('Failed to logout');
    }
  }

  async getSession(): Promise<SessionResponse> {
    if (!this.token) {
      return { user: null };
    }

    const response = await fetch(`${this.baseUrl}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      this.clearToken();
      return { user: null };
    }

    const data = await response.json();
    return { user: data.user };
  }

  async getGoogleAuthUrl(): Promise<{ url: string }> {
    const response = await fetch(`${this.baseUrl}/auth/google/url`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to get Google auth URL');
    }

    return response.json();
  }

  getToken(): string | null {
    return this.token;
  }
}

export const authService = new AuthService();
