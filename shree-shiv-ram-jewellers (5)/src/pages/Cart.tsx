import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Minus, Plus, Trash2, ChevronLeft, MoreHorizontal, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const shipping = 10.00;
  const subTotal = total;
  const grandTotal = subTotal + shipping;

  const handlePayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          items,
          total: grandTotal,
          shippingAddress: 'Default Address', // In a real app, this would be selected
          paymentMethod: 'Online'
        })
      });

      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          clearCart();
          navigate('/orders');
        }, 3000);
      }
    } catch (e) {
      console.error(e);
    }
    setIsProcessing(false);
  };

  return (
    <div className="pb-32 pt-6 px-6 max-w-2xl mx-auto bg-brand-cream min-h-screen relative">
      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-brand-green flex flex-col items-center justify-center text-white p-10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-8"
            >
              <CheckCircle2 size={48} />
            </motion.div>
            <h2 className="text-3xl font-bold mb-4">Payment Successful!</h2>
            <p className="text-white/80 font-medium">Your order has been placed successfully. Redirecting you to your orders...</p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold font-sans">My Cart</h1>
        <button className="p-2 hover:bg-white rounded-full transition-colors">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-brand-green">
            <ShoppingBag size={40} />
          </div>
          <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-brand-dark/40 mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/" className="bg-brand-green text-white px-8 py-3 rounded-full font-bold">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="relative group"
              >
                {/* Delete Background (Revealed on swipe/drag) */}
                <div className="absolute inset-0 bg-brand-green rounded-[32px] flex justify-end items-center px-8 text-white">
                  <Trash2 size={24} />
                </div>

                {/* Main Card Content */}
                <motion.div 
                  drag="x"
                  dragConstraints={{ left: -100, right: 0 }}
                  dragElastic={0.1}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) {
                      removeFromCart(item.id);
                    }
                  }}
                  className="relative flex gap-4 bg-white p-4 rounded-[32px] shadow-sm z-10 touch-pan-y"
                >
                  <div className="w-24 h-24 bg-brand-cream rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-contain" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-brand-dark mb-1">{item.name}</h3>
                    <p className="text-brand-green font-bold text-lg mb-1">₹{item.price.toLocaleString()}</p>
                    <p className="text-brand-dark/40 text-xs font-medium">Premium, collection</p>
                  </div>

                  <div className="flex flex-col items-center justify-between py-1 px-1 bg-brand-cream/50 rounded-2xl">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 bg-white rounded-full shadow-sm text-brand-dark hover:text-brand-green transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                    <span className="font-bold text-sm py-1">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 bg-white rounded-full shadow-sm text-brand-dark hover:text-brand-green transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Promo Section */}
          <div className="flex justify-between items-center bg-white p-5 rounded-[24px] shadow-sm mt-8">
            <span className="text-brand-dark/60 font-medium">Promo/Student code or vouchers</span>
            <button className="p-2 bg-brand-cream rounded-full text-brand-dark">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Summary Section */}
          <div className="space-y-4 pt-4 px-2">
            <div className="flex justify-between items-center">
              <span className="text-brand-dark/40 font-medium">Sub Total</span>
              <span className="font-bold text-brand-dark">₹{subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-dark/40 font-medium">Shipping</span>
              <span className="font-bold text-brand-dark">₹{shipping.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-brand-green text-white py-5 rounded-[24px] font-bold text-lg shadow-lg shadow-brand-green/20 hover:bg-brand-green/90 transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Make Payment</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
