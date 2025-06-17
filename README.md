# LifeQuest - Gamified Life Tracking

A full-stack web application that transforms goal achievement into an engaging, game-like experience with automatic timeline generation, task management, Pomodoro timer integration, and RPG-style progression systems.

## Features

- **Goal Setting & Timeline Generation**: Create short-term and long-term goals with automatic milestone task generation
- **Task Management**: Enhanced task system with categories, priorities, time estimation, and external resource links
- **Pomodoro Timer Integration**: Built-in focus timer with task association and bonus rewards
- **Gamification System**: XP, levels, gems, streaks, and achievements to motivate progress
- **Progress Tracking**: Visual progress indicators and comprehensive statistics

## Tech Stack

- **Frontend**: React 18 with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js with Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Auth
- **State Management**: TanStack Query (React Query)

## Deployment

### Vercel Deployment

1. **Prerequisites**:
   - GitHub account
   - Vercel account
   - PostgreSQL database (Neon recommended)

2. **Environment Variables**:
   Set these in your Vercel dashboard:
   ```
   DATABASE_URL=your_postgresql_connection_string
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   ```

3. **Deploy**:
   - Push your code to GitHub
   - Import the repository in Vercel
   - Configure environment variables
   - Deploy!

### Firebase Hosting (Static + Functions)

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**:
   ```bash
   firebase init
   ```

3. **Deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

## Database Setup

1. Create a PostgreSQL database (Neon.tech recommended for free tier)
2. Set the `DATABASE_URL` environment variable
3. Run database migrations:
   ```bash
   npm run db:push
   ```

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file with your database and Firebase credentials

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Push database schema**:
   ```bash
   npm run db:push
   ```

The app will be available at `http://localhost:5000`

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and configurations
├── server/               # Express.js backend
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── index.ts          # Server entry point
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema definitions
└── api/                  # Vercel serverless functions
```

## License

MIT License