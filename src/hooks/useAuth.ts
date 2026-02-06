import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthError {
  message: string;
}

interface LoginResponse {
  success: boolean;
  error: AuthError | null;
  isAdmin: boolean;
}

const ADMIN_CACHE_KEY = 'admin_status_cache';

export function useAuth() {
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return {
          success: false,
          error: {
            message: error.message === 'Invalid login credentials'
              ? 'Email o contraseña incorrectos'
              : error.message,
          },
          isAdmin: false,
        };
      }

      if (!data.user) {
        setLoading(false);
        return {
          success: false,
          error: { message: 'Error inesperado al autenticar' },
          isAdmin: false,
        };
      }

      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('is_active')
        .eq('user_id', data.user.id)
        .eq('is_active', true)
        .maybeSingle();

      const isAdmin = !!adminData;

      if (!isAdmin) {
        await supabase.auth.signOut();
        setLoading(false);
        return {
          success: false,
          error: { message: 'No tienes permisos de administrador' },
          isAdmin: false,
        };
      }

      sessionStorage.setItem(
        ADMIN_CACHE_KEY,
        JSON.stringify({ userId: data.user.id, isAdmin: true, timestamp: Date.now() })
      );

      setLoading(false);
      return {
        success: true,
        error: null,
        isAdmin: true,
      };
    } catch (err) {
      setLoading(false);
      return {
        success: false,
        error: { message: 'Error de conexión. Por favor intenta de nuevo.' },
        isAdmin: false,
      };
    }
  };

  return { login, loading };
}
