# MindSync - Collaborative Journaling Platform

## Overview

MindSync is a collaborative journaling platform that allows individuals, couples, and groups to track emotional patterns, important conversations, and meaningful moments through timestamped entries. The application is built as a full-stack web application using modern technologies with a focus on real-time collaboration and emotional wellness tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with a clear separation between client, server, and shared components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with Tailwind CSS for styling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage

### Database Design
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle migrations with schema definitions in shared folder
- **Key Tables**: users, groups, group_members, entries, entry_interactions, group_invitations, sessions

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Authorization**: Route-level protection with isAuthenticated middleware
- **User Management**: Automatic user creation/updates on successful authentication

### Journaling Features
- **Rich Text Editor**: Custom component with markdown-style formatting
- **Mood Tracking**: Visual mood selector with predefined emotional states
- **Tagging System**: Dynamic tag input with suggestions and autocomplete
- **Entry Interactions**: Like and comment system for collaborative engagement

### Group Collaboration
- **Group Management**: Create, join, and manage journaling groups
- **Member Roles**: Admin and member roles with different permissions
- **Invitation System**: Email-based group invitations with secure tokens
- **Privacy Controls**: Private vs group visibility for entries

### Analytics & Insights
- **Mood Analytics**: Track emotional patterns over time
- **Engagement Metrics**: Monitor group activity and participation
- **Personal Insights**: Individual progress tracking and reflection tools

## Data Flow

### Entry Creation Flow
1. User composes entry using rich text editor
2. Selects mood states and adds tags
3. Chooses visibility (private or specific group)
4. Entry is validated on client and server
5. Stored in database with timestamp and metadata
6. Real-time updates to relevant group members

### Authentication Flow
1. User initiates login through Replit Auth
2. OIDC handshake with Replit identity provider
3. User information retrieved and stored/updated in database
4. Session created and stored in PostgreSQL
5. Client receives authentication status and user data

### Group Interaction Flow
1. Group members can view shared entries
2. Members can like or comment on entries
3. Interactions are stored and tracked
4. Real-time notifications for new activity
5. Analytics aggregation for insights

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database ORM
- **@neondatabase/serverless**: PostgreSQL driver for Neon
- **express**: Web server framework
- **passport**: Authentication middleware

### UI and Styling
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant styling
- **lucide-react**: Icon library

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server with HMR for frontend
- **API Server**: Express server with tsx for TypeScript execution
- **Database**: Neon PostgreSQL with connection pooling
- **Environment**: Replit-optimized with cartographer integration

### Production Build
- **Frontend**: Vite build generating optimized static assets
- **Backend**: esbuild bundling server code into single distribution file
- **Database**: Drizzle migrations applied automatically
- **Deployment**: Single command deployment with `npm start`

### Configuration Management
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS
- **Build Configuration**: Separate configs for client and server builds
- **Path Aliases**: Consistent import paths using TypeScript path mapping

The architecture prioritizes developer experience with hot reloading, type safety, and clear separation of concerns while maintaining production readiness with optimized builds and scalable database design.