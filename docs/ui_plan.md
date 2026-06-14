# Frontend Implementation Plan (Next.js 15)

## Goals
- Build a production-ready frontend for the ISP Billing platform aligning with existing backend capabilities.
- Prioritize maintainability, performance, and developer ergonomics.

## Application Structure Overview

The billing frontend consists of **3 distinct application types**, each serving different user groups:

### 1. **Captive Portal / End-User Package Purchase Page**
   - **Purpose**: When customers connect to WiFi, the MikroTik hotspot intercepts their first HTTP request and serves `hotspot/login.html`, which redirects them to this page. (There is **no RADIUS**; authentication is local hotspot users created via the polling agent.)
   - **Target Users**: End users/customers who need to purchase hotspot or PPPoE packages
   - **Flow**: 
     - User connects to WiFi (hotspot) and opens any page
     - Hotspot `login.html` meta-refreshes to the org's buy page
     - Selects and purchases a package (or redeems a voucher)
     - On success the backend queues a `create_user` for the router's polling agent; the user is connected and redirected to the ISP-specified URL (default google.com)
   - **Route**: `/buy/{orgSlug}` (the org-scoped buy page the hotspot redirects to)
   - **Features**: Package selection, payment processing, status feedback

### 2. **ISP SaaS Marketing Website & Account Creation**
   - **Purpose**: Public-facing website for the ISP billing software provider (SaaS product)
   - **Target Users**: Potential ISP providers looking for billing software solution
   - **Flow**:
     - Users search for ISP software providers
     - Land on marketing page showcasing services and features
     - Click to create account
     - Fill registration form for ISP provider account
     - Redirected to login page upon successful registration
   - **Routes**: 
     - `/` - Main marketing landing page
     - `/signup` - Account creation page for ISP providers
     - `/login` - Login page
   - **Features**: Service showcase, pricing, testimonials, feature highlights, ISP account registration

### 3. **ISP Provider Admin Dashboard**
   - **Purpose**: Control panel for registered ISP providers to manage their billing operations
   - **Target Users**: Registered ISP providers (admins)
   - **Flow**:
     - ISP provider logs in
     - Redirected to dashboard
     - Manages users, packages, payments, routers, SMS, settings
   - **Route**: `/dashboard/*`
   - **Features**: Full billing management system (users, packages, payments, routers, SMS, reports, settings)

## Tech Stack
- Framework: Next.js 15 (App Router, RSC where safe, Route Groups)
- Language: TypeScript strict
- UI: Tailwind CSS + shadcn/ui (stable components; radix primitives)
- Data: TanStack Query (React Query) 5 for server state
- Store: Zustand for lightweight global client state
- HTTP: Axios with centralized base API (/lib/api.ts) and interceptors
- Forms: React Hook Form + Zod
- Icons: Lucide React
- Charts: Recharts
- Toasts: Sonner
- Auth: JWT via backend endpoints (token stored in httpOnly cookie via API route proxy or memory + refresh)
- Lint/Format: ESLint (next/core-web-vitals) + Prettier

## Architecture
- app/ routes with route groups:
  - (marketing)/ - Public marketing pages (landing, signup, login)
  - (captive)/ - Captive portal for end-user package purchase
  - (dashboard)/ - ISP provider admin dashboard with protected routes
- components/ UI primitives + feature components organized by domain
- features/ domain modules (dashboard, routers, users, packages, payments, sms, auth)
- providers/ (QueryClientProvider, ThemeProvider, Zustand hydration)
- lib/ (api client, utils, env)
- hooks/ for common hooks (useAuth, useToast, useDebounce)
- types/ shared TS types aligned with backend schemas

## Navigation

### Marketing Site Navigation
- Header: Home, Features, Pricing, About, Contact, Login, Sign Up (CTA)
- Footer: Links, social media, company info

### Captive Portal Navigation
- Minimal navigation focused on package selection and purchase
- Branding header only

### Admin Dashboard Navigation
- Side navigation with sections: Dashboard, Users, Packages, Payments, SMS, Routers, Reports, Settings
- Breadcrumbs + page titles
- User dropdown menu (profile, settings, logout)

## Data Access Strategy
- All requests through axios base instance with X-Requested-With and auth headers; .env.local defines NEXT_PUBLIC_API_BASE_URL.
- React Query for fetching/mutations; optimistic updates for simple actions (disconnect user, top-up create).

## Sprints

### Phase 1: Public-Facing Pages
1) Sprint 1 – Marketing Landing Page
   - Hero section with value proposition
   - Features showcase
   - Pricing section
   - Testimonials
   - Call-to-action buttons
   - Header and footer navigation
   
