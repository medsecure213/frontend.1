import { User, UserRole, LoginCredentials, CreateUserData } from '../types/user';

class AuthService {
  private currentUser: User | null = null;
  private users: User[] = [];
  private roles: UserRole[] = [];

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default roles
    this.roles = [
      {
        id: 'security_admin',
        name: 'Security Administrator',
        description: 'Full system administration access',
        level: 1,
        permissions: this.getRolePermissions('security_admin')
      },
      {
        id: 'security_manager',
        name: 'Security Manager',
        description: 'Manage security operations and team',
        level: 2,
        permissions: this.getRolePermissions('security_manager')
      },
      {
        id: 'security_analyst',
        name: 'Security Analyst',
        description: 'Analyze threats and manage incidents',
        level: 3,
        permissions: this.getRolePermissions('security_analyst')
      },
      {
        id: 'security_viewer',
        name: 'Security Viewer',
        description: 'Read-only access to security data',
        level: 4,
        permissions: this.getRolePermissions('security_viewer')
      }
    ];

    // Initialize default admin user
    const adminRole = this.roles.find(r => r.id === 'security_admin')!;
    const defaultAdmin: User = {
      id: 'admin-001',
      username: 'admin',
      email: 'admin@company.com',
      firstName: 'System',
      lastName: 'Administrator',
      role: adminRole,
      department: 'Security Operations',
      isActive: true,
      createdAt: new Date(),
      createdBy: 'system',
      permissions: adminRole.permissions
    };

    this.users = [defaultAdmin];
    
    // Load users from localStorage if available
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        this.users = parsedUsers.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
        }));
      } catch (error) {
        console.warn('Failed to load users from localStorage:', error);
      }
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    // Find user by username
    const user = this.users.find(u => u.username === credentials.username && u.isActive);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }

    // For demo purposes, accept 'password' or 'admin' as valid passwords
    if (credentials.password !== 'password' && credentials.password !== 'admin') {
      throw new Error('Invalid username or password');
    }
    
    // Update last login
    user.lastLogin = new Date();
    this.saveUsers();

    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    return this.currentUser;
  }

  private saveUsers() {
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  private getRolePermissions(role: string) {
    const basePermissions = [
      { id: '1', name: 'view_dashboard', description: 'View dashboard', resource: 'dashboard', action: 'read' },
      { id: '2', name: 'view_incidents', description: 'View incidents', resource: 'incidents', action: 'read' }
    ];

    switch (role) {
      case 'security_admin':
        return [
          ...basePermissions,
          { id: '3', name: 'manage_users', description: 'Manage users', resource: 'users', action: 'write' },
          { id: '4', name: 'manage_system', description: 'System administration', resource: 'system', action: 'write' },
          { id: '5', name: 'manage_incidents', description: 'Manage incidents', resource: 'incidents', action: 'write' }
        ];
      case 'security_manager':
        return [
          ...basePermissions,
          { id: '5', name: 'manage_incidents', description: 'Manage incidents', resource: 'incidents', action: 'write' },
          { id: '6', name: 'view_reports', description: 'View reports', resource: 'reports', action: 'read' }
        ];
      case 'security_analyst':
        return [
          ...basePermissions,
          { id: '7', name: 'analyze_threats', description: 'Analyze threats', resource: 'threats', action: 'write' }
        ];
      default:
        return basePermissions;
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;

    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
    return null;
  }

  async createUser(userData: CreateUserData, createdBy: string): Promise<User> {
    // Check for existing username or email
    const existing = this.users.find(u => 
      u.username === userData.username || u.email === userData.email
    );
    
    if (existing) {
      throw new Error('Username or email already exists');
    }

    // Get role information
    const role = this.roles.find(r => r.id === userData.roleId);
    if (!role) {
      throw new Error('Invalid role selected');
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: role,
      department: userData.department,
      isActive: true,
      createdAt: new Date(),
      createdBy: createdBy,
      permissions: role.permissions
    };

    this.users.push(newUser);
    this.saveUsers();
    
    return newUser;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Update user
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.saveUsers();
    
    return this.users[userIndex];
  }

  async deleteUser(userId: string): Promise<void> {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Soft delete - set is_active to false
    this.users[userIndex].isActive = false;
    this.saveUsers();
  }

  async getAllUsers(): Promise<User[]> {
    return this.users.filter(u => u.isActive);
  }

  async getAllRoles(): Promise<UserRole[]> {
    return this.roles;
  }

  hasPermission(user: User, resource: string, action: string): boolean {
    return user.permissions?.some(p => p.resource === resource && p.action === action) ?? false;
  }

  canManageUsers(user: User): boolean {
    return this.hasPermission(user, 'users', 'write') || user.role.level <= 2;
  }
}

export const authService = new AuthService();
