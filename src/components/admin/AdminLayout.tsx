import { ReactNode, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Boxes,
  Truck,
  CreditCard,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} /> },
  { label: 'Órdenes', href: '/admin/orders', icon: <ShoppingCart size={20} /> },
  { label: 'Productos', href: '/admin/products', icon: <Package size={20} /> },
  { label: 'Categorías', href: '/admin/categories', icon: <FolderTree size={20} /> },
  { label: 'Inventario', href: '/admin/inventory', icon: <Boxes size={20} /> },
  { label: 'Envíos', href: '/admin/shipping', icon: <Truck size={20} /> },
  { label: 'Cuentas Bancarias', href: '/admin/bank-accounts', icon: <CreditCard size={20} /> },
];

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentPath = window.location.pathname;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`fixed top-0 left-0 z-30 w-64 h-full bg-white border-r border-gray-200 transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPath === item.href
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      <div className="lg:ml-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
                <Menu size={24} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            </div>
            <a href="/" className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
              <ArrowLeft size={18} />
              <span className="font-medium">Volver a la tienda</span>
            </a>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
