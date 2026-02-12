import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ShippingRule {
  id: string;
  country: string;
  state: string;
  city: string | null;
  is_free: boolean;
  base_cost: number;
  cost_per_km: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

export interface ShippingFormData {
  country: string;
  state: string;
  city: string;
  is_free: boolean;
  base_cost: string;
  notes: string;
  is_active: boolean;
}

export function useShipping() {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 25;

  const loadRules = async (
    page: number = 1,
    searchTerm?: string,
    filterType: 'states' | 'cities' = 'states'
  ) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('shipping_rules')
        .select('*', { count: 'exact' })
        .eq('country', 'Venezuela');

      if (filterType === 'states') {
        query = query.eq('city', '');
      } else {
        query = query.neq('city', '');
      }

      if (searchTerm && searchTerm.trim()) {
        query = query.or(
          `state.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`
        );
      }

      query = query.order('state');
      if (filterType === 'cities') {
        query = query.order('city');
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setRules(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar reglas');
    } finally {
      setLoading(false);
    }
  };

  const checkDuplicate = async (
    country: string,
    state: string,
    city: string,
    excludeId?: string
  ): Promise<boolean> => {
    try {
      const normalizedCity = city.trim() || null;

      let query = supabase
        .from('shipping_rules')
        .select('id')
        .eq('country', country)
        .eq('state', state)
        .eq('is_active', true);

      if (normalizedCity === null) {
        query = query.is('city', null);
      } else {
        query = query.eq('city', normalizedCity);
      }

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

  const createRule = async (formData: ShippingFormData): Promise<{ success: boolean; error?: string }> => {
    try {
      const normalizedCity = formData.city.trim() || null;
      const baseCost = formData.is_free ? 0 : parseFloat(formData.base_cost);

      const isDuplicate = await checkDuplicate(
        formData.country,
        formData.state,
        normalizedCity || ''
      );

      if (isDuplicate) {
        return {
          success: false,
          error: 'Ya existe una regla activa para este país, estado y ciudad'
        };
      }

      const { error } = await supabase.from('shipping_rules').insert([
        {
          country: formData.country,
          state: formData.state,
          city: normalizedCity,
          is_free: formData.is_free,
          base_cost: baseCost,
          cost_per_km: 0,
          notes: formData.notes.trim() || null,
          is_active: formData.is_active,
        },
      ]);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al crear regla',
      };
    }
  };

  const updateStateRule = async (
    id: string,
    isFree: boolean,
    baseCost: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cost = isFree ? 0 : baseCost;

      const { error } = await supabase
        .from('shipping_rules')
        .update({
          is_free: isFree,
          base_cost: cost,
        })
        .eq('id', id);

      if (error) throw error;

      setRules(rules.map(rule =>
        rule.id === id ? { ...rule, is_free: isFree, base_cost: cost } : rule
      ));

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al actualizar regla',
      };
    }
  };

  const updateRule = async (
    id: string,
    formData: ShippingFormData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const normalizedCity = formData.city.trim() || null;
      const baseCost = formData.is_free ? 0 : parseFloat(formData.base_cost);

      const isDuplicate = await checkDuplicate(
        formData.country,
        formData.state,
        normalizedCity || '',
        id
      );

      if (isDuplicate) {
        return {
          success: false,
          error: 'Ya existe una regla activa para este país, estado y ciudad'
        };
      }

      const { error } = await supabase
        .from('shipping_rules')
        .update({
          country: formData.country,
          state: formData.state,
          city: normalizedCity,
          is_free: formData.is_free,
          base_cost: baseCost,
          notes: formData.notes.trim() || null,
          is_active: formData.is_active,
        })
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al actualizar regla',
      };
    }
  };

  const deleteRule = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.from('shipping_rules').delete().eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al eliminar regla',
      };
    }
  };

  const toggleActive = async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('shipping_rules')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      setRules(rules.map(rule => rule.id === id ? { ...rule, is_active: isActive } : rule));

      return true;
    } catch (err) {
      console.error('Error toggling active:', err);
      return false;
    }
  };

  return {
    rules,
    loading,
    error,
    currentPage,
    totalCount,
    pageSize,
    loadRules,
    createRule,
    updateStateRule,
    updateRule,
    deleteRule,
    toggleActive,
  };
}
