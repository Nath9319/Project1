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

## Recent Changes

### January 26, 2025
- **Tablet Preview Functionality**: Added responsive preview controls for testing journal on different device sizes
  - Created ResponsivePreview component with mobile (375px), tablet (768px), and desktop (1440px) preview modes
  - Located in bottom-left corner with glassmorphism styling
  - Smooth viewport transitions when switching between device sizes
  - Auto mode shows current viewport width
- **Partner Page Authentication Fix**: Fixed TypeScript errors in partner.tsx
  - Corrected apiRequest method calls to use proper parameter format
  - Fixed Date type conversion issue for createdAt field
  - Partner page requires authentication - returns 401 when user is not logged in (expected behavior)

### July 25, 2025
- **Glassmorphism Design Implementation**: Applied consistent iOS liquid glass display with 3D effects throughout the interface
  - Updated dashboard page to use SharedNavigation component
  - Replaced all colored gradient backgrounds with glass shadow-ios styling
  - Fixed JSX closing tag errors in dashboard component
  - Updated landing page to use SharedNavigation and glassmorphism cards
  - Applied hover effects (shadow-ios-xl) to all interactive cards
  - Maintained mobile-first responsive design with touch-friendly interfaces
  - Fixed TypeScript errors in partner.tsx (apiRequest parameters and Date type handling)
  - Updated all glass-card classes to use consistent glass class across partner, calendar, and template-selector pages
  - Removed deprecated glass-card and glass-card-dark CSS definitions
- **Navigation Bar UI Fixes**: Resolved profile icon overflow issue in dark mode
  - Added overflow-hidden to navigation container to prevent elements from pushing out
  - Reduced spacing and sizes for better responsive behavior (space-x-2 on md, space-x-3 on lg)
  - Made profile icon and name responsive with flex-shrink-0 and max-width constraints
  - Converted language selector, theme selector, and mood selector to compact icon-only buttons (h-8 w-8)
  - Profile name now only shows on xl screens and above with truncate for long names
  - Fixed ModeToggle component props error in mobile menu
- **Translation System Updates**: Added missing 'nav.partner' translations
  - Added partner navigation support for all 6 languages (English, Chinese, Spanish, Hindi, Arabic, French)
  - Fixed LSP errors related to missing translation keys
  - Partner page now fully accessible via Privacy Mode Selector and mobile menu
- **Media Upload UI Redesign**: Converted full-width buttons to compact icon buttons
  - Changed from grid layout with full-width buttons to horizontal flex layout with circular icon buttons
  - Each media button (Upload, Photos, Voice, Video) now displayed as 10x10 rounded pills with glassmorphism styling
  - Added subtle gradient backgrounds to each icon button for visual distinction
  - Improved mobile experience with consistent touch-friendly 40px button size
  - Added proper accessibility with title attributes and screen reader labels
- **Navigation Bar Overlap Fix**: Resolved MindSync branding overlapping with Privacy Mode Selector tiles
  - Completely removed MindSync text from navigation bar to eliminate overlap
  - Kept only the icon logo (8x8) which changes based on personal/public mode
  - Centered Privacy Mode Selector with flex-1 and justify-center
  - Adjusted Privacy Mode button padding from px-4 to px-3 for tighter spacing
  - Converted Insights button to icon-only circular button (10x10) to save space
  - Removed MindSync branding from mobile menu title (now just "Menu")
  - Added proper responsive spacing between navigation elements
  - Added custom CSS class for Privacy Mode Selector with proper z-index
  - Changed navigation layout to use block and nested flex for better centering
  - Added mx-4 margin to center navigation area to prevent edge overlap
  - Set page title to "Journal" in HTML to avoid any branding conflicts