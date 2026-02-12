import { useState } from 'react';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Toast } from '../../components/admin/Toast';
import { useBankAccounts, BankAccount, BankAccountFormData } from '../../hooks/useBankAccounts';
import { Plus, Edit2, Trash2, Search, X, CreditCard, Power, Star } from 'lucide-react';

type ModalMode = 'create' | 'edit' | null;

export function BankAccounts() {
  const { accounts, loading, createAccount, updateAccount, toggleActive, deleteAccount } =
    useBankAccounts();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState<BankAccountFormData>({
    label: '',
    bank_name: '',
    account_holder: '',
    account_number: '',
    document_id: '',
    account_type: 'Corriente',
    notes: '',
    is_active: true,
    is_primary: false,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      account.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_holder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_number.includes(searchTerm)
  );

  const openCreateModal = () => {
    setFormData({
      label: '',
      bank_name: '',
      account_holder: '',
      account_number: '',
      document_id: '',
      account_type: 'Corriente',
      notes: '',
      is_active: true,
      is_primary: false,
    });
    setSelectedAccount(null);
    setModalMode('create');
  };

  const openEditModal = (account: BankAccount) => {
    setFormData({
      label: account.label,
      bank_name: account.bank_name,
      account_holder: account.account_holder,
      account_number: account.account_number,
      document_id: account.document_id,
      account_type: account.account_type || 'Corriente',
      notes: account.notes || '',
      is_active: account.is_active,
      is_primary: account.is_primary,
    });
    setSelectedAccount(account);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedAccount(null);
  };

  const handleSaveAccount = async () => {
    if (!formData.bank_name.trim()) {
      showToast('El banco es requerido', 'error');
      return;
    }

    if (!formData.account_holder.trim()) {
      showToast('El titular es requerido', 'error');
      return;
    }

    if (!formData.account_number.trim()) {
      showToast('El número de cuenta es requerido', 'error');
      return;
    }

    if (formData.account_number.trim().length < 10) {
      showToast('El número de cuenta debe tener al menos 10 caracteres', 'error');
      return;
    }

    setSaving(true);

    let result;
    if (modalMode === 'create') {
      result = await createAccount(formData);
    } else if (selectedAccount) {
      result = await updateAccount(selectedAccount.id, formData);
    }

    setSaving(false);

    if (result?.success) {
      showToast(
        modalMode === 'create'
          ? 'Cuenta bancaria creada exitosamente'
          : 'Cuenta bancaria actualizada exitosamente',
        'success'
      );
      closeModal();
    } else {
      showToast(result?.error || 'Error al guardar cuenta', 'error');
    }
  };

  const handleToggleActive = async (accountId: string, currentStatus: boolean) => {
    const result = await toggleActive(accountId, !currentStatus);

    if (result.success) {
      showToast(
        !currentStatus
          ? 'Cuenta activada exitosamente'
          : 'Cuenta desactivada exitosamente',
        'success'
      );
    } else {
      showToast(result.error || 'Error al cambiar estado', 'error');
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    const result = await deleteAccount(accountId);

    if (result.success) {
      showToast('Cuenta bancaria eliminada exitosamente', 'success');
      setDeleteConfirm(null);
    } else {
      showToast(result.error || 'Error al eliminar cuenta', 'error');
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout title="Cuentas Bancarias">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
              <p className="mt-4 text-slate-300">Cargando cuentas bancarias...</p>
            </div>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminLayout title="Cuentas Bancarias">
        {toast && <Toast message={toast.message} type={toast.type} />}

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por banco, titular o número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-gold"
              />
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-slate-900 font-semibold rounded-lg hover:bg-gold/90 transition-all"
            >
              <Plus size={20} />
              Añadir Cuenta
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
            {filteredAccounts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-slate-800/50 rounded-full p-6">
                    <CreditCard size={48} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-lg font-medium">
                      {searchTerm.trim()
                        ? 'No se encontraron cuentas con ese criterio'
                        : 'No hay cuentas bancarias disponibles'}
                    </p>
                    {!searchTerm.trim() && (
                      <p className="text-slate-500 text-sm mt-2">
                        Comienza agregando tu primera cuenta bancaria
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Banco</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Titular</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">
                        N° Cuenta
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Cédula/RIF</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">
                        Principal
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Activa</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account) => (
                      <tr
                        key={account.id}
                        className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <p className="font-medium text-white">{account.bank_name}</p>
                          {account.label && (
                            <p className="text-slate-500 text-xs">{account.label}</p>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-slate-300">{account.account_holder}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-slate-300 font-mono">{account.account_number}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-slate-400 text-xs">
                            {account.account_type || '—'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-slate-400 text-sm">
                            {account.document_id || '—'}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {account.is_primary && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gold/20 text-gold rounded-md text-xs font-semibold border border-gold/30">
                              <Star size={14} fill="currentColor" />
                              Principal
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleToggleActive(account.id, account.is_active)}
                            className={`p-2 rounded-lg transition-all border ${
                              account.is_active
                                ? 'bg-green-900/30 text-green-300 border-green-700/30 hover:bg-green-900/50'
                                : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'
                            }`}
                            title={
                              account.is_active ? 'Desactivar cuenta' : 'Activar cuenta'
                            }
                          >
                            <Power size={18} />
                          </button>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(account)}
                              className="p-2 bg-blue-900/30 text-blue-300 rounded-lg hover:bg-blue-900/50 transition-all border border-blue-700/30"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(account.id)}
                              className="p-2 bg-red-900/30 text-red-300 rounded-lg hover:bg-red-900/50 transition-all border border-red-700/30"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!searchTerm.trim() && filteredAccounts.length > 0 && (
            <div className="flex items-center justify-between text-sm text-slate-400">
              <p>
                Total:{' '}
                <span className="text-gold font-semibold">{accounts.length}</span>{' '}
                {accounts.length === 1 ? 'cuenta' : 'cuentas'} (
                <span className="text-green-400">
                  {accounts.filter((a) => a.is_active).length}
                </span>{' '}
                activas)
              </p>
            </div>
          )}
        </div>

        {modalMode && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div
              className="bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full border border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {modalMode === 'create' ? 'Crear Cuenta Bancaria' : 'Editar Cuenta Bancaria'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Banco *
                    </label>
                    <input
                      type="text"
                      value={formData.bank_name}
                      onChange={(e) =>
                        setFormData({ ...formData, bank_name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold"
                      placeholder="Ej: Banco de Venezuela"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tipo de Cuenta
                    </label>
                    <select
                      value={formData.account_type}
                      onChange={(e) =>
                        setFormData({ ...formData, account_type: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold"
                    >
                      <option value="Corriente">Corriente</option>
                      <option value="Ahorro">Ahorro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Titular *
                    </label>
                    <input
                      type="text"
                      value={formData.account_holder}
                      onChange={(e) =>
                        setFormData({ ...formData, account_holder: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold"
                      placeholder="Nombre del titular"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Cédula/RIF
                    </label>
                    <input
                      type="text"
                      value={formData.document_id}
                      onChange={(e) =>
                        setFormData({ ...formData, document_id: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold"
                      placeholder="Ej: J-12345678-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Número de Cuenta *
                  </label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) =>
                      setFormData({ ...formData, account_number: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold"
                    placeholder="Ej: 0102-0123-45-1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Etiqueta</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold"
                    placeholder="Ej: Cuenta Principal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold resize-none"
                    placeholder="Notas adicionales"
                  />
                </div>

                <div className="space-y-3 bg-slate-800/30 rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-gold"
                    />
                    <span className="text-sm text-slate-300">
                      Cuenta Activa (disponible para pagos)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_primary}
                      onChange={(e) =>
                        setFormData({ ...formData, is_primary: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-gold"
                    />
                    <span className="text-sm text-slate-300">
                      Marcar como cuenta principal
                    </span>
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-800 px-6 py-4 flex gap-3 justify-end">
                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAccount}
                  disabled={saving}
                  className="px-4 py-2 bg-gold text-slate-900 font-semibold rounded-lg hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? 'Guardando...'
                    : modalMode === 'create'
                      ? 'Crear Cuenta'
                      : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-xl shadow-2xl max-w-md w-full border border-red-700/30">
              <div className="border-b border-slate-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Confirmar eliminación</h2>
              </div>

              <div className="p-6">
                <p className="text-slate-300 mb-4">
                  ¿Estás seguro de que deseas eliminar esta cuenta bancaria?
                </p>
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
                  <p className="text-yellow-300 text-sm">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-800 px-6 py-4 flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteAccount(deleteConfirm)}
                  className="px-4 py-2 bg-red-900 text-red-200 font-semibold rounded-lg hover:bg-red-800 transition-all border border-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
