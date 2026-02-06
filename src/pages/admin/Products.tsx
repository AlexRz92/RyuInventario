import { useEffect, useState } from 'react';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Star, Search } from 'lucide-react';
import { Toast } from '../../components/admin/Toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  sku: string;
  category_id: string;
  is_active: boolean;
  is_featured: boolean;
}

interface Category {
  id: string;
  name: string;
}

type ModalMode = 'create' | 'edit' | null;

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [updatingFeatured, setUpdatingFeatured] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('categories').select('id, name').order('name'),
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error cargando datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category_id: '',
      is_active: true,
    });
    setSelectedProduct(null);
    setModalMode('create');
  };

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image_url: product.image_url,
      category_id: product.category_id,
      is_active: product.is_active,
    });
    setSelectedProduct(product);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedProduct(null);
  };

  const handleSaveProduct = async () => {
    if (!formData.name.trim()) {
      showToast('El nombre es requerido', 'error');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      showToast('El precio debe ser un número válido y >= 0', 'error');
      return;
    }

    if (!formData.category_id) {
      showToast('Debes seleccionar una categoría', 'error');
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price,
        image_url: formData.image_url,
        category_id: formData.category_id,
        is_active: formData.is_active,
      };

      let result;
      if (modalMode === 'create') {
        result = await supabase.from('products').insert([productData]).select();
      } else if (selectedProduct) {
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', selectedProduct.id)
          .select();
      }

      if (result?.data) {
        if (modalMode === 'create') {
          setProducts([...products, result.data[0]]);
          showToast('Producto creado exitosamente', 'success');
        } else {
          setProducts(
            products.map((p) => (p.id === selectedProduct?.id ? result.data[0] : p))
          );
          showToast('Producto actualizado exitosamente', 'success');
        }
        closeModal();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Error guardando producto', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);

      if (!error) {
        setProducts(products.filter((p) => p.id !== productId));
        setDeleteConfirm(null);
        showToast('Producto eliminado exitosamente', 'success');
      } else {
        showToast('Error eliminando producto', 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Error eliminando producto', 'error');
    }
  };

  const toggleFeatured = async (product: Product) => {
    setUpdatingFeatured(product.id);
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !product.is_featured })
        .eq('id', product.id);

      if (!error) {
        setProducts(
          products.map((p) =>
            p.id === product.id ? { ...p, is_featured: !product.is_featured } : p
          )
        );
      }
    } catch (error) {
      console.error('Error updating featured:', error);
      showToast('Error actualizando destacado', 'error');
    } finally {
      setUpdatingFeatured(null);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout title="Productos">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
              <p className="mt-4 text-slate-300">Cargando productos...</p>
            </div>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminLayout title="Productos">
        {toast && <Toast message={toast.message} type={toast.type} />}

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-gold"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-slate-900 font-semibold rounded-lg hover:bg-gold/90 transition-all"
            >
              <Plus size={20} />
              Añadir Producto
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-400">No hay productos disponibles</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Imagen</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Producto</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">SKU</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-300">Categoría</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-300">Precio</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Estado</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Destacado</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-300">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const category = categories.find((c) => c.id === product.category_id);
                      return (
                        <tr key={product.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-4">
                            <img
                              src={product.image_url || 'https://via.placeholder.com/50'}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-white">{product.name}</p>
                              <p className="text-xs text-slate-400 line-clamp-1">
                                {product.description}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-slate-300 font-mono text-sm">
                            {product.sku}
                          </td>
                          <td className="py-4 px-4 text-slate-300">{category?.name || '-'}</td>
                          <td className="py-4 px-4 text-right">
                            <p className="text-gold font-semibold">
                              ${Number(product.price).toFixed(2)}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                product.is_active
                                  ? 'bg-green-900/50 text-green-300 border border-green-700'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {product.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => toggleFeatured(product)}
                              disabled={updatingFeatured === product.id}
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                                product.is_featured
                                  ? 'bg-gold/20 text-gold border border-gold/50'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              title={product.is_featured ? 'Quitar destacado' : 'Marcar destacado'}
                            >
                              <Star
                                size={16}
                                className={product.is_featured ? 'fill-gold' : ''}
                              />
                            </button>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditModal(product)}
                                className="p-2 bg-blue-900/30 text-blue-300 rounded-lg hover:bg-blue-900/50 transition-all border border-blue-700/30"
                                title="Editar"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(product.id)}
                                className="p-2 bg-red-900/30 text-red-300 rounded-lg hover:bg-red-900/50 transition-all border border-red-700/30"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {modalMode && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div
              className="bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full border border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-slate-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white">
                  {modalMode === 'create' ? 'Crear Producto' : 'Editar Producto'}
                </h2>
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
                    placeholder="Nombre del producto"
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
                    placeholder="Descripción del producto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Precio *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Categoría *
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-gold"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
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
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200';
                      }}
                    />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 text-gold bg-slate-800 focus:ring-gold"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-slate-300">
                    Producto activo
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
                  onClick={handleSaveProduct}
                  disabled={saving}
                  className="px-4 py-2 bg-gold text-slate-900 font-semibold rounded-lg hover:bg-gold/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? 'Guardando...'
                    : modalMode === 'create'
                      ? 'Crear Producto'
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
                  ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
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
                  onClick={() => handleDeleteProduct(deleteConfirm)}
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
