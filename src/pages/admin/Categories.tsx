import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';

export function Categories() {
  return (
    <AdminGuard>
      <AdminLayout title="Categorías">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestión de Categorías</h2>
          <p className="text-gray-600">Administra las categorías de productos.</p>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
