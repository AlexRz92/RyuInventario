import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';

export function Shipping() {
  return (
    <AdminGuard>
      <AdminLayout title="Envíos">
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Gestión de Envíos</h2>
          <p className="text-slate-300">Administra las reglas y métodos de envío.</p>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