2) Sprint 2 – Authentication Pages
   - ISP provider signup page with multi-step form
   - Login page
   - Password reset flow
   - Email verification

3) Sprint 3 – Captive Portal
   - End-user package selection page
   - Payment integration for customers
   - Success/redirect flow after purchase
   - Mobile-responsive design

### Phase 2: Admin Dashboard (ISP Provider Portal)
4) Sprint 4 – Scaffolding & Foundations
   - Configure route groups and layouts
   - Providers (Query, Theme), base API, Zustand store
   - Dashboard layout with sidebar navigation
   
5) Sprint 5 – Dashboard Overview
   - Wire /reports/analytics/dashboard charts (revenue, users, routers, tickets)
   - Stats cards and key metrics
   
6) Sprint 6 – Routers Management
   - List routers, active connections, disconnect action
   - Add/edit router functionality with multi-step wizard
   
7) Sprint 7 – Users Management
   - Active users and all users tables
   - Filters, search, pagination
   - User actions (suspend, delete, edit)
   
8) Sprint 8 – Packages Management
   - Plans list with CRUD operations
   - Create package modal/page
   - Package categories (hotspot/PPPoE)
   
9) Sprint 9 – Payments
   - Payments list, stats, filters
   - Payment gateway settings
   
10) Sprint 10 – SMS Management
    - SMS account balance display
    - Top-up modal
    - SMS analytics and history
    
11) Sprint 11 – Settings & Configuration
    - General settings
    - Payment gateway settings
    - PPPoE/Hotspot settings
    - Notification settings
    - SMS gateway settings
    
12) Sprint 12 – Polish & Production
    - Error boundaries
    - Loading states
    - Toast notifications
    - Mobile responsiveness
    - Performance optimization

## Libraries versions (stable)
- next ^15
- react ^18.3
- @tanstack/react-query ^5
- axios ^1
- zustand ^4
- tailwindcss ^3.4
- class-variance-authority, tailwind-merge
- lucide-react ^0.441
- recharts ^2.10
- react-hook-form ^7, zod ^3, @hookform/resolvers
- sonner ^1
- shadcn/ui (generated components pinned by install script)

## API Surface used (initial)
- Dashboard: GET /api/v1/reports/analytics/dashboard
- Routers: GET /api/v1/routers/, GET /api/v1/routers/{id}/active-connections, POST /api/v1/routers/{id}/disconnect-user
- Users: GET /api/v1/users/
- Packages: GET /api/v1/plans/
- Payments: GET /api/v1/billing/payments
- SMS: GET /api/v1/sms-credit/accounts/{id}/balance, POST /api/v1/sms-credit/accounts/{id}/top-up, GET /api/v1/sms-credit/accounts/{id}/analytics

## Security & UX
- Error boundaries per feature
- Toasts for success/error
- Loading and empty states
- Accessible components via shadcn/ui

## Deliverables
- A runnable Next.js app under isp-billing-frontend/
- Documentation (this file) and root README with commands

---

## Implementation Status & Features

### ✅ Completed Features

#### **Authentication & Authorization**
- [x] **Centralized Auth Store** (Zustand with localStorage persistence)
  - JWT token management with automatic expiry handling
  - User state management with role-based access control
  - Auto-redirect on authentication failures
- [x] **Login System**
  - Marketing login page with error handling and loading states
  - Integration with backend `/auth/login` endpoint
  - Automatic redirect to dashboard on successful login
- [x] **Auth Guard Component**
  - Role-based route protection (admin, technician, user)
  - Automatic redirect to login for unauthenticated users
  - Permission-based access control
- [x] **Dashboard Layout Protection**
  - All dashboard routes wrapped with AuthGuard
  - Minimum role requirement: technician

#### **State Management**
- [x] **Centralized API Store** (Zustand)
  - Axios-based HTTP client with interceptors
  - Automatic authentication header injection
  - Centralized error handling (401, 403, etc.)
  - Base URL configuration from environment
- [x] **Provisioning Store** (Zustand)
  - Complete provisioning workflow state management
  - Device connection tracking
  - Configuration state persistence
  - Session management for live streaming
- [x] **Token Persistence**
  - LocalStorage integration for auth state
  - Automatic token refresh on app reload
  - Secure token handling with httpOnly cookie support

#### **API Integration**
- [x] **Centralized Base URL Configuration**
  - Environment-based API URL (`NEXT_PUBLIC_API_URL`)
  - All endpoints use relative paths
  - No hardcoded `/api/v1` prefixes in components
- [x] **Axios Integration**
  - Replaced all fetch() calls with axios
  - Automatic JSON parsing and error handling
  - Request/response interceptors for auth
