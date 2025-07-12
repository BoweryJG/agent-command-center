import { UserRole } from '../types/auth.types';

// Define permissions for each role
export const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.USER]: [
    'view:dashboard',
    'view:voice_studio',
    'view:personality_forge',
    'view:quick_clips',
    'edit:own_profile',
    'create:agent',
    'edit:own_agent',
    'delete:own_agent',
  ],
  [UserRole.ADMIN]: [
    'view:dashboard',
    'view:voice_studio',
    'view:personality_forge',
    'view:agent_academy',
    'view:quick_clips',
    'view:analytics',
    'edit:own_profile',
    'create:agent',
    'edit:any_agent',
    'delete:any_agent',
    'view:users',
    'edit:users',
  ],
  [UserRole.SUPER_ADMIN]: [
    'view:dashboard',
    'view:voice_studio',
    'view:personality_forge',
    'view:agent_academy',
    'view:quick_clips',
    'view:analytics',
    'view:admin_panel',
    'edit:own_profile',
    'create:agent',
    'edit:any_agent',
    'delete:any_agent',
    'view:users',
    'edit:users',
    'delete:users',
    'manage:roles',
    'manage:system',
  ],
};

// Check if a role has a specific permission
export const hasPermission = (role: UserRole | string, permission: string): boolean => {
  const roleKey = typeof role === 'string' ? (role as keyof typeof rolePermissions) : role;
  const permissions = rolePermissions[roleKey as UserRole] || [];
  return permissions.includes(permission);
};

// Check if a role has any of the specified permissions
export const hasAnyPermission = (role: UserRole | string, permissions: string[]): boolean => {
  return permissions.some((permission) => hasPermission(role, permission));
};

// Check if a role has all of the specified permissions
export const hasAllPermissions = (role: UserRole | string, permissions: string[]): boolean => {
  return permissions.every((permission) => hasPermission(role, permission));
};

// Get all permissions for a role
export const getRolePermissions = (role: UserRole | string): string[] => {
  const roleKey = typeof role === 'string' ? (role as keyof typeof rolePermissions) : role;
  return rolePermissions[roleKey as UserRole] || [];
};

// Route access configuration
export const routeAccess: Record<string, UserRole[]> = {
  '/dashboard': [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  '/voice-studio': [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  '/personality-forge': [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  '/agent-academy': [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  '/quick-clips': [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  '/profile': [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  '/admin': [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  '/admin/users': [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  '/admin/system': [UserRole.SUPER_ADMIN],
};

// Check if a role can access a specific route
export const canAccessRoute = (role: UserRole | string, route: string): boolean => {
  const allowedRoles = routeAccess[route];
  if (!allowedRoles) return false;
  
  if (typeof role === 'string') {
    return allowedRoles.map(r => r.toString()).includes(role);
  }
  return allowedRoles.includes(role);
};

// Feature flags based on roles
export const featureFlags: Record<string, UserRole[]> = {
  showAnalytics: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  showUserManagement: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  showSystemSettings: [UserRole.SUPER_ADMIN],
  canExportData: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
  canBulkOperations: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
};

// Check if a role has access to a feature
export const hasFeature = (role: UserRole | string, feature: string): boolean => {
  const allowedRoles = featureFlags[feature];
  if (!allowedRoles) return false;
  
  if (typeof role === 'string') {
    return allowedRoles.map(r => r.toString()).includes(role);
  }
  return allowedRoles.includes(role);
};