import { supabase } from '../config/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { 
  LoginCredentials, 
  SignupCredentials, 
  User 
} from '../types/auth.types';

class SupabaseAuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User | null; session: Session | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      const user = this.mapSupabaseUser(data.user);
      return { user, session: data.session };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  }

  async signup(credentials: SignupCredentials): Promise<{ user: User | null; session: Session | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            username: credentials.username,
            full_name: `${credentials.firstName} ${credentials.lastName}`,
          },
        },
      });

      if (error) throw error;

      const user = this.mapSupabaseUser(data.user);
      return { user, session: data.session };
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return this.mapSupabaseUser(user);
    } catch (error) {
      return null;
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      return null;
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          username: updates.username,
          full_name: updates.firstName && updates.lastName 
            ? `${updates.firstName} ${updates.lastName}` 
            : undefined,
        },
      });

      if (error) throw error;

      return this.mapSupabaseUser(data.user);
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Password update failed');
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = this.mapSupabaseUser(session?.user || null);
      callback(user);
    });

    return () => subscription.unsubscribe();
  }

  private mapSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
    if (!supabaseUser) return null;

    const metadata = supabaseUser.user_metadata || {};
    const fullName = metadata.full_name || metadata.name || '';
    const [firstName = '', lastName = ''] = fullName.split(' ');

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      username: metadata.username || supabaseUser.email?.split('@')[0] || '',
      firstName: metadata.first_name || firstName,
      lastName: metadata.last_name || lastName,
      role: metadata.role || 'user',
      permissions: metadata.permissions || ['read'],
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
    };
  }
}

export default new SupabaseAuthService();