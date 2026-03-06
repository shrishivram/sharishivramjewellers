import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Search, ChevronLeft, Star, X } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Category, Product } from '../types';

export default function Wishlist() {
  const { user, isLoading } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" />;

  const filteredWishlist = wishlist.filter(item => {
    const matchesCategory = selectedCategory === 'All' || (() => {
      const category = categories.find(c => c.id === item.category_id);
      return category?.name === selectedCategory;
    })();
    
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-brand-cream pb-32">
      {/* Header */}
      <div className="px-6 py-6 bg-white/50 backdrop-blur-md sticky top-0 z-50 h-[88px] flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          {!isSearchOpen ? (
            <motion.div 
              key="header-default"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex justify-between items-center w-full"
            >
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-brand-dark/5 rounded-full transition-colors"
              >
                <ChevronLeft size={24} className="text-brand-dark" />
              </button>
              <h1 className="text-2xl font-bold text-brand-dark">Wishlist</h1>
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-brand-dark/5 rounded-full transition-colors"
              >
                <Search size={24} className="text-brand-dark" />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="header-search"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              className="flex items-center w-full gap-3"
            >
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in wishlist..."
                  className="w-full bg-white border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand-green/20 outline-none shadow-sm"
                />
              </div>
              <button 
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-2 bg-brand-dark/5 rounded-full text-brand-dark hover:bg-brand-dark/10 transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Filters */}
      <div className="px-6 py-4 overflow-x-auto no-scrollbar flex gap-3">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
            selectedCategory === 'All' 
              ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' 
              : 'bg-white text-brand-dark/40 hover:bg-white/80'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.name)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              selectedCategory === category.name 
                ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' 
                : 'bg-white text-brand-dark/40 hover:bg-white/80'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="px-6 mt-4">
        {wishlist.length === 0 ? (
          <div className="text-center py-24 bg-white/50 rounded-[48px] backdrop-blur-sm">
            <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4 text-brand-dark/20">
              <Heart size={40} />
            </div>
            <h2 className="text-xl font-bold text-brand-dark mb-2">Your wishlist is empty</h2>
            <p className="text-brand-dark/40 text-sm">Save items you love to find them later.</p>
            <Link 
              to="/" 
              className="inline-block mt-6 px-8 py-3 bg-brand-dark text-white rounded-xl font-bold text-sm hover:bg-brand-green transition-colors"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredWishlist.map((product) => (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-[32px] p-3 shadow-sm group relative"
                >
                  <Link to={`/product/${product.id}`}>
                    <div className="aspect-square rounded-[24px] overflow-hidden bg-brand-cream mb-3 relative">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                    <div className="px-1">
                      <h3 className="font-bold text-brand-dark text-sm mb-1 line-clamp-2 leading-tight h-10">
                        {product.name}
                      </h3>
                      <p className="text-brand-green font-bold text-sm">
                        ₹{product.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-5 right-5 p-2 bg-white/90 backdrop-blur-md rounded-full text-brand-green shadow-sm hover:bg-white transition-all z-10"
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Empty State for Filter */}
      {wishlist.length > 0 && filteredWishlist.length === 0 && (
        <div className="text-center py-20">
          <p className="text-brand-dark/40 font-medium italic">No items found in this category.</p>
        </div>
      )}
    </div>
  );
}
