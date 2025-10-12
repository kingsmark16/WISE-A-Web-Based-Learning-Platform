# Admin Search Implementation

## Overview
Implemented a comprehensive search feature for admin users to search across courses, faculty, and students.

## Backend Changes

### 1. Admin Controller (`backend/src/controllers/adminController.js`)
Added new `adminSearch` function that:
- Searches across courses (by title, description, category, code)
- Searches across faculty (by name, email)
- Searches across students (by name, email)
- Returns categorized results with relevant metadata
- Supports query parameter `q` for search term
- Supports `limit` parameter (default: 10 per category)

### 2. Admin Routes (`backend/src/routes/adminRoutes.js`)
Added new route:
```javascript
router.get('/search', requireRole(['ADMIN']), adminSearch);
```

## Frontend Changes

### 1. Custom Hook (`frontend/src/hooks/useAdminSearch.js`)
Created `useAdminSearch` hook using React Query:
- Fetches search results from `/admin/search` endpoint
- Returns courses, faculty, and students matching the query
- Implements caching with 30-second stale time
- Conditionally enabled based on search query length

### 2. Search Results Page (`frontend/src/pages/admin/SearchResults.jsx`)
New page component that:
- Displays search results grouped by type (Courses, Faculty, Students)
- Shows relevant metadata for each result type
- Implements click navigation to detailed views
- Handles loading states with skeletons
- Shows helpful messages for no results or errors
- Responsive design with proper mobile support

### 3. Header Component (`frontend/src/components/Header.jsx`)
Updated to:
- Show search bar only for admin users
- Submit search queries to `/admin/search` route
- Support both desktop and mobile search interfaces
- Clear search input functionality
- Navigate to search results page on submit

### 4. App Routes (`frontend/src/App.jsx`)
Added new route under admin routes:
```javascript
<Route path="search" element={<SearchResults/>}/>
```

## Features

### Search Capabilities
- **Courses**: Search by title, description, category, or course code
- **Faculty**: Search by full name or email address
- **Students**: Search by full name or email address

### Search Results Display
- Grouped results by type with icons
- Result count indicators
- Course thumbnails and status badges
- Faculty/Student avatars with initials fallback
- Relevant metadata (course count, enrollment count)
- Click-through navigation to detailed views

### User Experience
- Real-time search (triggered on form submit)
- Responsive design (desktop + mobile)
- Loading states with skeleton loaders
- Empty state messages
- Error handling with user-friendly alerts
- Search bar only visible to admin users

## API Endpoint

### GET `/admin/search`
**Query Parameters:**
- `q` (required): Search query string
- `limit` (optional): Maximum results per category (default: 10)

**Response:**
```json
{
  "courses": [
    {
      "id": "string",
      "title": "string",
      "thumbnail": "string",
      "category": "string",
      "isPublished": boolean,
      "code": "string",
      "createdBy": { "fullName": "string", "imageUrl": "string" },
      "managedBy": { "fullName": "string", "imageUrl": "string" },
      "type": "course"
    }
  ],
  "faculty": [
    {
      "id": "string",
      "fullName": "string",
      "emailAddress": "string",
      "imageUrl": "string",
      "totalCourses": number,
      "type": "faculty"
    }
  ],
  "students": [
    {
      "id": "string",
      "fullName": "string",
      "emailAddress": "string",
      "imageUrl": "string",
      "totalEnrollments": number,
      "type": "student"
    }
  ],
  "totalResults": number,
  "query": "string"
}
```

## Testing

To test the feature:
1. Log in as an admin user
2. Use the search bar in the header
3. Enter a search query (e.g., course name, faculty name, or student name)
4. Press Enter or click the search button
5. View the categorized results on the search results page
6. Click on any result to navigate to its detailed view

## Security

- Search endpoint is protected with `requireRole(['ADMIN'])` middleware
- Only authenticated admin users can access the search functionality
- Search bar is conditionally rendered based on user role
- All database queries use Prisma's parameterized queries (SQL injection protection)

## Performance Considerations

- Results are limited to 10 per category by default
- Case-insensitive search using Prisma's `mode: "insensitive"`
- React Query caching with 30-second stale time
- Results ordered by relevance (courses by update date, users alphabetically)
