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
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Cargando datos...</p>
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
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Ingresos Totales</p>
                  <p className="text-3xl font-bold mt-2">${stats?.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <DollarSign size={28} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Órdenes</p>
                  <p className="text-3xl font-bold mt-2">{stats?.totalOrders}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <ShoppingCart size={28} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Productos Activos</p>
                  <p className="text-3xl font-bold mt-2">{products.length}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <Package size={28} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm font-medium">Destacados</p>
                  <p className="text-3xl font-bold mt-2">{products.filter(p => p.is_featured).length}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <Star size={28} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 rounded-lg p-2">
                  <TrendingUp size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Ventas Últimos 7 Días</h3>
                  <p className="text-sm text-gray-500">Órdenes completadas y confirmadas</p>
                </div>
              </div>
              <div className="space-y-3">
                {stats?.last7DaysSales.map((day, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-24 font-medium">
                      {new Date(day.date).toLocaleDateString('es', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                        style={{ width: `${maxSales > 0 ? (day.amount / maxSales) * 100 : 0}%` }}
                      >
                        {day.amount > 0 && (
                          <span className="text-xs font-bold text-white">
                            ${day.amount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Órdenes por Estado</h3>
              <div className="space-y-3">
                {stats?.ordersByStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                    <span className="text-2xl font-bold text-gray-700">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Gestión de Productos Destacados</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Producto</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Precio</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Destacado</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url || 'https://via.placeholder.com/50'}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <span className="font-medium text-gray-800">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700 font-semibold">
                        ${Number(product.price).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleFeatured(product.id, product.is_featured)}
                          disabled={updatingProduct === product.id}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            product.is_featured
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <Star
                            size={16}
                            className={product.is_featured ? 'fill-yellow-500' : ''}
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
