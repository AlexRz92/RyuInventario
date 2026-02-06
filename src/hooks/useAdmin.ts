import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AdminStatus {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

let cachedAdminStatus: { userId: string; isAdmin: boolean } | null = null;

export function useAdmin(): AdminStatus {
  const [status, setStatus] = useState<AdminStatus>({
    isAdmin: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
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

        if (cachedAdminStatus?.userId === userId) {
          setStatus({ isAdmin: cachedAdminStatus.isAdmin, loading: false, error: null });
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
        cachedAdminStatus = { userId, isAdmin };

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
