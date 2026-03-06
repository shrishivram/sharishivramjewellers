import { motion } from 'motion/react';
import { Search, ShoppingBag, User, Heart, Home, LayoutGrid } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const location = useLocation();
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { icon: Heart, path: '/wishlist', label: 'Wishlist' },
    { icon: LayoutGrid, path: '/categories', label: 'Categories' },
    { icon: Home, path: '/', label: 'Home', isMain: true },
    { icon: ShoppingBag, path: '/cart', label: 'Cart', count: cartCount },
    { icon: User, path: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-6 left-6 right-6 z-50 bg-white/90 backdrop-blur-xl border border-brand-dark/5 rounded-[32px] px-2 py-2 shadow-2xl max-w-lg mx-auto">
      <div className="flex w-full justify-around items-center">
        {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center group"
              >
                <motion.div
                  animate={{
                    y: isActive ? -20 : 0,
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                    isActive 
                      ? 'bg-brand-green text-white shadow-brand-green/40 shadow-lg' 
                      : 'bg-transparent text-brand-dark/40 hover:text-brand-green'
                  }`}
                >
                  <Icon size={22} />
                  
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`absolute -top-1 -right-1 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white ${isActive ? 'bg-brand-dark' : 'bg-brand-green'}`}>
                      {item.count}
                    </span>
                  )}
                </motion.div>
                
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 w-1 h-1 bg-brand-green rounded-full"
                  />
                )}
              </Link>
            );
          })}
      </div>
    </nav>
  );
}
