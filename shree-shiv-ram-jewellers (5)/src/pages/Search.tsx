import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, ArrowLeft, X, Heart, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../context/CartContext';

export default function Search() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          setProducts(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const addToRecentSearches = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const filtered = recentSearches.filter(s => s !== searchTerm);
    const updated = [searchTerm, ...filtered].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.description.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query, products]);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Search Header */}
      <div className="sticky top-0 z-50 bg-white px-6 py-4 flex items-center gap-4 border-b border-brand-dark/5">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-brand-cream rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-dark/40" size={20} />
          <input
            autoFocus
            type="text"
            placeholder="Search for jewellery..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                addToRecentSearches(query);
              }
            }}
            className="w-full pl-12 pr-12 py-3 bg-brand-cream border-none rounded-2xl focus:ring-2 focus:ring-brand-green transition-all"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-dark"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="px-6 py-8">
        {query.trim() === '' ? (
          <div className="space-y-8">
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider">Recent Searches</h3>
                  <button 
                    onClick={clearRecentSearches}
                    className="text-xs font-medium text-brand-green hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setQuery(s);
                        addToRecentSearches(s);
                      }}
                      className="px-4 py-2 bg-brand-cream rounded-full text-sm font-medium hover:bg-brand-green hover:text-white transition-all flex items-center gap-2"
                    >
                      <SearchIcon size={14} className="opacity-40" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center py-10">
              <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-4 text-brand-dark/20">
                <SearchIcon size={40} />
              </div>
              <h2 className="text-xl font-serif text-brand-dark/60">Type to search for products</h2>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {['Necklace', 'Ring', 'Diamond', 'Gold', 'Earrings'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => {
                      setQuery(tag);
                      addToRecentSearches(tag);
                    }}
                    className="px-4 py-2 bg-brand-cream rounded-full text-sm font-medium hover:bg-brand-green hover:text-white transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8">
            <AnimatePresence>
              {results.map((product) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group cursor-pointer"
                  onClick={() => {
                    addToRecentSearches(query);
                    navigate(`/product/${product.id}`);
                  }}
                >
                  <div className="aspect-[4/5] bg-brand-cream rounded-3xl overflow-hidden relative mb-3">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-colors ${isInWishlist(product.id) ? 'bg-brand-green text-white' : 'bg-white text-brand-green hover:bg-brand-green hover:text-white'}`}
                    >
                      <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <h3 className="font-bold text-sm text-brand-dark mb-1 truncate">{product.name}</h3>
                  <p className="font-bold text-brand-dark mb-3">₹{product.price.toLocaleString()}</p>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full py-2 bg-brand-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-brand-green transition-colors"
                  >
                    <ShoppingBag size={14} /> Add to Cart
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-brand-dark/40">No products found for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
