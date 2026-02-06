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
      case '/':
        return <Login />;
      case '/admin':
      case '/admin/dashboard':
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
        return <Login />;
    }
  };

  return renderRoute();
}

export default App;
