import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';

export function Inventory() {
  return (
    <AdminGuard>
      <AdminLayout title="Inventario">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestión de Inventario</h2>
          <p className="text-gray-600">Controla el stock y disponibilidad de productos.</p>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
