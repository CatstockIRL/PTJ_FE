# React + TypeScript + Vite

This is a modern frontend project built using ReactJS, TypeScript, and Vite. The project is designed with scalability and maintainability in mind, making use of modular architecture, reusable components, and best development practices.

## 📁 Project Structure

```
src/
├── app/                  # Application-level configuration (store, router, middlewares, ...)
├── assets/               # Static assets (images, icons, fonts, etc.)
├── components/           # Shared UI components (Button, Modal, Input, etc.)
├── constants/            # Application-wide constants
├── contexts/             # Context API (Auth, Theme, ...)
├── features/             # Feature-based modules, grouped by domain (auth, user, product, ...)
│   └── auth/
│       ├── components/   # Auth-specific reusable UI components
│       ├── pages/        # Auth-specific route pages (e.g., Login, Register)
│       ├── services.ts   # Auth-related API service functions
│       ├── hooks.ts      # Custom hooks for auth logic
│       ├── types.ts      # TypeScript interfaces and types for auth
│       └── slice.ts      # Redux slice for auth state management
├── hooks/                # Contains reusable custom React hooks used across the application
├── layouts/              # Layout components for consistent page structure (MainLayout, AuthLayout)
├── lib/                  # Holds custom libraries, configuration, or integrations with third-party services
├── pages/                # Top-level pages for routing (e.g., HomePage, NotFoundPage)
│   ├── HomePage.tsx
│   └── NotFoundPage.tsx
├── routes/               # Centralized route configuration
├── services/             # Contains API call functions or service logic that are shared across the application
├── types/                # Global TypeScript types and interfaces (e.g., AppUser, APIResponse)
├── utils/                # Reusable utility functions
└── main.tsx              # Vite entry point
```