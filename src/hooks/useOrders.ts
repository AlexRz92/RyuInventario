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

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

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

  const getPaymentProofSignedUrl = async (filePath: string): Promise<string | null> => {
    try {
      if (!filePath) return null;

      const { data, error } = await supabase.storage
        .from('transfer-proofs')
        .createSignedUrl(filePath, 3600);

      if (error) throw error;
      return data?.signedUrl || null;
    } catch (err) {
      console.error('Error generating signed URL:', err);
      return null;
    }
  };

  useEffect(() => {
    loadOrders();
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
