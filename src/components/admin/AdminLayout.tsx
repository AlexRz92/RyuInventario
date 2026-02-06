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
  LogOut
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className={`fixed inset-0 bg-black bg-opacity-70 z-20 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`fixed top-0 left-0 z-30 w-64 h-full bg-slate-900 border-r border-slate-800 transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-gold transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentPath === item.href
                  ? 'bg-slate-800 text-gold border-l-4 border-gold shadow-lg shadow-gold/10'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border-l-4 border-transparent'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>

      <div className="lg:ml-64">
        <header className="bg-slate-900 border-b border-gold/20 sticky top-0 z-10 shadow-lg">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-gold transition-colors">
                <Menu size={24} />
              </button>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gold border border-gold/30 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-gold/20">
              <LogOut size={18} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
