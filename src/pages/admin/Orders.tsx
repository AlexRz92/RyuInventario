import { useState } from 'react';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { OrderDetailModal } from '../../components/admin/OrderDetailModal';
import { Toast } from '../../components/admin/Toast';
import { useOrders, Order, OrderItem } from '../../hooks/useOrders';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

export function Orders() {
  const { orders, loading, updateOrderStatus, loadOrderItems } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6">
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
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent appearance-none cursor-pointer min-w-[200px]"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-4 text-sm">
              <span className="text-slate-400">
                Total: <span className="text-white font-semibold">{filteredOrders.length}</span> órdenes
              </span>
              <span className="text-slate-700">|</span>
              <div className="flex gap-3">
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-yellow-400" />
                  <span className="text-slate-400">Pendientes: </span>
                  <span className="text-yellow-400 font-semibold">
                    {orders.filter(o => o.status === 'pending').length}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle size={14} className="text-blue-400" />
                  <span className="text-slate-400">Confirmadas: </span>
                  <span className="text-blue-400 font-semibold">
                    {orders.filter(o => o.status === 'confirmed').length}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle size={14} className="text-green-400" />
                  <span className="text-slate-400">Completadas: </span>
                  <span className="text-green-400 font-semibold">
                    {orders.filter(o => o.status === 'completed').length}
                  </span>
                </span>
              </div>
            </div>

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
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        No se encontraron órdenes
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
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
