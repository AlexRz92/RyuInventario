import { useEffect, useState } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { Orders } from './pages/admin/Orders';
import { Products } from './pages/admin/Products';
import { Categories } from './pages/admin/Categories';
import { Inventory } from './pages/admin/Inventory';
import { Shipping } from './pages/admin/Shipping';
import { BankAccounts } from './pages/admin/BankAccounts';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);

    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  const renderRoute = () => {
    switch (currentPath) {
      case '/login':
        return <Login />;
      case '/admin':
        return <Dashboard />;
      case '/admin/orders':
        return <Orders />;
      case '/admin/products':
        return <Products />;
      case '/admin/categories':
        return <Categories />;
      case '/admin/inventory':
        return <Inventory />;
      case '/admin/shipping':
        return <Shipping />;
      case '/admin/bank-accounts':
        return <BankAccounts />;
      default:
        return (
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-gray-700">Start prompting (or editing) to see magic happen :)</p>
              <a href="/login" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Ir a Login
              </a>
            </div>
          </div>
        );
    }
  };

  return renderRoute();
}

export default App;
