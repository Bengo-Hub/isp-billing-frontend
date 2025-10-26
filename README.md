# Codevertex ISP Billing System - Frontend

A modern, responsive, and feature-rich frontend application built with Next.js 15, providing a complete user interface for ISP billing and management.

## Features

### User Interface
- **Modern Design**: Clean, intuitive interface with shadcn/ui components
- **Responsive Layout**: Fully responsive design that works on desktop, tablet, and mobile
- **Dark/Light Mode**: Theme switching support
- **PWA Support**: Progressive Web App with offline capabilities
- **Real-time Updates**: Live data updates via WebSocket connections
- **Skeleton Loading**: Smooth loading states for better UX
- **Toast Notifications**: User-friendly feedback system

### Core Features
- **RBAC-Aware UI**: Role-based access control with dynamic UI elements
- **Marketing Landing Page**: Professional landing page with features, pricing, and testimonials
- **Authentication**: Complete auth flow (login, signup, password reset, email verification)
- **Dashboard**: Comprehensive analytics dashboard with charts and metrics
- **User Management**: Create, edit, delete, and manage users
- **Package Management**: Tabbed interface for different package types
- **Router Management**: Device provisioning, monitoring, and configuration
- **Billing & Payments**: Invoice generation, payment processing, and history
- **SMS Management**: SMS credit top-ups and usage tracking
- **Reports & Analytics**: Advanced reporting with export functionality
- **Settings**: Multi-tabbed settings for system configuration

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **React Query**: Efficient data fetching and caching
- **Zustand**: Centralized state management
- **Form Validation**: React Hook Form + Zod for robust form handling
- **Axios**: HTTP client with interceptors for API calls
- **Recharts**: Beautiful, responsive charts
- **React Quill**: Rich text editor for content management

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5+
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3+
- **Components**: shadcn/ui (Radix UI)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query) 5
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner
- **Rich Text Editor**: React Quill

## Project Structure

```
frontend/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Auth route group
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (dashboard)/           # Dashboard route group
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── packages/
│   │   ├── routers/
│   │   ├── billing/
│   │   ├── sms/
│   │   ├── reports/
│   │   └── settings/
│   ├── (marketing)/           # Marketing route group
│   │   ├── page.tsx           # Landing page
│   │   ├── about/
│   │   ├── pricing/
│   │   └── contact/
│   ├── layout.tsx             # Root layout
│   ├── globals.css            # Global styles
│   └── not-found.tsx          # 404 page
├── components/                 # Reusable components
│   ├── ui/                    # shadcn/ui components
│   ├── auth/                  # Auth components
│   ├── dashboard/             # Dashboard components
│   ├── forms/                 # Form components
│   ├── tables/                # Table components
│   ├── charts/                # Chart components
│   ├── navigation/            # Navigation components
│   ├── marketing/             # Marketing components
│   ├── rbac/                  # RBAC components
│   └── brand/                 # Branding components
├── features/                   # Feature-specific code
│   ├── auth/                  # Auth feature
│   │   ├── api.ts            # Auth API hooks
│   │   ├── types.ts          # Auth types
│   │   └── utils.ts          # Auth utilities
│   ├── users/                 # Users feature
│   ├── packages/              # Packages feature
│   ├── routers/               # Routers feature
│   ├── billing/               # Billing feature
│   ├── sms/                   # SMS feature
│   ├── reports/               # Reports feature
│   └── settings/              # Settings feature
├── lib/                        # Utility libraries
│   ├── api.ts                 # API client configuration
│   ├── utils.ts               # Utility functions
│   ├── constants.ts           # Constants
│   └── store/                 # Zustand stores
│       ├── auth.ts            # Auth store
│       ├── api.ts             # API store
│       ├── rbac.ts            # RBAC store
│       └── provisioning.ts    # Provisioning store
├── hooks/                      # Custom React hooks
│   ├── use-auth.ts
│   ├── use-debounce.ts
│   └── use-toast.ts
├── types/                      # TypeScript types
│   ├── index.ts
│   ├── api.ts
│   └── models.ts
├── public/                     # Static assets
│   ├── images/
│   │   ├── logo/
│   │   └── illustrations/
│   ├── icons/                 # PWA icons
│   └── manifest.json          # PWA manifest
├── docs/                       # Documentation
│   └── IMPLEMENTATION_PROGRESS.md
├── .env.example               # Environment variables template
├── .env.local                 # Local environment variables
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── components.json            # shadcn/ui configuration
└── package.json               # Dependencies
```

## Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Backend server running at http://localhost:8000

### Development Setup

1. **Navigate to frontend directory:**
   ```bash
   cd wifi-billing-software-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```ini
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   NEXT_PUBLIC_WS_URL=ws://localhost:8000
   NEXT_PUBLIC_APP_NAME="Codevertex ISP Billing"
   ```

4. **Run development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open browser:**
   Navigate to http://localhost:3000

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start

# Or export static site
npm run build && npm run export
```

## 📚 Documentation

### Frontend Documentation
- **[Frontend Setup Guide](./docs/SETUP_GUIDE.md)** - Complete frontend setup and configuration (1,400+ lines)
- **[Implementation Progress](./docs/IMPLEMENTATION_PROGRESS.md)** - Feature completion status

