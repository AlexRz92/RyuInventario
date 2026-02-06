import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';

export function BankAccounts() {
  return (
    <AdminGuard>
      <AdminLayout title="Cuentas Bancarias">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestión de Cuentas Bancarias</h2>
          <p className="text-gray-600">Administra las cuentas bancarias para pagos.</p>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