- [x] **API Endpoints Implemented (30+ endpoints)**:
  - **Authentication (3)**: `/auth/login`, `/auth/me`, `/auth/logout`
  - **Users (7)**: GET list, GET by ID, PATCH update, PATCH status, PATCH activate, PATCH deactivate, DELETE
  - **Packages (7)**: GET list, GET by ID, POST create, PATCH update, DELETE, PATCH activate, PATCH deactivate
  - **Routers (3)**: GET list, GET active connections, POST disconnect user
  - **Provisioning (6)**: GET bootstrap command, POST device scan, POST workflow, GET session status, WebSocket stream, GET script
  - **Payments (1)**: GET payments list
  - **SMS (6)**: GET balance, GET analytics, POST top-up, MPESA initiate, MPESA status, POST process
  - **Settings (2)**: GET configuration, POST configuration
  - **Gateway (3)**: GET config, POST config, POST validate
  - **Reports (1)**: GET dashboard analytics
- [x] **React Query Integration**
  - All queries with automatic caching
  - All mutations with optimistic updates
  - Toast notifications for success/error
  - Automatic query invalidation after mutations

#### **UI Components & Pages**

##### **Marketing Site**
- [x] **Landing Page**
  - Hero section with value proposition
  - Features showcase with icons
  - Pricing section
  - Testimonials
  - Call-to-action buttons
  - Responsive navbar with logo (Codevertex Africa Limited)
  - Footer with links and company info
  - SVG illustrations throughout
- [x] **Login Page**
  - Form validation and error handling
  - Loading states and spinners
  - Remember me functionality
  - Forgot password link
  - Integration with auth store
- [x] **Signup Page** (Pending backend integration)

##### **Dashboard**
- [x] **Layout & Navigation**
  - Collapsible sidebar on mobile
  - Logo display from system settings
  - Breadcrumbs navigation
  - User dropdown menu (profile, settings, logout)
  - Responsive design for mobile/tablet/desktop
- [x] **Dashboard Overview**
  - Stats cards (Revenue, Active Users, Routers, Tickets)
  - Revenue chart (7-day trend)
  - Active users chart
  - Recent payments table
  - Quick actions section
  - Fallback data for demonstration
- [x] **Routers Management**
  - Routers list table with filters and search
  - Board name, provisioning status, CPU, memory, status display
  - Remote Winbox links
  - Action dropdown (View, Regenerate Winbox, Reprovision, Sync)
  - Active connections view
  - Disconnect user functionality
  - **Router Details Page**:
    - General information (IP, username, password, API port)
    - Polling-agent status (last poll, online/offline, pending commands) — NAT-safe command channel (no RADIUS)
    - CPU, Memory, Disk usage metrics
    - MikroTik availability chart (30-day uptime)
    - Performance overview
    - Device information (RouterOS version, hardware model, ICMP stats)
    - Tabbed interface (System Info, Events, Reports, Users, Payments, Backups)
  - **Provisioning Wizard** (3-step process):
    - **Step 1 (Connection)**: Router identity and initial setup
    - **Step 2 (Device Details)**: Command generation with token-based auth
    - **Step 3 (Service Setup)**: Interface selection, service configuration, live logs
    - Support for first-time provisioning and reprovisioning workflows
    - Live command generation with proper access tokens
    - Device scanning for interfaces and services
    - Live streaming provisioning logs via WebSocket
    - Network calculation (gateway, DHCP pool auto-generation)
- [x] **Users Management**
  - Active users page with real-time status
  - All users page with comprehensive filters
  - Search functionality
  - Pagination
  - User status indicators
  - Action dropdowns (Edit, Suspend, Delete)
- [x] **Packages Management**
  - Tabbed interface (Hotspot, PPPoE, Bundles)
  - Package list with filters and search
  - Create package form with validation
  - Quick package templates
  - Price, validity, bandwidth display
  - Status management
- [x] **Payments**
  - Payments list with filters (status, date range)
  - Payment method indicators
  - Amount and transaction ID display
  - User information
  - Export functionality
- [x] **SMS Management**
  - Balance display with real-time updates
  - Top-up modal with MPESA integration
  - Analytics dashboard (30-day trend)
  - Transaction history
  - Cost per SMS display
- [x] **Settings**
  - **Tabbed Interface**:
    - General Settings (system name, logo upload, terms & conditions editor)
    - Payment Gateway Settings (provider-specific fields, validation)
    - PPPoE Settings
    - Hotspot Settings
    - SMS Gateway Settings (provider-specific fields)
    - Notification Settings
  - Rich text editor for terms & conditions (React Quill)
  - File upload for system logo
  - Test gateway functionality
  - Dark/Light mode support
  - System logo display on sidebar

