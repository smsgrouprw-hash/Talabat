// Route constants for better management and type safety
export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/auth',
  REGISTER: '/register',
  CUSTOMER_REGISTER: '/customer-register',
  SUPPLIER_REGISTER: '/supplier-register',
  AUTH_CALLBACK: '/auth/callback',
  ADMIN_LOGIN: '/admin-login',
  EMAIL_VERIFICATION: '/email-verification',
  REGISTRATION_PENDING: '/registration-pending',
  
  // Protected routes
  DASHBOARD: '/dashboard',
  
  // Customer routes
  CUSTOMER: {
    DASHBOARD: '/customer-dashboard',
    ORDERS: '/customer/orders',
    PROFILE: '/customer/profile',
    FAVORITES: '/customer/favorites'
  },
  
  // Supplier routes
  SUPPLIER: {
    DASHBOARD: '/supplier-dashboard',
    PROFILE: '/supplier/profile',
    MENU: '/supplier/menu',
    ORDERS: '/supplier/orders',
    ANALYTICS: '/supplier/analytics'
  },
  
  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin-dashboard',
    USERS: '/admin/users',
    SUPPLIERS: '/admin-supplier-management',
    ORDERS: '/admin/orders',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings'
  },
  
  // Error routes
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404'
} as const;

export type RouteType = typeof ROUTES[keyof typeof ROUTES];