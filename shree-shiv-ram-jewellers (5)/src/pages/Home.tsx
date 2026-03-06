import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Search, Bell, X, Info, LayoutGrid, ChevronRight, ShoppingBag } from 'lucide-react';
import { Category, Product, Deal } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, dealRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products'),
          fetch('/api/deals')
        ]);

        if (catRes.ok && catRes.headers.get('content-type')?.includes('application/json')) {
          setCategories(await catRes.json());
        }
        if (prodRes.ok && prodRes.headers.get('content-type')?.includes('application/json')) {
          setProducts(await prodRes.json());
        }
        if (dealRes.ok && dealRes.headers.get('content-type')?.includes('application/json')) {
          setDeals(await dealRes.json());
        }
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category_id === activeCategory);

  const notifications = [
    { id: 1, title: 'New Collection!', message: 'Check out our latest diamond sets.', time: '2h ago' },
    { id: 2, title: 'Order Update', message: 'Your order #1234 has been shipped.', time: '5h ago' },
    { id: 3, title: 'Special Offer', message: 'Get 20% off on all necklaces today!', time: '1d ago' },
  ];

  return (
    <div className="pb-32 pt-6 px-6 max-w-7xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold font-sans">
          {user ? `${user.name}!` : 'Heri Maguire!'}
        </h1>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/search')}
            className="p-2.5 bg-brand-cream rounded-full text-brand-dark hover:bg-brand-green hover:text-white transition-all"
          >
            <Search size={22} />
          </button>
          <button 
            onClick={() => setShowNotifications(true)}
            className="p-2.5 bg-brand-cream rounded-full text-brand-dark relative hover:bg-brand-green hover:text-white transition-all"
          >
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>

      {/* Notification Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-[101] p-6"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Notifications</h2>
                <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-brand-cream rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 bg-brand-cream rounded-2xl flex gap-3">
                    <div className="p-2 bg-brand-green/10 text-brand-green rounded-full h-fit">
                      <Info size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{n.title}</h3>
                      <p className="text-xs text-brand-dark/60 mt-1">{n.message}</p>
                      <span className="text-[10px] text-brand-dark/40 mt-2 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dynamic Deals Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Exclusive Deals</h2>
          <button className="text-brand-green text-sm font-bold flex items-center gap-1">
            View All <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {deals.map((deal) => (
            <motion.div 
              key={deal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="min-w-[300px] h-[160px] bg-brand-green rounded-[32px] p-6 flex justify-between items-center relative overflow-hidden flex-shrink-0"
            >
              <div className="z-10 pr-4">
                <h3 className="text-white text-xl font-bold leading-tight mb-1">{deal.title}</h3>
                <p className="text-white text-2xl font-black mb-2">{deal.discount}</p>
                <p className="text-white/60 text-[10px]">Expires: {new Date(deal.expiry_date).toLocaleDateString()}</p>
              </div>
              <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center rotate-12 flex-shrink-0">
                <img 
                  src={deal.image} 
                  alt={deal.title} 
                  className="w-20 h-20 object-cover rounded-xl -rotate-12"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          ))}
          {deals.length === 0 && (
            <div className="w-full h-[160px] bg-brand-cream rounded-[32px] flex items-center justify-center border-2 border-dashed border-brand-dark/10">
              <p className="text-brand-dark/40 font-medium">No active deals at the moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Categories</h2>
        <button 
          onClick={() => navigate('/categories')}
          className="text-brand-green text-sm font-bold flex items-center gap-1"
        >
          <LayoutGrid size={16} /> See All
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${activeCategory === 'all' ? 'bg-brand-green text-white' : 'bg-white border border-brand-dark/10 text-brand-dark/60'}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-brand-green text-white' : 'bg-white border border-brand-dark/10 text-brand-dark/60'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8">
        {filteredProducts.map((product) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="group cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            <div className="aspect-[4/5] bg-brand-cream rounded-3xl overflow-hidden relative mb-3">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all transform hover:scale-110 ${isInWishlist(product.id) ? 'bg-brand-green text-white' : 'bg-white text-brand-green hover:bg-brand-green hover:text-white'}`}
              >
                <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
              </button>
              
              {/* Quick Add Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
                className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md text-brand-dark py-2 rounded-xl text-[10px] font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all hover:bg-brand-green hover:text-white flex items-center justify-center gap-2"
              >
                <ShoppingBag size={14} /> Add to Cart
              </button>
            </div>
            <h3 className="font-bold text-sm text-brand-dark mb-1 truncate">{product.name}</h3>
            <p className="font-bold text-brand-dark">₹{product.price.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
