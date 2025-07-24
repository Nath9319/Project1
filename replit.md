# MindSync - Collaborative Journaling Platform

## Overview

MindSync is a collaborative note-taking and emotional tracking platform designed for individuals, couples, and groups to document emotional patterns, important conversations, and meaningful moments. Unlike social media apps, MindSync focuses on collaborative note-taking where users can add individual emotional triggers and create group notes to help members understand each other better. The application features color-coded activity tracking to highlight different types of user activities and interactions, along with a calendar view to visualize journaling patterns over time.

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

### Multi-Language Support
- **Supported Languages**: Top 20 most spoken languages worldwide including English, Chinese, Spanish, Hindi, Arabic, Bengali, Portuguese, Russian, Japanese, etc.
- **Regional Ordering**: Languages are dynamically ordered based on user's geographic location using timezone detection
- **RTL Support**: Full right-to-left layout support for Arabic and Urdu
- **Translation System**: Comprehensive translation keys for all UI elements
- **Language Persistence**: Selected language is saved in localStorage and applied on page load
- **Language Selector**: Accessible dropdown in navigation bar with native language names

### Color Theme System
- **Mental Health-Based Themes**: 8 calming color schemes based on psychological research for stress reduction
  - Serene Blue: Reduces heart rate and promotes tranquility
  - Healing Green: Nature-inspired for balance and renewal  
  - Soft Pastels: Lower cortisol levels and cognitive load
  - Teal Harmony: Mental clarity and open dialogue
  - Moonlight Calm: Dark theme for reduced eye strain
- **LGBTQ+ Inclusive Themes**: Pride flag themes for identity celebration
  - Pride Rainbow: Classic 6-color rainbow flag
  - Trans Pride: Soft blue, pink, and white
  - Bi Pride: Pink, purple, and blue
  - Non-Binary Pride: Yellow, white, purple, and black
  - Ace Pride: Black, gray, white, and purple
  - Lesbian Pride: Warm sunset orange tones
  - Pan Pride: Pink, yellow, and cyan
- **Theme Persistence**: Selected theme saved in localStorage
- **Dynamic CSS Variables**: Real-time theme switching without page reload
- **Accessible Design**: All themes maintain WCAG contrast ratios

### Navigation and Mode System
- **SharedNavigation Component**: Unified navigation bar used across all pages for consistency
- **Mode Toggle**: Personal vs Public mode switcher with distinct visual themes
- **Persistent Mode Indicator**: Always-visible mode indicator (left side on desktop, top on mobile) that remains visible while scrolling
- **Theme Support**: Full dark/light mode support with system preference detection
- **Mode Enforcement**: Dashboard (Journal) is always in personal mode, Groups are always in public mode

### Authentication System
- **Provider**: Replit Auth with OIDC
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Authorization**: Route-level protection with isAuthenticated middleware
- **User Management**: Automatic user creation/updates on successful authentication

### Note-Taking and Emotional Tracking Features
- **Rich Text Editor**: Custom component with markdown-style formatting for detailed notes
- **Individual Emotional Triggers**: Personal mood tracking with visual mood selector and predefined emotional states
- **Group Notes**: Collaborative notes that help group members understand each other better
- **Color-Coded Activity Tracking**: Visual representation of different user activities and interaction types
- **Tagging System**: Dynamic tag input with suggestions and autocomplete
- **Entry Interactions**: Comment system for collaborative feedback and understanding
- **Personal Mode Journal Features**: 
  - No social features (share, like, edit) in personal mode
  - Reflection capability for older entries - users can add reflections that bring entries back to top
  - Journal-like aesthetic with warm orange theme and date-focused layout
  - Private sanctuary feel with reassuring privacy messaging

### Group Collaboration
- **Group Management**: Create, join, and manage journaling groups
- **Member Roles**: Admin and member roles with different permissions
- **Invitation System**: Email-based group invitations with secure tokens
- **Privacy Controls**: Private vs group visibility for entries

### Planning and Scheduling Features
- **Plans/Events**: Create and manage plans for groups or partner spaces
- **Participant Management**: Invite members to plans with RSVP tracking
- **Reminders**: Set personal reminders for plans or general tasks
- **Bookings**: Track reservations, tickets, and appointments
- **Sharing Controls**: Share bookings with specific subgroups or individuals
- **Cost Tracking**: Record costs and currencies for bookings

### Partner Feature
- **Partner Space**: Private space for couples to share entries and communicate
- **Invitation System**: Invite partners via email or username
- **Privacy**: Separate from group spaces, designed for intimate sharing between two people
- **Status Tracking**: Pending invitations and active partner connections

### Analytics & Insights
- **Mood Analytics**: Track emotional patterns over time
- **Engagement Metrics**: Monitor group activity and participation
- **Personal Insights**: Individual progress tracking and reflection tools

### Calendar View
- **Modern Tile-Based Design**: Each date is displayed as a modern rounded tile with glassmorphism effects
- **User-Selected Colors**: Calendar tiles display the actual colors users selected for their entries
- **Visual Indicators**: 
  - Single color entries show a colored overlay
  - Multiple entries show gradient backgrounds and color dots
  - Entry count badges with purple-to-pink gradient
- **Interactive Navigation**: Clicking a date with entries scrolls to the first entry of that day
- **Hover Effects**: Tiles lift and show preview information on hover
- **Today & Selected States**: Special visual treatments for current date and selected date
- **Monthly Summary**: Total entries, days written, and daily average statistics

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