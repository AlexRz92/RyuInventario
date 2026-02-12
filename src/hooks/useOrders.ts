import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Order {
  id: string;
  tracking_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  payment_method: string;
  payment_proof_url: string | null;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  product_sku: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async (statusFilter?: string, limit?: number) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      return false;
    }
  };

  const loadOrderItems = async (orderId: string): Promise<OrderItem[]> => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error loading order items:', err);
      return [];
    }
  };

  const normalizeFilePath = (rawPath: string): string | null => {
    if (!rawPath) return null;

    console.log('[DEBUG] payment_proof_url original:', rawPath);

    if (!rawPath.startsWith('http')) {
      console.log('[DEBUG] filePath normalizado (ya es path):', rawPath);
      return rawPath;
    }

    const match = rawPath.match(/\/transfer-proofs\/(.+)$/);
    if (match && match[1]) {
      const normalized = match[1];
      console.log('[DEBUG] filePath normalizado (extraído de URL):', normalized);
      return normalized;
    }

    console.error('[DEBUG] No se pudo extraer filePath de URL:', rawPath);
    return null;
  };

  const getPaymentProofSignedUrl = async (rawPath: string): Promise<string | null> => {
    try {
      if (!rawPath) return null;

      const filePath = normalizeFilePath(rawPath);
      if (!filePath) {
        console.error('[DEBUG] filePath inválido después de normalización');
        return null;
      }

      const { data, error } = await supabase.storage
        .from('transfer-proofs')
        .createSignedUrl(filePath, 120);

      if (error) {
        console.error('[DEBUG] Error en createSignedUrl:', error.message);
        throw error;
      }

      console.log('[DEBUG] URL firmada generada correctamente');
      return data?.signedUrl || null;
    } catch (err) {
      console.error('[DEBUG] Error generating signed URL:', err);
      return null;
    }
  };

  useEffect(() => {
    loadOrders('all', 10);
  }, []);

  return {
    orders,
    loading,
    error,
    loadOrders,
    updateOrderStatus,
    loadOrderItems,
    getPaymentProofSignedUrl
  };
}
