import { useEffect, useState } from 'react';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { DollarSign, ShoppingCart, Package, TrendingUp, Star } from 'lucide-react';

interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  ordersByStatus: { status: string; count: number }[];
  last7DaysSales: { date: string; amount: number }[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  is_featured: boolean;
  category_id: string;
}

export function Dashboard() {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingProduct, setUpdatingProduct] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [salesData, productsData] = await Promise.all([
        loadSalesStats(),
        loadProducts()
      ]);
      setStats(salesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSalesStats = async (): Promise<SalesStats> => {
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, status, created_at');

    const completedOrders = orders?.filter(o =>
      o.status === 'completed' || o.status === 'confirmed'
    ) || [];

    const totalRevenue = completedOrders.reduce((sum, order) =>
      sum + Number(order.total_amount), 0
    );

    const ordersByStatus = orders?.reduce((acc, order) => {
      const existing = acc.find(s => s.status === order.status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ status: order.status, count: 1 });
      }
      return acc;
    }, [] as { status: string; count: number }[]) || [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = completedOrders.filter(o =>
      new Date(o.created_at) >= sevenDaysAgo
    );

    const last7DaysSales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayOrders = recentOrders.filter(o =>
        o.created_at.split('T')[0] === dateStr
      );

      const amount = dayOrders.reduce((sum, order) =>
        sum + Number(order.total_amount), 0
      );

      last7DaysSales.push({ date: dateStr, amount });
    }

    return {
      totalRevenue,
      totalOrders: orders?.length || 0,
      ordersByStatus,
      last7DaysSales
    };
  };

  const loadProducts = async (): Promise<Product[]> => {
    const { data } = await supabase
      .from('products')
      .select('id, name, price, image_url, is_featured, category_id')
      .eq('is_active', true)
      .order('name');

    return data || [];
  };

  const toggleFeatured = async (productId: string, currentStatus: boolean) => {
    setUpdatingProduct(productId);
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !currentStatus })
        .eq('id', productId);

      if (!error) {
        setProducts(products.map(p =>
          p.id === productId ? { ...p, is_featured: !currentStatus } : p
        ));
      }
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setUpdatingProduct(null);
    }
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

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout title="Dashboard">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
              <p className="mt-4 text-slate-300">Cargando datos...</p>
            </div>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  const maxSales = Math.max(...(stats?.last7DaysSales.map(s => s.amount) || [0]));

  return (
    <AdminGuard>
      <AdminLayout title="Dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6 hover:shadow-gold/10 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Ingresos Totales</p>
                  <p className="text-3xl font-bold text-gold mt-2">${stats?.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-gold/10 border border-gold/30 rounded-lg p-3">
                  <DollarSign size={28} className="text-gold" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6 hover:shadow-emerald-500/10 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Total Órdenes</p>
                  <p className="text-3xl font-bold text-emerald-400 mt-2">{stats?.totalOrders}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                  <ShoppingCart size={28} className="text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6 hover:shadow-amber-500/10 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Productos Activos</p>
                  <p className="text-3xl font-bold text-amber-400 mt-2">{products.length}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <Package size={28} className="text-amber-400" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6 hover:shadow-gold/10 transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Destacados</p>
                  <p className="text-3xl font-bold text-gold mt-2">{products.filter(p => p.is_featured).length}</p>
                </div>
                <div className="bg-gold/10 border border-gold/30 rounded-lg p-3">
                  <Star size={28} className="text-gold" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gold/10 border border-gold/30 rounded-lg p-2">
                  <TrendingUp size={24} className="text-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Ventas Últimos 7 Días</h3>
                  <p className="text-sm text-slate-400">Órdenes completadas y confirmadas</p>
                </div>
              </div>
              <div className="space-y-3">
                {stats?.last7DaysSales.map((day, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-24 font-medium">
                      {new Date(day.date).toLocaleDateString('es', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <div className="flex-1 bg-slate-800 rounded-full h-8 relative overflow-hidden border border-slate-700">
                      <div
                        className="bg-gradient-to-r from-gold/80 to-gold h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                        style={{ width: `${maxSales > 0 ? (day.amount / maxSales) * 100 : 0}%` }}
                      >
                        {day.amount > 0 && (
                          <span className="text-xs font-bold text-slate-900">
                            ${day.amount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Órdenes por Estado</h3>
              <div className="space-y-3">
                {stats?.ordersByStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                    <span className="text-2xl font-bold text-white">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Gestión de Productos Destacados</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Producto</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Precio</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-300">Destacado</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url || 'https://via.placeholder.com/50'}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                          />
                          <span className="font-medium text-white">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gold font-semibold">
                        ${Number(product.price).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleFeatured(product.id, product.is_featured)}
                          disabled={updatingProduct === product.id}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            product.is_featured
                              ? 'bg-gold/20 text-gold border border-gold/50 hover:bg-gold/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <Star
                            size={16}
                            className={product.is_featured ? 'fill-gold' : ''}
                          />
                          {updatingProduct === product.id ? 'Actualizando...' : product.is_featured ? 'Destacado' : 'Normal'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
