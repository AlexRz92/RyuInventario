import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';

export function Shipping() {
  return (
    <AdminGuard>
      <AdminLayout title="Envíos">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestión de Envíos</h2>
          <p className="text-gray-600">Administra las reglas y métodos de envío.</p>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
