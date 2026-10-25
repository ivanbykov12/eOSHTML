// Role-Based Access Control for eOS Desktop

export type RBACLevel = 'USER' | 'MODERATOR' | 'SYSTEM_ADMIN';

export interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'execute';
}

const ROLE_PERMISSIONS: Record<RBACLevel, Permission[]> = {
  USER: [
    { resource: '/users/*/Desktop', action: 'read' },
    { resource: '/users/*/Desktop', action: 'write' },
    { resource: '/users/*/Downloads', action: 'read' },
    { resource: '/users/*/Downloads', action: 'write' },
    { resource: '/users/*/Documents', action: 'read' },
    { resource: '/users/*/Documents', action: 'write' },
    { resource: '/public/apps', action: 'read' },
    { resource: '/public/apps', action: 'execute' },
  ],
  MODERATOR: [
    { resource: '/users/*', action: 'read' },
    { resource: '/users/*', action: 'write' },
    { resource: '/public/apps', action: 'read' },
    { resource: '/public/apps', action: 'write' },
    { resource: '/public/apps', action: 'execute' },
    { resource: '/public/apps/system', action: 'read' },
  ],
  SYSTEM_ADMIN: [
    { resource: '/*', action: 'read' },
    { resource: '/*', action: 'write' },
    { resource: '/*', action: 'delete' },
    { resource: '/*', action: 'execute' },
  ],
};

export class RBAC {
  private level: RBACLevel;
  private static STORAGE_KEY = 'eos_rbac_level';

  constructor() {
    const stored = localStorage.getItem(RBAC.STORAGE_KEY);
    this.level = (stored as RBACLevel) || 'SYSTEM_ADMIN';
  }

  getLevel(): RBACLevel {
    return this.level;
  }

  setLevel(level: RBACLevel): void {
    this.level = level;
    localStorage.setItem(RBAC.STORAGE_KEY, level);
  }

  checkPermission(resource: string, action: Permission['action']): boolean {
    const permissions = ROLE_PERMISSIONS[this.level];
    return permissions.some(p => {
      if (p.action !== action) return false;
      return this.matchResource(p.resource, resource);
    });
  }

  private matchResource(pattern: string, resource: string): boolean {
    if (pattern === '/*') return true;
    
    const patternParts = pattern.split('/').filter(p => p.length > 0);
    const resourceParts = resource.split('/').filter(p => p.length > 0);
    
    if (patternParts.length > resourceParts.length) return false;
    
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] === '*') continue;
      if (patternParts[i] !== resourceParts[i]) return false;
    }
    
    return true;
  }

  canInstallApps(): boolean {
    return this.level === 'SYSTEM_ADMIN' || this.level === 'MODERATOR';
  }

  canDeleteSystemApps(): boolean {
    return this.level === 'SYSTEM_ADMIN';
  }

  canModifySettings(): boolean {
    return true; // All levels can modify personal settings
  }
}

export const rbac = new RBAC();
