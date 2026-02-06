import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';

export function Dashboard() {
  return (
    <AdminGuard>
      <AdminLayout title="Dashboard">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Bienvenido al Panel de Administración</h2>
          <p className="text-gray-600">Aquí podrás gestionar todos los aspectos de tu tienda.</p>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
