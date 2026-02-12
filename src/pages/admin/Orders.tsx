import { useState, useEffect } from 'react';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { OrderDetailModal } from '../../components/admin/OrderDetailModal';
import { Toast } from '../../components/admin/Toast';
import { useOrders, Order, OrderItem } from '../../hooks/useOrders';
import { Search, Eye, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type TabType = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface Tab {
  id: TabType;
  label: string;
  count: number;
}

export function Orders() {
  const { orders, loading, updateOrderStatus, loadOrderItems, loadOrders, searchOrders } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [orderCounts, setOrderCounts] = useState({
    all: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    loadOrderCounts();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      loadOrdersForTab(activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      loadOrdersForTab(activeTab);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(() => {
      searchOrders(searchTerm, activeTab === 'all' ? undefined : activeTab);
    }, 350);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, activeTab]);

  const loadOrderCounts = async () => {
    const { data } = await supabase.from('orders').select('status');
    if (data) {
      const counts = {
        all: data.length,
        pending: data.filter(o => o.status === 'pending').length,
        confirmed: data.filter(o => o.status === 'confirmed').length,
        completed: data.filter(o => o.status === 'completed').length,
        cancelled: data.filter(o => o.status === 'cancelled').length,
      };
      setOrderCounts(counts);
    }
  };

  const loadOrdersForTab = (tab: TabType) => {
    loadOrders(tab === 'all' ? undefined : tab, 10);
  };

  const tabs: Tab[] = [
    { id: 'all', label: 'Todos', count: orderCounts.all },
    { id: 'pending', label: 'Pendientes', count: orderCounts.pending },
    { id: 'confirmed', label: 'Confirmadas', count: orderCounts.confirmed },
    { id: 'completed', label: 'Completadas', count: orderCounts.completed },
    { id: 'cancelled', label: 'Rechazadas', count: orderCounts.cancelled },
  ];


  const handleViewDetails = async (order: Order) => {
    setLoadingDetail(true);
    setSelectedOrder(order);
    const items = await loadOrderItems(order.id);
    setOrderItems(items);
    setLoadingDetail(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    const success = await updateOrderStatus(orderId, newStatus);

    if (success) {
      setToast({ message: 'Estado actualizado correctamente', type: 'success' });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      await loadOrderCounts();
      loadOrdersForTab(activeTab);
    } else {
      setToast({ message: 'Error al actualizar el estado', type: 'error' });
    }

    setUpdatingOrder(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-900/50 text-green-300 border border-green-700';
      case 'confirmed': return 'bg-blue-900/50 text-blue-300 border border-blue-700';
      case 'pending': return 'bg-yellow-900/50 text-yellow-300 border border-yellow-700';
      case 'cancelled': return 'bg-red-900/50 text-red-300 border border-red-700';
      default: return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: 'Completado',
      confirmed: 'Confirmado',
      pending: 'Pendiente',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      transfer: 'Transferencia',
      cash: 'Efectivo',
      card: 'Tarjeta'
    };
    return labels[method] || method;
  };

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'pending':
        return <Clock size={16} className="text-yellow-400" />;
      case 'confirmed':
        return <CheckCircle size={16} className="text-blue-400" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-400" />;
      default:
        return null;
    }
  };

  const renderTableActions = (order: Order) => {
    const isUpdating = updatingOrder === order.id;

    return (
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button
          onClick={() => handleViewDetails(order)}
          disabled={isUpdating}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          title="Ver detalles"
        >
          <Eye size={14} />
        </button>

        {(order.status === 'pending' || order.status === 'confirmed') && (
          <>
            {order.status === 'pending' && (
              <button
                onClick={() => handleStatusChange(order.id, 'confirmed')}
                disabled={isUpdating}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-gold hover:bg-yellow-500 text-slate-900 rounded-lg transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                title="Confirmar orden"
              >
                {isUpdating ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              </button>
            )}

            {order.status === 'confirmed' && (
              <button
                onClick={() => handleStatusChange(order.id, 'completed')}
                disabled={isUpdating}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                title="Completar orden"
              >
                {isUpdating ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              </button>
            )}

            <button
              onClick={() => handleStatusChange(order.id, 'cancelled')}
              disabled={isUpdating}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Cancelar orden"
            >
              {isUpdating ? <RefreshCw size={14} className="animate-spin" /> : <XCircle size={14} />}
            </button>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout title="Órdenes">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
              <p className="mt-4 text-slate-300">Cargando órdenes...</p>
            </div>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminLayout title="Órdenes">
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
            <div className="border-b border-slate-700">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-gold text-gold bg-gold/5'
                        : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    {getTabIcon(tab.id)}
                    <span>{tab.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? 'bg-gold/20 text-gold'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por código, email o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>
              </div>

              {orders.length > 0 && (
                <div className="mb-4 flex items-center gap-2 text-sm">
                  {isSearching ? (
                    <div className="px-3 py-1.5 bg-slate-800 border border-gold/30 rounded-lg">
                      <span className="text-gold font-semibold">
                        Resultados de búsqueda: {orders.length}
                      </span>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg">
                      <span className="text-slate-400">
                        Mostrando las <span className="text-gold font-semibold">10</span> más recientes
                      </span>
                    </div>
                  )} 
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Código</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Cliente</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Total</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Pago</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Estado</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Fecha</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400">
                          {isSearching
                            ? 'No se encontraron órdenes con ese criterio de búsqueda'
                            : 'No hay órdenes en esta categoría'}
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 px-4">
                            <span className="font-mono text-gold font-semibold">{order.tracking_code}</span>
                          </td>
                          <td className="py-4 px-4 text-white">{order.customer_name}</td>
                          <td className="py-4 px-4 text-slate-300">{order.customer_email}</td>
                          <td className="py-4 px-4 text-gold font-bold">${Number(order.total_amount).toFixed(2)}</td>
                          <td className="py-4 px-4 text-slate-300">{getPaymentMethodLabel(order.payment_method)}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-300 text-sm">
                            {new Date(order.created_at).toLocaleDateString('es', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="py-4 px-4">
                            {renderTableActions(order)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {selectedOrder && !loadingDetail && (
          <OrderDetailModal
            order={selectedOrder}
            items={orderItems}
            onClose={() => setSelectedOrder(null)}
          />
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
