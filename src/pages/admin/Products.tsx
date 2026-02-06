import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';

export function Products() {
  return (
    <AdminGuard>
      <AdminLayout title="Productos">
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Gestión de Productos</h2>
          <p className="text-slate-300">Administra el catálogo de productos de la tienda.</p>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
