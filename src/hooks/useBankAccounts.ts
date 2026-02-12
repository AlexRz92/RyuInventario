import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface BankAccount {
  id: string;
  label: string;
  bank_name: string;
  account_holder: string;
  account_number: string;
  document_id: string;
  account_type: string | null;
  notes: string | null;
  is_active: boolean;
  is_primary: boolean;
  sort_order: number | null;
  created_at: string;
}

export interface BankAccountFormData {
  label: string;
  bank_name: string;
  account_holder: string;
  account_number: string;
  document_id: string;
  account_type: string;
  notes: string;
  is_active: boolean;
  is_primary: boolean;
}

export function useBankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cuentas bancarias');
    } finally {
      setLoading(false);
    }
  };

  const countActiveAccounts = async (): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('id')
        .eq('is_active', true);

      if (error) throw error;
      return (data?.length || 0);
    } catch (err) {
      console.error('Error counting active accounts:', err);
      return 0;
    }
  };

  const createAccount = async (formData: BankAccountFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!formData.bank_name.trim()) {
        return { success: false, error: 'El banco es requerido' };
      }

      if (!formData.account_holder.trim()) {
        return { success: false, error: 'El titular es requerido' };
      }

      if (!formData.account_number.trim()) {
        return { success: false, error: 'El número de cuenta es requerido' };
      }

      if (formData.account_number.trim().length < 10) {
        return { success: false, error: 'El número de cuenta debe tener al menos 10 caracteres' };
      }

      if (formData.is_primary) {
        await supabase
          .from('bank_accounts')
          .update({ is_primary: false })
          .eq('is_primary', true);
      }

      const { error } = await supabase.from('bank_accounts').insert([
        {
          label: formData.label.trim() || formData.bank_name.trim(),
          bank_name: formData.bank_name.trim(),
          account_holder: formData.account_holder.trim(),
          account_number: formData.account_number.trim(),
          document_id: formData.document_id.trim() || null,
          account_type: formData.account_type.trim() || null,
          notes: formData.notes.trim() || null,
          is_active: formData.is_active,
          is_primary: formData.is_primary,
        },
      ]);

      if (error) throw error;

      await loadAccounts();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al crear cuenta',
      };
    }
  };

  const updateAccount = async (
    id: string,
    formData: BankAccountFormData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!formData.bank_name.trim()) {
        return { success: false, error: 'El banco es requerido' };
      }

      if (!formData.account_holder.trim()) {
        return { success: false, error: 'El titular es requerido' };
      }

      if (!formData.account_number.trim()) {
        return { success: false, error: 'El número de cuenta es requerido' };
      }

      if (formData.account_number.trim().length < 10) {
        return { success: false, error: 'El número de cuenta debe tener al menos 10 caracteres' };
      }

      if (formData.is_primary) {
        await supabase
          .from('bank_accounts')
          .update({ is_primary: false })
          .neq('id', id);
      }

      const { error } = await supabase
        .from('bank_accounts')
        .update({
          label: formData.label.trim() || formData.bank_name.trim(),
          bank_name: formData.bank_name.trim(),
          account_holder: formData.account_holder.trim(),
          account_number: formData.account_number.trim(),
          document_id: formData.document_id.trim() || null,
          account_type: formData.account_type.trim() || null,
          notes: formData.notes.trim() || null,
          is_active: formData.is_active,
          is_primary: formData.is_primary,
        })
        .eq('id', id);

      if (error) throw error;

      await loadAccounts();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al actualizar cuenta',
      };
    }
  };

  const toggleActive = async (id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!isActive) {
        const activeCount = await countActiveAccounts();
        if (activeCount === 1) {
          return {
            success: false,
            error: 'No se puede desactivar la única cuenta activa. Activa otra cuenta primero.',
          };
        }
      }

      const { error } = await supabase
        .from('bank_accounts')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      await loadAccounts();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al cambiar estado',
      };
    }
  };

  const deleteAccount = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.from('bank_accounts').delete().eq('id', id);

      if (error) throw error;

      await loadAccounts();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al eliminar cuenta',
      };
    }
  };

  return {
    accounts,
    loading,
    error,
    loadAccounts,
    createAccount,
    updateAccount,
    toggleActive,
    deleteAccount,
  };
}
