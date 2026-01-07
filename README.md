# PathCraft Amana - Learning Roadmap Platform

A modern Next.js application for creating, sharing, and tracking personalized learning roadmaps. Features AI-powered roadmap generation using Google Gemini, user authentication, and progress tracking.

## Features

- 🤖 **AI-Powered Roadmap Generation** - Create learning paths instantly using Google Gemini
- 👤 **User Authentication** - Secure JWT-based authentication system
- 📚 **Path Management** - Create, edit, and delete custom learning paths
- 📊 **Progress Tracking** - Track your learning journey with step-by-step completion
- 🔍 **Advanced Search** - Find paths by category, difficulty, or keywords
- 🔄 **Path Cloning** - Clone and customize existing paths
- 📱 **Responsive Design** - Beautiful UI that works on all devices

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React 19** - Latest React features

### Backend
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Secure authentication
- **Google Gemini AI** - AI-powered roadmap generation
- **Vercel AI SDK** - AI integration framework

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB instance)
- Google AI Studio API key (for AI generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pathcraft-amana.git
   cd pathcraft-amana
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pathcraft?retryWrites=true&w=majority

   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   JWT_EXPIRES_IN=7d

   # AI Configuration (Google Gemini)
   GOOGLE_GENERATIVE_AI_API_KEY=your-google-gemini-api-key-here

   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   **Getting API Keys:**
   - **MongoDB**: Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster
   - **Google Gemini**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **JWT Secret**: Generate a random string (minimum 32 characters)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
pathcraft-amana/
├── app/
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   │   ├── register/        # User registration
│   │   │   ├── login/           # User login
│   │   │   └── me/              # Get current user
│   │   ├── paths/               # Path management
│   │   │   ├── [id]/            # Single path operations
│   │   │   │   └── clone/       # Clone path
│   │   │   └── route.ts         # List/create paths
│   │   ├── progress/            # Progress tracking
│   │   │   └── [pathId]/        # Path-specific progress
│   │   │       └── steps/       # Step completion
│   │   ├── user/                # User-specific data
│   │   │   ├── paths/           # User's created paths
│   │   │   └── progress/        # User's learning progress
│   │   ├── generate/            # AI roadmap generation
│   │   └── categories/          # Path categories
│   ├── (marketing)/             # Public pages
│   ├── (auth)/                  # Auth pages
│   ├── dashboard/               # User dashboard
│   ├── explore/                 # Browse paths
│   ├── path/                    # Path details
│   └── components/              # Reusable components
├── lib/
│   ├── models/                  # Mongoose models
│   │   ├── User.ts              # User model
│   │   ├── Path.ts              # Learning path model
│   │   └── UserProgress.ts      # Progress tracking model
│   ├── utils/                   # Utility functions
│   │   ├── validation.ts        # Zod schemas
│   │   └── apiResponse.ts       # API response helpers
│   ├── middleware/              # Custom middleware
│   │   └── auth.ts              # Authentication middleware
│   ├── ai/                      # AI-related code
│   │   └── prompts.ts           # AI prompts and config
│   ├── db.ts                    # MongoDB connection
│   ├── auth.ts                  # Auth utilities
│   └── types.ts                 # TypeScript types
└── public/                      # Static assets
```

## API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Paths

#### List Paths
```http
GET /api/paths?query=javascript&category=Web Development&difficulty=Beginner&page=1&limit=10
```

#### Create Path
```http
POST /api/paths
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "JavaScript Mastery",
  "description": "Learn JavaScript from basics to advanced",
  "category": "Web Development",
  "difficulty": "Intermediate",
  "steps": [
    {
      "title": "Variables and Data Types",
      "description": "Learn about var, let, const and data types",
      "estimatedDuration": "2 hours",
      "order": 0
    }
  ],
  "isPublic": true,
  "tags": ["javascript", "programming"]
}
```

#### Get Path
```http
GET /api/paths/[id]
```

#### Update Path
```http
PUT /api/paths/[id]
Authorization: Bearer <token>
```

#### Delete Path
```http
DELETE /api/paths/[id]
Authorization: Bearer <token>
```

#### Clone Path
```http
POST /api/paths/[id]/clone
Authorization: Bearer <token>
```

### Progress Tracking

#### Start Tracking
```http
POST /api/progress/[pathId]
Authorization: Bearer <token>
```

#### Get Progress
```http
GET /api/progress/[pathId]
Authorization: Bearer <token>
```

#### Mark Step Complete
```http
PUT /api/progress/[pathId]/steps/[stepId]
Authorization: Bearer <token>
Content-Type: application/json

{
  "completed": true
}
```

### AI Generation

#### Generate Roadmap
```http
POST /api/generate
Content-Type: application/json

{
  "topic": "React Development",
  "goal": "Build production-ready React applications",
  "difficulty": "Intermediate",
  "currentLevel": "I know HTML, CSS, and basic JavaScript"
}
```

### Categories

#### Get Categories
```http
GET /api/categories
```

## Database Models

### User
- email (unique, required)
- password (hashed, required)
- name (required)
- avatar (optional)
- timestamps

### Path
- title (required)
- description (required)
- category (required)
- difficulty (Beginner/Intermediate/Advanced)
- steps (array of step objects)
- author (reference to User)
- isPublic (boolean)
- cloneCount (number)
- tags (array of strings)
- timestamps

### UserProgress
- userId (reference to User)
- pathId (reference to Path)
- completedSteps (array of step IDs)
- status (active/completed/archived)
- startedAt, lastActivityAt, completedAt
- timestamps

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT (use a strong random string)
- `JWT_EXPIRES_IN` - Token expiration (e.g., "7d")
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google Gemini API key
- `NEXT_PUBLIC_APP_URL` - Your production URL

## Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@pathcraft.com or open an issue in the repository.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Google Gemini](https://ai.google.dev/)
- Database by [MongoDB](https://www.mongodb.com/)
- Deployed on [Vercel](https://vercel.com/)
