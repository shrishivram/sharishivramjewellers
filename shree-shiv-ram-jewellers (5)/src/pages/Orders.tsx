import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Search, MoreVertical, X, ShoppingCart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface OrderItem {
  id: string;
  orderId: string;
  name: string;
  price: number;
  image: string;
  status: 'Placed' | 'Shipped' | 'Delivered';
  date: string;
}

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${user?.id}`);
      const data = await res.json();
      setOrders(data.map((o: any) => ({
        ...o,
        orderId: `#ORD-${o.id.toString().padStart(4, '0')}`,
        date: o.status === 'delivered' ? `Delivered on ${new Date(o.created_at).toLocaleDateString()}` : `Placed on ${new Date(o.created_at).toLocaleDateString()}`
      })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const tabs = ['All', 'Placed', 'Shipped', 'Delivered'];

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'All' || order.status === activeTab;
    const matchesSearch = order.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         order.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBackToAdd = (order: OrderItem) => {
    addToCart({
      id: Math.floor(Math.random() * 10000), // dummy id
      name: order.name,
      price: order.price,
      image: order.image,
      category_id: 1,
      description: 'Re-ordered from history'
    });
    setOpenMenuId(null);
    navigate('/cart');
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setOpenMenuId(null);
  };

  return (
    <div className="min-h-screen bg-[#F0F1F5] pb-20">
      {/* Header */}
      <div className="px-6 py-6 flex justify-between items-center sticky top-0 bg-[#F0F1F5]/80 backdrop-blur-md z-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-brand-dark" />
        </button>
        <h1 className="text-2xl font-bold text-brand-dark">Orders</h1>
        <button 
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          {isSearchOpen ? <X size={24} className="text-brand-dark" /> : <Search size={24} className="text-brand-dark" />}
        </button>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="px-6 overflow-hidden"
          >
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" />
              <input 
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your orders..."
                className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-medium border-none focus:ring-2 focus:ring-brand-green/20 outline-none shadow-sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="px-6 mb-6 flex justify-between border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 text-sm font-bold transition-all relative ${
              activeTab === tab ? 'text-brand-dark' : 'text-brand-dark/40'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green"
              />
            )}
          </button>
        ))}
      </div>

      {/* Order List */}
      <div className="px-6 space-y-4">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-4 flex gap-4 shadow-sm relative group"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-brand-cream flex-shrink-0">
                <img 
                  src={order.image} 
                  alt={order.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 py-1">
                <div className="flex justify-between items-start relative">
                  <span className="text-sm font-bold text-brand-dark/60">{order.orderId}</span>
                  <div className="relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                      className="p-1 text-brand-dark/20 hover:text-brand-dark transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    <AnimatePresence>
                      {openMenuId === order.id && (
                        <motion.div
                          ref={menuRef}
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-2 overflow-hidden"
                        >
                          <button
                            onClick={() => handleBackToAdd(order)}
                            className="w-full px-4 py-3 text-left text-sm font-bold text-brand-dark hover:bg-brand-cream transition-colors flex items-center gap-3"
                          >
                            <ShoppingCart size={16} className="text-brand-green" />
                            Back to Add
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="w-full px-4 py-3 text-left text-sm font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3"
                          >
                            <Trash2 size={16} />
                            Cancel
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <h3 className="font-bold text-brand-dark text-lg mb-1">{order.name}</h3>
                <p className="text-brand-green font-bold mb-2">₹{order.price.toLocaleString()}</p>
                <p className="text-xs font-medium text-brand-dark/40">{order.date}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-20">
            <p className="text-brand-dark/40 font-medium italic">No orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
