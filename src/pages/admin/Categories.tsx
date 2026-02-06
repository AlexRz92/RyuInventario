import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';

export function Categories() {
  return (
    <AdminGuard>
      <AdminLayout title="Categorías">
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Gestión de Categorías</h2>
          <p className="text-slate-300">Administra las categorías de productos.</p>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
