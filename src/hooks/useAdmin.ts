import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface AdminStatus {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

const ADMIN_CACHE_KEY = 'admin_status_cache';

function getCachedAdminStatus(userId: string): boolean | null {
  try {
    const cached = sessionStorage.getItem(ADMIN_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.userId === userId && parsed.timestamp > Date.now() - 5 * 60 * 1000) {
        return parsed.isAdmin;
      }
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

function setCachedAdminStatus(userId: string, isAdmin: boolean): void {
  try {
    sessionStorage.setItem(
      ADMIN_CACHE_KEY,
      JSON.stringify({ userId, isAdmin, timestamp: Date.now() })
    );
  } catch {
    // Ignore cache errors
  }
}

export function useAdmin(): AdminStatus {
  const [status, setStatus] = useState<AdminStatus>({
    isAdmin: false,
    loading: true,
    error: null,
  });

  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    async function checkAdmin() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setStatus({ isAdmin: false, loading: false, error: sessionError.message });
          return;
        }

        if (!session) {
          setStatus({ isAdmin: false, loading: false, error: null });
          return;
        }

        const userId = session.user.id;

        const cachedStatus = getCachedAdminStatus(userId);
        if (cachedStatus !== null) {
          setStatus({ isAdmin: cachedStatus, loading: false, error: null });
          return;
        }

        const { data, error } = await supabase
          .from('admin_users')
          .select('is_active')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          setStatus({ isAdmin: false, loading: false, error: error.message });
          return;
        }

        const isAdmin = !!data;
        setCachedAdminStatus(userId, isAdmin);
        setStatus({ isAdmin, loading: false, error: null });
      } catch (err) {
        setStatus({
          isAdmin: false,
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    checkAdmin();
  }, []);

  return status;
}
