import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';

export function Inventory() {
  return (
    <AdminGuard>
      <AdminLayout title="Inventario">
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Gestión de Inventario</h2>
          <p className="text-slate-300">Controla el stock y disponibilidad de productos.</p>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
