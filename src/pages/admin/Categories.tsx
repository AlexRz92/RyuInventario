import { useState } from 'react';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Toast } from '../../components/admin/Toast';
import { useCategories, Category, CategoryFormData } from '../../hooks/useCategories';
import { Plus, Edit2, Trash2, Search, X, FolderTree } from 'lucide-react';

type ModalMode = 'create' | 'edit' | null;

export function Categories() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    image_url: '',
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      image_url: '',
    });
    setSelectedCategory(null);
    setModalMode('create');
  };

  const openEditModal = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
    });
    setSelectedCategory(category);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedCategory(null);
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      showToast('El nombre es requerido', 'error');
      return;
    }

    setSaving(true);

    let result;
    if (modalMode === 'create') {
      result = await createCategory(formData);
    } else if (selectedCategory) {
      result = await updateCategory(selectedCategory.id, formData);
    }

    setSaving(false);

    if (result?.success) {
      showToast(
        modalMode === 'create' ? 'Categoría creada exitosamente' : 'Categoría actualizada exitosamente',
        'success'
      );
      closeModal();
    } else {
      showToast(result?.error || 'Error al guardar categoría', 'error');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const result = await deleteCategory(categoryId);

    if (result.success) {
      showToast('Categoría eliminada exitosamente', 'success');
      setDeleteConfirm(null);
    } else {
      showToast(result.error || 'Error al eliminar categoría', 'error');
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout title="Categorías">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
              <p className="mt-4 text-slate-300">Cargando categorías...</p>
            </div>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminLayout title="Categorías">
        {toast && <Toast message={toast.message} type={toast.type} />}

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar categorías..."
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
              Añadir Categoría
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
            {filteredCategories.length === 0 ? (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-slate-800/50 rounded-full p-6">
                    <FolderTree size={48} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-lg font-medium">
                      {searchTerm.trim()
                        ? 'No se encontraron categorías con ese criterio'
                        : 'No hay categorías disponibles'}
                    </p>
                    {!searchTerm.trim() && (
                      <p className="text-slate-500 text-sm mt-2">
                        Comienza agregando tu primera categoría
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Imagen</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Nombre</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Descripción</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Fecha Creación</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr
                        key={category.id}
                        className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 px-4">
                          {category.image_url ? (
                            <img
                              src={category.image_url}
                              alt={category.name}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                              <FolderTree size={24} className="text-slate-600" />
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-white">{category.name}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-slate-400 text-sm line-clamp-2">
                            {category.description || '—'}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-slate-300 text-sm">
                          {new Date(category.created_at).toLocaleDateString('es', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(category)}
                              className="p-2 bg-blue-900/30 text-blue-300 rounded-lg hover:bg-blue-900/50 transition-all border border-blue-700/30"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(category.id)}
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

          {!searchTerm.trim() && filteredCategories.length > 0 && (
            <div className="flex items-center justify-between text-sm text-slate-400">
              <p>
                Total: <span className="text-gold font-semibold">{categories.length}</span> {categories.length === 1 ? 'categoría' : 'categorías'}
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
                  {modalMode === 'create' ? 'Crear Categoría' : 'Editar Categoría'}
                </h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold"
                    placeholder="Nombre de la categoría"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold resize-none"
                    placeholder="Descripción de la categoría"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    URL de Imagen
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold"
                    placeholder="https://..."
                  />
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="preview"
                      className="mt-2 h-32 rounded-lg object-cover border border-slate-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Error+al+cargar';
                      }}
                    />
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
                  onClick={handleSaveCategory}
                  disabled={saving}
                  className="px-4 py-2 bg-gold text-slate-900 font-semibold rounded-lg hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? 'Guardando...'
                    : modalMode === 'create'
                      ? 'Crear Categoría'
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
                  ¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.
                </p>
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 mt-4">
                  <p className="text-yellow-300 text-sm">
                    Si la categoría tiene productos asociados, no podrá ser eliminada.
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
                  onClick={() => handleDeleteCategory(deleteConfirm)}
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
