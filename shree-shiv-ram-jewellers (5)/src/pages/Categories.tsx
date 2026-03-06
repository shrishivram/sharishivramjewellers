import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Category } from '../types';
import { useCart } from '../context/CartContext';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          setCategories(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const gradients = [
    'from-[#1A1A1A] to-[#333333]',
    'from-[#1E3A8A] to-[#3B82F6]',
    'from-[#064E3B] to-[#10B981]',
    'from-[#1A1A1A] to-[#2D2D2D]'
  ];

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-brand-cream rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold font-sans">Categories</h1>
        <button onClick={() => navigate('/cart')} className="p-2 hover:bg-brand-cream rounded-full relative">
          <ShoppingBag size={24} />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 bg-brand-green text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Cards */}
      <div className="px-6 space-y-6 mt-4">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(`/category/${cat.id}`)}
            className={`relative h-48 rounded-[32px] overflow-hidden cursor-pointer bg-gradient-to-r ${gradients[index % gradients.length]} p-8 flex justify-between items-center group shadow-xl`}
          >
            <div className="z-10">
              <p className="text-white/60 text-sm font-medium mb-1">
                Luxe Collection
              </p>
              <h2 className="text-white text-2xl font-bold">
                {cat.name}
              </h2>
            </div>
            
            <div className="relative w-40 h-40 flex items-center justify-center">
              <motion.img 
                whileHover={{ scale: 1.1, rotate: 5 }}
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-contain drop-shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
