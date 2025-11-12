# Pantry Pal API Documentation

Complete API reference for the Pantry Pal backend server.

**Base URL:** `http://localhost:3000` (development)

---

## Authentication

All endpoints except authentication endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### POST /api/auth/signup

Sign up with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt-token"
}
```

---

### POST /api/auth/signin

Sign in with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt-token"
}
```

---

### POST /api/auth/signout

Sign out current user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Signed out successfully"
}
```

---

### GET /api/auth/me

Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

---

### GET /api/auth/google/url

Get Google OAuth authorization URL.

**Response (200):**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

**Usage:**
Redirect user to the returned URL to initiate Google OAuth flow.

---

### GET /api/auth/google/callback

Handle Google OAuth callback (automatically called by Google).

**Query Parameters:**
- `code` (string, required) - Authorization code from Google
- `error` (string, optional) - Error from Google OAuth

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://..."
  },
  "accessToken": "jwt-token",
  "refreshToken": "google-refresh-token",
  "googleAccessToken": "google-access-token"
}
```

**Error Response (400):**
```json
{
  "error": "OAuth error: access_denied"
}
```

---

### POST /api/auth/google

Sign in with existing Google access token (alternative method).

**Request Body:**
```json
{
  "accessToken": "google-access-token"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt-token"
}
```

---

## Pantry Management

### GET /api/pantry

Get pantry items with optional filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `location` (string, optional) - Filter by location: `fridge`, `freezer`, or `pantry`
- `category` (string, optional) - Filter by category
- `search` (string, optional) - Search by item name
- `expiring` (number, optional) - Get items expiring in X days

**Example:**
```
GET /api/pantry?location=fridge&expiring=7
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Milk",
      "quantity": 1,
      "unit": "liter",
      "category": "Dairy",
      "location": "fridge",
      "expiry_date": "2025-11-18T00:00:00Z",
      "created_at": "2025-11-11T12:00:00Z",
      "updated_at": "2025-11-11T12:00:00Z"
    }
  ]
}
```

---

### POST /api/pantry

Create a new pantry item.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Milk",
  "quantity": 1,
  "unit": "liter",
  "category": "Dairy",
  "location": "fridge",
  "expiry_date": "2025-11-18T00:00:00Z"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Milk",
    "quantity": 1,
    "unit": "liter",
    "category": "Dairy",
    "location": "fridge",
    "expiry_date": "2025-11-18T00:00:00Z",
    "created_at": "2025-11-11T12:00:00Z",
    "updated_at": "2025-11-11T12:00:00Z"
  }
}
```

---

### PUT /api/pantry

Bulk update multiple pantry items.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "items": [
    {
      "id": "uuid-1",
      "updates": {
        "quantity": 2
      }
    },
    {
      "id": "uuid-2",
      "updates": {
        "location": "freezer",
        "expiry_date": "2025-12-01T00:00:00Z"
      }
    }
  ]
}
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid-1",
      "quantity": 2,
      ...
    },
    {
      "id": "uuid-2",
      "location": "freezer",
      ...
    }
  ]
}
```

---

### DELETE /api/pantry

Bulk delete pantry items.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response (200):**
```json
{
  "success": true
}
```

---

### GET /api/pantry/[id]

Get a specific pantry item.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "name": "Milk",
    ...
  }
}
```

**Error Response (404):**
```json
{
  "error": "Item not found"
}
```

---

### PUT /api/pantry/[id]

Update a specific pantry item.

**Headers:** `Authorization: Bearer <token>`

**Request Body (Option 1):**
```json
{
  "updates": {
    "quantity": 2,
    "expiry_date": "2025-11-20T00:00:00Z"
  }
}
```

**Request Body (Option 2 - direct fields):**
```json
{
  "quantity": 2,
  "expiry_date": "2025-11-20T00:00:00Z"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "quantity": 2,
    ...
  }
}
```

**Error Response (404):**
```json
{
  "error": "Item not found or not owned by user"
}
```

---

### DELETE /api/pantry/[id]

Delete a specific pantry item.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true
}
```

---

### POST /api/pantry/image-upload

Upload an image and get a data URL.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `image` (file, required) - Image file (max 10MB)

**Response (200):**
```json
{
  "data": {
    "url": "data:image/jpeg;base64,...",
    "filename": "receipt.jpg",
    "size": 524288,
    "type": "image/jpeg"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Image size must be less than 10MB"
}
```

---

### POST /api/pantry/analyze-image

Analyze an image using AI to extract food items and add them to pantry.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `image` (file, required) - Image file (max 20MB)
- `location` (string, required) - Where to store items: `fridge`, `freezer`, or `pantry`

**Response (201):**
```json
{
  "data": [
    {
      "id": "uuid-1",
      "name": "Milk",
      "quantity": 1,
      "unit": "liter",
      "category": "Dairy",
      "location": "fridge",
      ...
    },
    {
      "id": "uuid-2",
      "name": "Apples",
      "quantity": 6,
      "unit": "pcs",
      "category": "Fruits",
      "location": "fridge",
      ...
    }
  ],
  "meta": {
    "itemsExtracted": 2,
    "itemsAdded": 2
  }
}
```

**Error Response (503):**
```json
{
  "error": "AI service not configured",
  "message": "OpenAI API key not configured"
}
```

**Requirements:**
- OpenAI API key must be set in environment variables
- Uses GPT-4 Vision to analyze images
- Automatically extracts item names, quantities, units, and categories
- All extracted items are added to user's pantry

---

## Recipe Management

### GET /api/recipes

Get all recipes.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "recipes": [...]
}
```

### POST /api/recipes

Create a new recipe.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Spaghetti Carbonara",
  "description": "Classic Italian pasta",
  "cooking_time": 30,
  "servings": 4,
  "difficulty": "medium",
  "ingredients": [...],
  "instructions": [...],
  "child_friendly": true
}
```

### GET /api/recipes/favorites

Get favorite recipes.

**Headers:** `Authorization: Bearer <token>`

---

## Meal Planning

### GET /api/meal-plans

Get meal plans with optional date filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (string, optional) - ISO date string
- `endDate` (string, optional) - ISO date string

### POST /api/meal-plans

Create a meal plan.

**Headers:** `Authorization: Bearer <token>`

---

## Shopping List

### GET /api/shopping-list

Get shopping list items.

**Headers:** `Authorization: Bearer <token>`

### POST /api/shopping-list

Add item to shopping list.

**Headers:** `Authorization: Bearer <token>`

### DELETE /api/shopping-list

Clear completed items from shopping list.

**Headers:** `Authorization: Bearer <token>`

---

## User Settings

### GET /api/settings

Get user settings.

**Headers:** `Authorization: Bearer <token>`

### PUT /api/settings

Update user settings.

**Headers:** `Authorization: Bearer <token>`

---

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": "Error message",
  "message": "Optional detailed message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error, missing required fields)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (external service not configured)

---

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing rate limiting in production.

---

## CORS

CORS is enabled for all origins. Configure `middleware.ts` to restrict origins in production.

---

## Security Notes

1. All endpoints (except auth) require JWT authentication
2. Row Level Security (RLS) enforced at database level
3. Users can only access their own data
4. JWT tokens expire after 7 days
5. Service role keys should never be exposed to clients

---

*Last updated: 2025-11-11*
