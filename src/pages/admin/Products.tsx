import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';

export function Products() {
  return (
    <AdminGuard>
      <AdminLayout title="Productos">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestión de Productos</h2>
          <p className="text-gray-600">Administra el catálogo de productos de la tienda.</p>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
