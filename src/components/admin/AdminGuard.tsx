import { ReactNode, useEffect, useRef } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { supabase } from '../../lib/supabase';

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, loading, error } = useAdmin();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (hasRedirected.current) return;

    if (!loading) {
      if (error || !isAdmin) {
        hasRedirected.current = true;

        (async () => {
          await supabase.auth.signOut();
          sessionStorage.clear();
          window.location.href = '/';
        })();
      }
    }
  }, [isAdmin, loading, error]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