##### **Additional Features**
- [x] **Custom 404 Page**
  - Friendly error message
  - Buttons to redirect to dashboard or home
  - Illustrations
- [x] **Loading States**
  - Skeleton loaders for pages
  - Spinner loaders for actions
  - Progress indicators for async operations
- [x] **PWA Support**
  - Web app manifest
  - Service worker configuration
  - App icons for mobile devices
- [x] **Responsive Design**
  - Mobile-first approach
  - Tablet optimization
  - Desktop layouts
  - Collapsible sidebar on mobile
  - Touch-friendly interfaces
- [x] **Theme Support**
  - Light mode
  - Dark mode
  - Theme persistence
  - Creamy white background (customized)

#### **Provisioning System**
- [x] **Bootstrap Command Generation**
  - Token-based authentication for script access
  - Dynamic domain detection
  - Secure script download via HTTPS
  - Command validation
- [x] **Device Scanning**
  - Live MikroTik interface detection
  - Service discovery (Hotspot, PPPoE)
  - Network configuration retrieval
  - System information gathering
- [x] **Workflow Management**
  - Multi-step provisioning process
  - Session tracking
  - Progress monitoring
  - Error handling and rollback
- [x] **Live Streaming**
  - WebSocket integration for real-time logs
  - Console-style log display
  - Auto-scroll functionality
  - Connection status indicators
- [x] **Network Calculation**
  - Automatic gateway calculation
  - DHCP pool generation
  - Custom subnet support
  - CIDR validation

#### **Code Organization**
- [x] **Modular Architecture**
  - Feature-based folder structure
  - Reusable components library
  - Centralized API clients
  - Domain-specific hooks
- [x] **Type Safety**
  - Full TypeScript coverage
  - Shared types aligned with backend schemas
  - Type-safe API calls
  - Zod validation schemas
- [x] **Environment Configuration**
  - Frontend `.env.example` with all required variables
  - Backend `env.example` with frontend URLs
  - Centralized environment variable management

### 🚧 In Progress

- [ ] **Captive Portal**
  - End-user package selection page
  - Payment integration for customers
  - Success/redirect flow after purchase
  - Mobile-responsive design

### 📋 Pending / Next

- [ ] **Backend Integration Completion**
  - Signup API integration
  - Password reset flow
  - Email verification
  - User CREATE operation (edit, delete, suspend already wired)
  - Router CRUD operations
  - Additional reporting endpoints
  
- [ ] **Advanced Features**
  - 2FA settings page
  - Billing & Subscription management
  - System Users management
  - System Logs viewer
  - Feature/Bug reporting
  - Shop Equipment catalog
  - Contact Support system

- [ ] **Testing**
  - Unit tests for hooks
  - Integration tests for API calls
  - E2E tests for critical workflows
  - Component tests with React Testing Library

- [ ] **Performance Optimization**
  - Code splitting
  - Image optimization
  - Lazy loading for heavy components
  - Bundle size optimization

- [ ] **Documentation**
  - Component documentation
  - API integration guide
  - Deployment guide
  - Developer onboarding guide

## Current Implementation Summary

### **Architecture Highlights**
- ✅ **Centralized State Management**: Zustand stores for auth, API, and provisioning
- ✅ **Token-Based Authentication**: JWT with localStorage persistence and auto-refresh
- ✅ **Role-Based Access Control**: Admin, Technician, User roles with route protection
- ✅ **Modular Codebase**: Feature-based organization with reusable components
- ✅ **Type Safety**: Full TypeScript coverage with shared types
- ✅ **Responsive Design**: Mobile-first approach with PWA support
- ✅ **Real-Time Updates**: WebSocket integration for live provisioning logs
- ✅ **Production-Ready**: Error handling, loading states, and user feedback

### **API Integration Status**
- ✅ **Axios-based HTTP client** with interceptors
- ✅ **All endpoints** use relative paths with centralized base URL
- ✅ **Automatic error handling** for authentication failures
- ✅ **Token injection** for authenticated requests
- ✅ **Environment-based configuration** for different deployment environments

### **Key Technical Achievements**
1. **Modular Provisioning System**: Complete 3-step workflow with live streaming
2. **Centralized Authentication**: Role-based access control across the entire app
3. **Responsive UI**: Mobile-optimized with collapsible sidebar and touch-friendly interfaces
4. **Real-Time Features**: WebSocket integration for live provisioning logs
5. **Production-Ready UX**: Comprehensive loading states, error handling, and user feedback
6. **Type-Safe Codebase**: Full TypeScript coverage with Zod validation
7. **Scalable Architecture**: Feature-based organization for easy maintenance and extension
