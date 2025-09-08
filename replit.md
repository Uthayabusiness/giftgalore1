# Overview

This is a full-stack e-commerce gift store application called "GiftVault" built with React frontend and Express backend. The application allows users to browse, search, and purchase gifts across various categories like birthdays, anniversaries, weddings, and corporate gifts. It features user authentication, shopping cart functionality, order management, and an admin panel for product and order management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with separate routes for authenticated and unauthenticated users
- **State Management**: React Query (TanStack Query) for server state and React Context for cart management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect using Neon serverless database
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **API Design**: RESTful API with route-based organization and middleware for authentication

## Authentication & Authorization
- **Provider**: Replit OpenID Connect (OIDC) authentication
- **Session Storage**: PostgreSQL-backed sessions with HTTP-only cookies
- **Authorization**: Role-based access control (user/admin roles) with middleware protection
- **Security**: Secure cookies, CSRF protection, and unauthorized request handling

## Database Schema
- **Users**: Profile management with role-based permissions
- **Products**: Catalog with categories, images, pricing, and inventory
- **Categories**: Hierarchical product organization with slugs
- **Shopping Cart**: User-specific cart items with quantity management
- **Orders**: Complete order lifecycle with items, shipping, and status tracking
- **Sessions**: Secure session storage for authentication state

## External Dependencies

- **Database**: Neon PostgreSQL serverless database with connection pooling
- **Authentication**: Replit OIDC service for user authentication
- **UI Components**: Radix UI primitives for accessible component foundation
- **Development Tools**: Replit-specific development tooling and error overlays
- **Styling**: Tailwind CSS with custom design system and Google Fonts integration
- **Build Tools**: Vite for frontend bundling and esbuild for backend compilation