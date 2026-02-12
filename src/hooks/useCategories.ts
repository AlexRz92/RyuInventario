import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
  image_url: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const checkDuplicate = async (name: string, excludeId?: string): Promise<boolean> => {
    try {
      let query = supabase
        .from('categories')
        .select('id')
        .ilike('name', name);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data && data.length > 0) || false;
    } catch (err) {
      console.error('Error checking duplicate:', err);
      return false;
    }
  };

  const createCategory = async (formData: CategoryFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!formData.name.trim()) {
        return {
          success: false,
          error: 'El nombre es requerido'
        };
      }

      const isDuplicate = await checkDuplicate(formData.name.trim());

      if (isDuplicate) {
        return {
          success: false,
          error: 'Ya existe una categoría con ese nombre'
        };
      }

      const { error } = await supabase.from('categories').insert([
        {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          image_url: formData.image_url.trim() || null,
        },
      ]);

      if (error) throw error;

      await loadCategories();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al crear categoría',
      };
    }
  };

  const updateCategory = async (
    id: string,
    formData: CategoryFormData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!formData.name.trim()) {
        return {
          success: false,
          error: 'El nombre es requerido'
        };
      }

      const isDuplicate = await checkDuplicate(formData.name.trim(), id);

      if (isDuplicate) {
        return {
          success: false,
          error: 'Ya existe una categoría con ese nombre'
        };
      }

      const { error } = await supabase
        .from('categories')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          image_url: formData.image_url.trim() || null,
        })
        .eq('id', id);

      if (error) throw error;

      await loadCategories();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al actualizar categoría',
      };
    }
  };

  const deleteCategory = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);

      if (error) {
        if (error.code === '23503') {
          return {
            success: false,
            error: 'No se puede eliminar porque tiene productos asociados'
          };
        }
        throw error;
      }

      await loadCategories();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar categoría';

      if (errorMessage.includes('foreign key') || errorMessage.includes('violates')) {
        return {
          success: false,
          error: 'No se puede eliminar porque tiene productos asociados'
        };
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    categories,
    loading,
    error,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