### Backend Documentation
- **[Backend Setup Guide](../wifi-billing-software-backend/docs/SETUP_GUIDE.md)** - Backend installation and configuration
- **[API Documentation](../wifi-billing-software-backend/docs/API_DOCUMENTATION.md)** - Complete API reference
- **[RBAC System](../wifi-billing-software-backend/docs/RBAC_SYSTEM.md)** - Role-based access control
- **[MikroTik Provisioning](../wifi-billing-software-backend/docs/MIKROTIK_PROVISIONING_GUIDE.md)** - Technical provisioning guide (1,400+ lines)
- **[Auth Mapping](../wifi-billing-software-backend/docs/AUTH_MAPPING.md)** - Authentication field mapping

## 🎨 Design System

### Colors
The application uses a custom color scheme based on the Codevertex brand:
- **Primary**: Blue shades for primary actions
- **Secondary**: Creamy white for backgrounds
- **Accent**: Green for success states
- **Neutral**: Gray shades for text and borders

### Typography
- **Headings**: Inter font family
- **Body**: System font stack for optimal readability

### Components
All UI components are built using shadcn/ui, which provides:
- Fully accessible components (WAI-ARIA compliant)
- Customizable with Tailwind CSS
- Dark mode support
- TypeScript support

## 🔐 Authentication

The frontend implements a complete authentication system:

### Login Flow
1. User enters credentials
2. JWT token received from backend
3. Token stored in localStorage
4. User redirected to dashboard

### Protected Routes
Routes are protected using middleware and RBAC guards:
```typescript
<ProtectedRoute requiredRole="admin">
  <AdminPage />
</ProtectedRoute>
```

### Role-Based UI
UI elements are conditionally rendered based on user permissions:
```typescript
<PermissionGate module="USERS" action="CREATE">
  <CreateUserButton />
</PermissionGate>
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Collapsible sidebar
- Touch-friendly buttons
- Optimized forms
- Swipeable tables

## 🚀 Performance Optimizations

### Code Splitting
- Route-based code splitting
- Dynamic imports for heavy components
- Lazy loading for images

### Caching
- React Query cache for API data
- Service Worker for offline support
- LocalStorage for user preferences

### Optimizations
- Image optimization with Next.js Image
- Font optimization
- CSS purging with Tailwind
- Bundle size analysis

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🎯 Key Pages

### Marketing Pages
- **Landing Page**: `/` - Features, pricing, testimonials
- **Pricing**: `/pricing` - Package pricing and plans
- **About**: `/about` - Company information
- **Contact**: `/contact` - Contact form

### Authentication Pages
- **Login**: `/login` - User login
- **Signup**: `/signup` - Multi-step registration
- **Forgot Password**: `/forgot-password` - Password reset request
- **Reset Password**: `/reset-password` - Password reset confirmation

### Dashboard Pages
- **Overview**: `/dashboard` - Analytics and metrics
- **Users**: `/dashboard/users` - User management
- **Packages**: `/dashboard/packages` - Package management
- **Routers**: `/dashboard/routers` - Router management
- **Provisioning**: `/dashboard/routers/provision` - Device provisioning
- **Billing**: `/dashboard/billing` - Invoices and payments
- **SMS**: `/dashboard/sms` - SMS credit management
- **Reports**: `/dashboard/reports` - Analytics and reports
- **Settings**: `/dashboard/settings` - System configuration

## 🔧 Development Tools

### Code Quality
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **lint-staged**: Pre-commit linting

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

## 📊 State Management

### Zustand Stores
1. **Auth Store** (`lib/store/auth.ts`)
   - User authentication state
   - Token management
   - User profile

2. **API Store** (`lib/store/api.ts`)
   - API configuration
   - Request interceptors
   - Error handling

3. **RBAC Store** (`lib/store/rbac.ts`)
   - User roles and permissions
   - Permission checking utilities
   - Licence information

4. **Provisioning Store** (`lib/store/provisioning.ts`)
   - Router provisioning state
   - Step navigation
   - Configuration data

### React Query
Used for server state management:
- Automatic caching
- Background refetching
- Optimistic updates
- Request deduplication

## 🌐 API Integration

All API calls use a centralized Axios instance with:
- Base URL configuration
- Request/response interceptors
- Automatic token injection
- Error handling

Example:
```typescript
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
  });
}
```

## 🎨 Theming

The application supports light and dark themes:

```typescript
// Toggle theme
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();

<Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  Toggle Theme
</Button>
```

## 📦 Build & Deploy

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel deploy
```

### Deploy to Other Platforms
The application can be deployed to any platform that supports Next.js:
- Vercel
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted with Node.js

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📧 Support

For issues, questions, or contributions:
- **Email**: support@codevertexitsolutions.com
- **Documentation**: See `/docs` folder
- **GitHub Issues**: Create an issue in the repository

## 📝 License

MIT License - See LICENSE file for details

## 🏢 About Codevertex IT Solutions

Codevertex IT Solutions specializes in ISP management software, network automation, and billing systems.

---

**Version**: 1.0.0  
**Last Updated**: October 21, 2025  
**Status**: Production Ready ✅
