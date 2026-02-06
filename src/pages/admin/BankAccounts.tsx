import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';

export function BankAccounts() {
  return (
    <AdminGuard>
      <AdminLayout title="Cuentas Bancarias">
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Gestión de Cuentas Bancarias</h2>
          <p className="text-slate-300">Administra las cuentas bancarias para pagos.</p>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
