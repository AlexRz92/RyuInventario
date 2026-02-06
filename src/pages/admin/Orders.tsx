import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';

export function Orders() {
  return (
    <AdminGuard>
      <AdminLayout title="Órdenes">
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Gestión de Órdenes</h2>
          <p className="text-slate-300">Administra todas las órdenes de la tienda.</p>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
