import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ShoppingBag, Heart } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Product, Category } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useWishlist';

export default function CategoryProducts() {
  const { id } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);

        if (prodRes.ok && prodRes.headers.get('content-type')?.includes('application/json')) {
          const allProducts = await prodRes.json();
          const filtered = allProducts.filter((p: Product) => p.category_id === Number(id));
          setProducts(filtered);
        }

        if (catRes.ok && catRes.headers.get('content-type')?.includes('application/json')) {
          const categories = await catRes.json();
          const cat = categories.find((c: Category) => c.id === Number(id));
          setCategory(cat);
        }
      } catch (err) {
        console.error('Failed to fetch category products:', err);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white px-6 py-4 flex justify-between items-center border-b border-brand-dark/5">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-brand-cream rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold font-sans">{category?.name || 'Products'}</h1>
        <button onClick={() => navigate('/cart')} className="p-2 hover:bg-brand-cream rounded-full relative">
          <ShoppingBag size={24} />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 bg-brand-green text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Trending Label */}
      <div className="px-6 py-6">
        <h2 className="text-2xl font-serif mb-2">Trending {category?.name}</h2>
        <p className="text-brand-dark/40 text-sm">Discover our most popular {category?.name?.toLowerCase()} sets.</p>
      </div>

      {/* Product Grid */}
      <div className="px-6 grid grid-cols-2 gap-x-4 gap-y-8">
        {products.map((product) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group cursor-pointer"
            onClick={() => navigate(`/product/${product.id}`)}
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
      </div>
    </div>
  );
}
