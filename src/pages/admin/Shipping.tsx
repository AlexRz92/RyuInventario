import { useState, useEffect } from 'react';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Toast } from '../../components/admin/Toast';
import { useShipping, ShippingRule, ShippingFormData } from '../../hooks/useShipping';
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, MapPin, DollarSign, X } from 'lucide-react';

type TabType = 'states' | 'cities';
type ModalMode = 'edit-state' | 'create-city' | 'edit-city' | null;

export function Shipping() {
  const {
    rules,
    loading,
    currentPage,
    totalCount,
    pageSize,
    loadRules,
    createRule,
    updateStateRule,
    updateRule,
    deleteRule,
    toggleActive,
  } = useShipping();

  const [activeTab, setActiveTab] = useState<TabType>('states');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedRule, setSelectedRule] = useState<ShippingRule | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [updatingActive, setUpdatingActive] = useState<string | null>(null);

  const [stateFormData, setStateFormData] = useState({
    is_free: false,
    base_cost: '',
  });

  const [cityFormData, setCityFormData] = useState<ShippingFormData>({
    country: 'Venezuela',
    state: '',
    city: '',
    is_free: false,
    base_cost: '',
    notes: '',
    is_active: true,
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    loadRules(1, undefined, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      loadRules(1, undefined, activeTab);
      return;
    }

    const debounceTimer = setTimeout(() => {
      loadRules(1, searchTerm.trim(), activeTab);
    }, 350);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    loadRules(newPage, searchTerm.trim() || undefined, activeTab);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const openEditStateModal = (rule: ShippingRule) => {
    setStateFormData({
      is_free: rule.is_free,
      base_cost: rule.base_cost.toString(),
    });
    setSelectedRule(rule);
    setModalMode('edit-state');
  };

  const openCreateCityModal = () => {
    setCityFormData({
      country: 'Venezuela',
      state: '',
      city: '',
      is_free: false,
      base_cost: '',
      notes: '',
      is_active: true,
    });
    setSelectedRule(null);
    setModalMode('create-city');
  };

  const openEditCityModal = (rule: ShippingRule) => {
    setCityFormData({
      country: rule.country,
      state: rule.state,
      city: rule.city || '',
      is_free: rule.is_free,
      base_cost: rule.base_cost.toString(),
      notes: rule.notes || '',
      is_active: rule.is_active,
    });
    setSelectedRule(rule);
    setModalMode('edit-city');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedRule(null);
  };

  const handleSaveStateRule = async () => {
    if (!selectedRule) return;

    const cost = parseFloat(stateFormData.base_cost);
    if (!stateFormData.is_free && (isNaN(cost) || cost < 0)) {
      showToast('El costo debe ser un número válido >= 0', 'error');
      return;
    }

    setSaving(true);
    const result = await updateStateRule(selectedRule.id, stateFormData.is_free, cost);
    setSaving(false);

    if (result.success) {
      showToast('Estado actualizado exitosamente', 'success');
      closeModal();
      loadRules(currentPage, searchTerm.trim() || undefined, activeTab);
    } else {
      showToast(result.error || 'Error al actualizar estado', 'error');
    }
  };

  const handleSaveCityRule = async () => {
    if (!cityFormData.state.trim()) {
      showToast('El estado es requerido', 'error');
      return;
    }

    if (!cityFormData.city.trim()) {
      showToast('La ciudad es requerida', 'error');
      return;
    }

    if (!cityFormData.is_free) {
      const cost = parseFloat(cityFormData.base_cost);
      if (isNaN(cost) || cost < 0) {
        showToast('El costo debe ser un número válido >= 0', 'error');
        return;
      }
    }

    setSaving(true);

    let result;
    if (modalMode === 'create-city') {
      result = await createRule(cityFormData);
    } else if (selectedRule) {
      result = await updateRule(selectedRule.id, cityFormData);
    }

    setSaving(false);

    if (result?.success) {
      showToast(
        modalMode === 'create-city' ? 'Excepción creada exitosamente' : 'Excepción actualizada exitosamente',
        'success'
      );
      closeModal();
      loadRules(currentPage, searchTerm.trim() || undefined, activeTab);
    } else {
      showToast(result?.error || 'Error al guardar excepción', 'error');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    const result = await deleteRule(ruleId);

    if (result.success) {
      showToast('Excepción eliminada exitosamente', 'success');
      setDeleteConfirm(null);
      loadRules(currentPage, searchTerm.trim() || undefined, activeTab);
    } else {
      showToast(result.error || 'Error al eliminar excepción', 'error');
    }
  };

  const handleToggleActive = async (rule: ShippingRule) => {
    setUpdatingActive(rule.id);
    const success = await toggleActive(rule.id, !rule.is_active);
    setUpdatingActive(null);

    if (!success) {
      showToast('Error al actualizar estado', 'error');
    }
  };

  if (loading && !rules.length) {
    return (
      <AdminGuard>
        <AdminLayout title="Envíos">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
              <p className="mt-4 text-slate-300">Cargando reglas de envío...</p>
            </div>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminLayout title="Envíos">
        {toast && <Toast message={toast.message} type={toast.type} />}

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
            <div className="border-b border-slate-700">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => handleTabChange('states')}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
                    activeTab === 'states'
                      ? 'border-gold text-gold bg-gold/5'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <MapPin size={16} />
                  <span>Estados</span>
                </button>
                <button
                  onClick={() => handleTabChange('cities')}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
                    activeTab === 'cities'
                      ? 'border-gold text-gold bg-gold/5'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <MapPin size={16} />
                  <span>Excepciones por Ciudad</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder={activeTab === 'states' ? 'Buscar estado...' : 'Buscar estado o ciudad...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-gold"
                  />
                </div>

                {activeTab === 'cities' && (
                  <button
                    onClick={openCreateCityModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gold text-slate-900 font-semibold rounded-lg hover:bg-gold/90 transition-all whitespace-nowrap"
                  >
                    <Plus size={20} />
                    Añadir Excepción
                  </button>
                )}
              </div>

              {activeTab === 'states' && (
                <div className="mb-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    Los estados se cargan automáticamente desde la base de datos. Solo puedes editar el costo y el tipo de envío.
                  </p>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Estado</th>
                      {activeTab === 'cities' && (
                        <th className="text-left py-3 px-4 font-semibold text-slate-300">Ciudad</th>
                      )}
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Tipo</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-300">Costo Base</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Activa</th>
                      {activeTab === 'cities' && (
                        <th className="text-left py-3 px-4 font-semibold text-slate-300">Notas</th>
                      )}
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.length === 0 ? (
                      <tr>
                        <td colSpan={activeTab === 'states' ? 5 : 7} className="text-center py-12 text-slate-400">
                          {searchTerm.trim()
                            ? 'No se encontraron resultados'
                            : activeTab === 'states'
                              ? 'No hay estados configurados en la base de datos'
                              : 'No hay excepciones por ciudad configuradas'}
                        </td>
                      </tr>
                    ) : (
                      rules.map((rule) => (
                        <tr
                          key={rule.id}
                          className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-4 px-4 text-white font-medium">{rule.state}</td>
                          {activeTab === 'cities' && (
                            <td className="py-4 px-4 text-white">{rule.city || '—'}</td>
                          )}
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                rule.is_free
                                  ? 'bg-green-900/50 text-green-300 border border-green-700'
                                  : 'bg-blue-900/50 text-blue-300 border border-blue-700'
                              }`}
                            >
                              {rule.is_free ? 'Gratis' : 'Pago'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-gold font-semibold">
                              ${Number(rule.base_cost).toFixed(2)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleToggleActive(rule)}
                              disabled={updatingActive === rule.id}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                rule.is_active ? 'bg-gold' : 'bg-slate-700'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  rule.is_active ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </td>
                          {activeTab === 'cities' && (
                            <td className="py-4 px-4 text-slate-400 text-sm max-w-xs truncate">
                              {rule.notes || '—'}
                            </td>
                          )}
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  activeTab === 'states'
                                    ? openEditStateModal(rule)
                                    : openEditCityModal(rule)
                                }
                                className="p-2 bg-blue-900/30 text-blue-300 rounded-lg hover:bg-blue-900/50 transition-all border border-blue-700/30"
                                title="Editar"
                              >
                                <Edit2 size={16} />
                              </button>
                              {activeTab === 'cities' && (
                                <button
                                  onClick={() => setDeleteConfirm(rule.id)}
                                  className="p-2 bg-red-900/30 text-red-300 rounded-lg hover:bg-red-900/50 transition-all border border-red-700/30"
                                  title="Eliminar"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="border-t border-slate-800 mt-6 pt-4 flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
                    {Math.min(currentPage * pageSize, totalCount)} de {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={18} />
                      Anterior
                    </button>
                    <span className="px-4 py-2 text-white">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {modalMode === 'edit-state' && selectedRule && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div
              className="bg-slate-900 rounded-xl shadow-2xl max-w-md w-full border border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Editar Estado</h2>
                  <p className="text-slate-400 text-sm mt-1">{selectedRule.state}</p>
                </div>
                <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <input
                    type="checkbox"
                    id="state_is_free"
                    checked={stateFormData.is_free}
                    onChange={(e) =>
                      setStateFormData({
                        ...stateFormData,
                        is_free: e.target.checked,
                        base_cost: e.target.checked ? '0' : stateFormData.base_cost,
                      })
                    }
                    className="w-4 h-4 rounded border-slate-700 text-gold bg-slate-800 focus:ring-gold"
                  />
                  <label htmlFor="state_is_free" className="text-sm font-medium text-slate-300">
                    Envío gratis
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <DollarSign size={16} />
                    Costo Base
                  </label>
                  <input
                    type="number"
                    value={stateFormData.base_cost}
                    onChange={(e) => setStateFormData({ ...stateFormData, base_cost: e.target.value })}
                    disabled={stateFormData.is_free}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="0.00"
                  />
                  {stateFormData.is_free && (
                    <p className="text-xs text-slate-500 mt-1">
                      El costo se establece automáticamente en $0.00 para envíos gratis
                    </p>
                  )}
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
                  onClick={handleSaveStateRule}
                  disabled={saving}
                  className="px-4 py-2 bg-gold text-slate-900 font-semibold rounded-lg hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        )}

        {(modalMode === 'create-city' || modalMode === 'edit-city') && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div
              className="bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full border border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-slate-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white">
                  {modalMode === 'create-city' ? 'Crear Excepción por Ciudad' : 'Editar Excepción por Ciudad'}
                </h2>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Estado *
                    </label>
                    <input
                      type="text"
                      value={cityFormData.state}
                      onChange={(e) => setCityFormData({ ...cityFormData, state: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold"
                      placeholder="Nombre del estado"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      value={cityFormData.city}
                      onChange={(e) => setCityFormData({ ...cityFormData, city: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold"
                      placeholder="Nombre de la ciudad"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <input
                    type="checkbox"
                    id="city_is_free"
                    checked={cityFormData.is_free}
                    onChange={(e) =>
                      setCityFormData({
                        ...cityFormData,
                        is_free: e.target.checked,
                        base_cost: e.target.checked ? '0' : cityFormData.base_cost,
                      })
                    }
                    className="w-4 h-4 rounded border-slate-700 text-gold bg-slate-800 focus:ring-gold"
                  />
                  <label htmlFor="city_is_free" className="text-sm font-medium text-slate-300">
                    Envío gratis
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Costo Base
                  </label>
                  <input
                    type="number"
                    value={cityFormData.base_cost}
                    onChange={(e) => setCityFormData({ ...cityFormData, base_cost: e.target.value })}
                    disabled={cityFormData.is_free}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="0.00"
                  />
                  {cityFormData.is_free && (
                    <p className="text-xs text-slate-500 mt-1">
                      El costo se establece automáticamente en $0.00 para envíos gratis
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={cityFormData.notes}
                    onChange={(e) => setCityFormData({ ...cityFormData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold resize-none"
                    placeholder="Información adicional sobre esta excepción..."
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="city_is_active"
                    checked={cityFormData.is_active}
                    onChange={(e) => setCityFormData({ ...cityFormData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 text-gold bg-slate-800 focus:ring-gold"
                  />
                  <label htmlFor="city_is_active" className="text-sm font-medium text-slate-300">
                    Excepción activa
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
                  onClick={handleSaveCityRule}
                  disabled={saving}
                  className="px-4 py-2 bg-gold text-slate-900 font-semibold rounded-lg hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? 'Guardando...'
                    : modalMode === 'create-city'
                      ? 'Crear Excepción'
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
                  ¿Estás seguro de que deseas eliminar esta excepción por ciudad? Esta acción no se puede deshacer.
                </p>
              </div>

              <div className="border-t border-slate-800 px-6 py-4 flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteRule(deleteConfirm)}
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
