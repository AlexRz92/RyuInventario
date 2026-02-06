import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';

export function Orders() {
  return (
    <AdminGuard>
      <AdminLayout title="Órdenes">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestión de Órdenes</h2>
          <p className="text-gray-600">Administra todas las órdenes de la tienda.</p>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
