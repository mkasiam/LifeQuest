# LifeQuest - Comprehensive Goal-Setting & Life Tracking Application

## Overview

LifeQuest is a full-stack web application that transforms goal achievement into an engaging, game-like experience. The application combines goal-setting with automatic timeline generation, task management, Pomodoro timer integration, and RPG-style progression systems including XP, levels, streaks, gems, and achievements. Users can set short-term or long-term goals, automatically receive milestone tasks with deadlines, add external resources like YouTube videos, use focused work sessions with Pomodoro timers, and earn rewards for timely completion.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API**: RESTful API design with JSON responses
- **Development**: Hot reloading with Vite middleware integration
- **Error Handling**: Centralized error handling middleware

### Data Storage
- **Database**: PostgreSQL (configured via Drizzle)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations
- **Development Storage**: In-memory storage implementation for rapid prototyping
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)

## Key Components

### Database Schema
The application uses five main tables:
- **Users**: Stores user credentials, level, XP, streaks, gems, and activity tracking
- **Goals**: Manages short-term and long-term goals with deadlines and completion status
- **Tasks**: Enhanced task management with estimated time, external links, goal association, gem rewards, and on-time completion tracking
- **Pomodoro Sessions**: Tracks focused work sessions with duration, completion status, and task association
- **Achievements**: Tracks user achievements with timestamps and descriptions

### Authentication & Authorization
- Simplified authentication system (currently using default user ID for demo)
- Session-based authentication structure prepared for full implementation
- User context management through query client

### Core Features

#### Goal-Setting & Timeline Generation
- **Goal Creation**: Short-term (1-30 days) and long-term (30+ days) goal types
- **Automatic Timeline**: System generates milestone tasks based on goal deadline
- **Smart Scheduling**: Tasks distributed optimally across timeline period
- **Deadline Tracking**: Visual countdown and progress indicators

#### Enhanced Task Management
- **CRUD Operations**: Full task lifecycle management with goal association
- **Resource Integration**: External links (YouTube videos, articles) attached to tasks
- **Time Estimation**: Task duration planning for better scheduling
- **Categorization**: Organized task categories (personal, work, health, learning)
- **Priority System**: Three-tier priority levels with visual indicators

#### Pomodoro Timer Integration
- **Multiple Timer Types**: Pomodoro (25min), short break (5min), long break (15min), custom sessions
- **Task Association**: Link timer sessions to specific tasks for focused work
- **Session Tracking**: Complete history of all focus sessions
- **Bonus Rewards**: Extra XP earned for completed Pomodoro sessions
- **Audio Notifications**: Timer completion alerts

#### Advanced Gamification System
- **XP System**: Tasks reward 5-100 XP based on complexity and completion
- **Gem Rewards**: Special currency earned for completing tasks on time
- **Leveling**: 100 XP per level progression with visual progress rings
- **Streaks**: Daily activity tracking for sustained engagement
- **Achievements**: Milestone-based reward system for major accomplishments
- **Progress Tracking**: Comprehensive visual indicators and statistics

## User Interface Features

### Dashboard Overview
- **Progress Ring**: Large visual indicator showing daily completion percentage
- **Goal Display**: Active goals with countdown timers and completion status
- **Integrated Pomodoro Timer**: Built-in focus timer with task association
- **Achievement Gallery**: Recent accomplishments and milestone rewards
- **Gem Counter**: Visual display of earned gems for on-time completions

### Task Interface Enhancements
- **External Link Integration**: Clickable YouTube and resource links on each task
- **Time Estimation Display**: Visual indicators for estimated completion time
- **Gem Reward Badges**: Special indicators for on-time completion bonuses
- **Pomodoro Integration**: One-click timer start for focused work sessions
- **Priority Color Coding**: Visual priority system with color-coded badges

## Data Flow

1. **Client Request**: React components trigger API calls through TanStack Query
2. **API Processing**: Express routes handle requests and validate data using Zod schemas
3. **Data Operations**: Storage layer (currently in-memory, designed for PostgreSQL) processes data
4. **Response**: JSON responses sent back to client
5. **State Updates**: TanStack Query updates client state and triggers re-renders
6. **UI Updates**: Components reflect new state with optimistic updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation integration
- **zod**: Runtime type validation and schema definition

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives (20+ components)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript runtime for development
- **esbuild**: Production bundling for server code

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Reloading**: Vite middleware integration for instant updates
- **Port Configuration**: Server runs on port 5000 with proxy setup
- **Database**: PostgreSQL 16 module configured in Replit

### Production Build
- **Client Build**: Vite builds React app to static files
- **Server Build**: esbuild bundles server code with external dependencies
- **Asset Serving**: Express serves static files in production
- **Environment Variables**: DATABASE_URL required for database connection

### Deployment Configuration
- **Target**: Replit Autoscale deployment
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Port Mapping**: Internal port 5000 mapped to external port 80

## Changelog

```
Changelog:
- June 17, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```