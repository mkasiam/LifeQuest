# LifeQuest - Gamified Task Management Application

## Overview

LifeQuest is a full-stack web application that gamifies task management by incorporating RPG-like elements such as experience points (XP), levels, streaks, and achievements. Users can create and manage daily tasks, earn XP for completing them, and track their progress through a leveling system.

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
The application uses three main tables:
- **Users**: Stores user credentials, level, XP, streaks, and activity tracking
- **Tasks**: Manages task details, categories, priorities, completion status, and XP rewards
- **Achievements**: Tracks user achievements with timestamps and descriptions

### Authentication & Authorization
- Simplified authentication system (currently using default user ID for demo)
- Session-based authentication structure prepared for full implementation
- User context management through query client

### Gamification System
- **XP System**: Tasks reward 5-100 XP based on complexity
- **Leveling**: 100 XP per level progression
- **Streaks**: Daily activity tracking for engagement
- **Achievements**: Milestone-based reward system
- **Progress Tracking**: Visual progress indicators and statistics

### Task Management
- **CRUD Operations**: Full task lifecycle management
- **Categorization**: Organized task categories (personal, work, health, etc.)
- **Priority System**: Three-tier priority levels (low, medium, high)
- **Scheduling**: Optional due times for tasks
- **Date-based Organization**: Tasks organized by specific dates

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