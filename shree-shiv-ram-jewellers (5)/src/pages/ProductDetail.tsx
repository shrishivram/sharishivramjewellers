import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Heart, ShoppingBag, Share2, Plus, Minus, CheckCircle2, Star, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../hooks/useWishlist';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Failed to fetch product');
      }
      const data = await res.json();
      setProduct(data);
      
      // Fetch related products separately
      const allRes = await fetch('/api/products');
      if (allRes.ok && allRes.headers.get('content-type')?.includes('application/json')) {
        const allProducts = await allRes.json();
        const related = allProducts.filter((item: Product) => 
          item.category_id === data.category_id && item.id !== data.id
        ).slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (e) {
      console.error('Failed to fetch product details:', e);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    triggerToast(`Added ${quantity} item(s) to cart!`, 'success');
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate('/cart');
  };

  const handleToggleWishlist = () => {
    if (!product) return;
    const isAdding = !isInWishlist(product.id);
    toggleWishlist(product.id);
    triggerToast(isAdding ? 'Added to wishlist!' : 'Removed from wishlist', 'info');
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        triggerToast('Link copied to clipboard!', 'info');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!product || !newReview.comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userName: "Guest User", // In a real app, this would be the logged-in user's name
          rating: newReview.rating,
          comment: newReview.comment,
        }),
      });

      if (response.ok) {
        setNewReview({ rating: 5, comment: '' });
        fetchProduct();
        triggerToast('Review submitted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const triggerToast = (message: string, type: 'success' | 'info') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  if (!product) return null;

  const sizes = ['6', '7', '8', '9', '10'];
  const averageRating = product.reviews?.length 
    ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-white pb-40">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
          >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              showToast.type === 'success' ? 'bg-brand-green/90 border-brand-green/20 text-white' : 'bg-brand-dark/90 border-brand-dark/20 text-white'
            }`}>
              <CheckCircle2 size={20} />
              <p className="font-bold text-sm">{showToast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Actions */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-brand-dark hover:bg-white transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleShare}
            className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-brand-dark hover:bg-white transition-all"
          >
            <Share2 size={20} />
          </button>
          <button 
            onClick={handleToggleWishlist}
            className={`p-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm transition-all ${isInWishlist(product.id) ? 'text-red-500' : 'text-brand-dark'}`}
          >
            <Heart size={20} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Product Image Section */}
      <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-gray-400 to-gray-600 overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Product Info Card */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, type: "spring", damping: 25 }}
        className="relative -mt-12 bg-white rounded-t-[48px] p-8 min-h-[50vh] shadow-2xl"
      >
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1 pr-4">
            <h1 className="text-2xl font-bold text-brand-dark leading-tight mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-xs font-bold text-brand-dark/40">{averageRating} ({product.reviews?.length || 0} reviews)</span>
            </div>
            <p className="text-brand-dark/40 text-sm font-medium uppercase tracking-wider">
              Premium Collection
            </p>
          </div>
          <div className="bg-white border border-brand-dark/5 px-4 py-2 rounded-2xl">
            <span className="text-brand-green font-bold text-lg">
              ₹{product.price.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quantity and Size Selection */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-dark uppercase tracking-widest">Quantity</h3>
              <div className="flex items-center gap-6 bg-white border border-brand-dark/5 rounded-2xl px-4 py-2">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 text-brand-dark hover:text-brand-green transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="font-bold text-lg w-4 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 text-brand-dark hover:text-brand-green transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {product.name.toLowerCase().includes('ring') && (
              <div>
                <h3 className="text-sm font-bold text-brand-dark mb-4 uppercase tracking-widest">Select Size</h3>
                <div className="flex gap-3">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all border-2 ${
                        selectedSize === size 
                          ? 'bg-brand-green border-brand-green text-white shadow-lg shadow-brand-green/20' 
                          : 'bg-white border-brand-dark/5 text-brand-dark hover:border-brand-green/30'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-brand-dark mb-3 uppercase tracking-widest">Description</h3>
            <p className="text-brand-dark/60 leading-relaxed mb-6">
              {product.description || "Our simple gemstone stacker is sweet on its own or in multiples for a unique stack. Whether you choose to wear it daily or for special occasions, this piece adds a touch of timeless elegance to your look."}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex gap-4">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-brand-green text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-brand-green/20 hover:bg-brand-green/90 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} /> Add to Cart
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="flex-1 bg-brand-dark text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-brand-dark/20 hover:bg-brand-dark/90 transition-all flex items-center justify-center gap-2"
                >
                  Buy Now
                </button>
              </div>
              <button 
                onClick={handleShare}
                className="w-full bg-white border border-brand-dark/10 text-brand-dark py-4 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={18} /> Share Product
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-brand-dark/5 rounded-[32px]">
              <p className="text-[10px] text-brand-dark/40 uppercase font-bold mb-1">Material</p>
              <p className="font-bold text-sm">{product.material || '18K Gold'}</p>
            </div>
            <div className="p-5 bg-white border border-brand-dark/5 rounded-[32px]">
              <p className="text-[10px] text-brand-dark/40 uppercase font-bold mb-1">Weight</p>
              <p className="font-bold text-sm">{product.weight || '4.5 Grams'}</p>
            </div>
          </div>

          {(product as any).purity && (
            <div className="p-5 bg-white border border-brand-dark/5 rounded-[32px]">
              <p className="text-[10px] text-brand-dark/40 uppercase font-bold mb-1">Purity</p>
              <p className="font-bold text-sm">{(product as any).purity}</p>
            </div>
          )}

          {/* Reviews Section */}
          <div className="pt-8 border-t border-brand-dark/5">
            <h3 className="text-sm font-bold text-brand-dark mb-6 uppercase tracking-widest">Customer Reviews</h3>
            
            {/* Add Review Form */}
            <form onSubmit={handleSubmitReview} className="mb-10 bg-white border border-brand-dark/5 p-6 rounded-[32px]">
              <p className="text-xs font-bold text-brand-dark mb-4 uppercase tracking-wider">Write a Review</p>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className={`transition-colors ${star <= newReview.rating ? 'text-yellow-500' : 'text-brand-dark/20'}`}
                  >
                    <Star size={24} fill={star <= newReview.rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Share your thoughts about this product..."
                className="w-full bg-white border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-green transition-all min-h-[100px] mb-4"
                required
              />
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full py-3 bg-brand-dark text-white rounded-xl text-sm font-bold hover:bg-brand-green transition-colors disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>

            {/* Reviews List */}
            <div className="space-y-6">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-brand-dark/5 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-dark/5 rounded-full flex items-center justify-center text-brand-dark/40">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-dark">{review.user_name}</p>
                          <div className="flex items-center text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-brand-dark/40 font-medium">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-brand-dark/60 leading-relaxed pl-11">
                      {review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-white border border-brand-dark/5 rounded-[32px]">
                  <p className="text-sm text-brand-dark/40 italic">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="pt-12 border-t border-brand-dark/5">
              <h3 className="text-sm font-bold text-brand-dark mb-6 uppercase tracking-widest">Related Products</h3>
              <div className="grid grid-cols-2 gap-4">
                {relatedProducts.map((item) => (
                  <motion.div
                    key={item.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      navigate(`/product/${item.id}`);
                      window.scrollTo(0, 0);
                    }}
                    className="bg-white border border-brand-dark/5 rounded-[32px] overflow-hidden group cursor-pointer"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-sm text-brand-dark truncate">{item.name}</h4>
                      <p className="text-brand-green font-bold text-xs mt-1">₹{item.price.toLocaleString()}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => navigate(`/category/${product.category_id}`)}
                  className="px-8 py-3 bg-white text-brand-dark rounded-2xl font-bold text-sm hover:bg-brand-green hover:text-white transition-all border border-brand-dark/10"
                >
                  View More Products
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
