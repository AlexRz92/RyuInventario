import { useEffect, useState } from 'react';
import { X, Package, CreditCard, MapPin, FileText, Image as ImageIcon } from 'lucide-react';
import { Order, OrderItem } from '../../hooks/useOrders';
import { useOrders } from '../../hooks/useOrders';

interface OrderDetailModalProps {
  order: Order;
  items: OrderItem[];
  onClose: () => void;
}

export function OrderDetailModal({ order, items, onClose }: OrderDetailModalProps) {
  const { getPaymentProofSignedUrl } = useOrders();
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleViewProof = async () => {
    if (!order.payment_proof_url) return;

    setLoadingImage(true);
    setImageError(false);
    setShowImagePreview(true);

    const url = await getPaymentProofSignedUrl(order.payment_proof_url);
    if (url) {
      setSignedUrl(url);
    } else {
      setImageError(true);
    }
    setLoadingImage(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-900/50 text-green-300 border border-green-700';
      case 'confirmed': return 'bg-blue-900/50 text-blue-300 border border-blue-700';
      case 'pending': return 'bg-yellow-900/50 text-yellow-300 border border-yellow-700';
      case 'cancelled': return 'bg-red-900/50 text-red-300 border border-red-700';
      default: return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: 'Completado',
      confirmed: 'Confirmado',
      pending: 'Pendiente',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      transfer: 'Transferencia',
      cash: 'Efectivo',
      card: 'Tarjeta'
    };
    return labels[method] || method;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-slate-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-800" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-slate-900 border-b border-gold/20 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-white">Detalle de Orden</h2>
              <p className="text-gold font-mono text-sm mt-1">{order.tracking_code}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                  <Package size={16} />
                  INFORMACIÓN DEL CLIENTE
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-500">Nombre</p>
                    <p className="text-white font-medium">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-white">{order.customer_email}</p>
                  </div>
                  {order.customer_phone && (
                    <div>
                      <p className="text-xs text-slate-500">Teléfono</p>
                      <p className="text-white">{order.customer_phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-500">Fecha</p>
                    <p className="text-white">
                      {new Date(order.created_at).toLocaleString('es', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                  <CreditCard size={16} />
                  INFORMACIÓN DE PAGO
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-500">Estado</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Método de Pago</p>
                    <p className="text-white font-medium">{getPaymentMethodLabel(order.payment_method)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="text-2xl font-bold text-gold">${Number(order.total_amount).toFixed(2)}</p>
                  </div>
                  {order.payment_proof_url && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Comprobante de Pago</p>
                      <button
                        onClick={handleViewProof}
                        disabled={loadingImage}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingImage ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
                            Cargando...
                          </>
                        ) : (
                          <>
                            <ImageIcon size={16} />
                            Ver Comprobante
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                  <MapPin size={16} />
                  DIRECCIÓN / NOTAS
                </h3>
                <p className="text-white whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                <FileText size={16} />
                PRODUCTOS ({items.length})
              </h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.product_name}</p>
                      <p className="text-slate-400 text-sm font-mono">SKU: {item.product_sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">
                        {item.quantity} x ${Number(item.product_price).toFixed(2)}
                      </p>
                      <p className="text-gold font-bold">${Number(item.subtotal).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showImagePreview && order.payment_proof_url && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4" onClick={() => setShowImagePreview(false)}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setShowImagePreview(false);
                setSignedUrl(null);
                setImageError(false);
              }}
              className="absolute -top-12 right-0 text-white hover:text-gold transition-colors"
            >
              <X size={32} />
            </button>

            {imageError ? (
              <div className="bg-slate-900 border border-red-700 rounded-lg p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-red-400">
                    <FileText size={48} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Error al cargar el comprobante</h3>
                    <p className="text-slate-400 text-sm">
                      No fue posible acceder al archivo. Intenta de nuevo o contacta al administrador.
                    </p>
                  </div>
                </div>
              </div>
            ) : signedUrl ? (
              <img
                src={signedUrl}
                alt="Comprobante de pago"
                className="w-full h-auto rounded-lg border border-gold/30"
              />
            ) : (
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
                <p className="mt-4 text-slate-300">Cargando comprobante...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
