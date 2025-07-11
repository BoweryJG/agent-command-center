import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  canAccessRoute, 
  hasFeature 
} from '../utils/rbac';

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) {
      return {
        can: () => false,
        canAny: () => false,
        canAll: () => false,
        canAccessRoute: () => false,
        hasFeature: () => false,
      };
    }

    return {
      can: (permission: string) => hasPermission(user.role, permission),
      canAny: (permissions: string[]) => hasAnyPermission(user.role, permissions),
      canAll: (permissions: string[]) => hasAllPermissions(user.role, permissions),
      canAccessRoute: (route: string) => canAccessRoute(user.role, route),
      hasFeature: (feature: string) => hasFeature(user.role, feature),
    };
  }, [user]);

  return permissions;
};