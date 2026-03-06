import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { ChevronsRight } from 'lucide-react';

interface OnboardingProps {
  onFinish: () => void;
}

export default function Onboarding({ onFinish }: OnboardingProps) {
  const [isComplete, setIsComplete] = useState(false);
  const constraintsRef = useRef(null);
  const x = useMotionValue(0);
  
  // Transform x position to opacity and other properties if needed
  const opacity = useTransform(x, [0, 200], [1, 0]);
  const textOpacity = useTransform(x, [0, 100], [1, 0]);

  const bgImages = [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',
    'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=400&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
    'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80',
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&q=80',
    'https://images.unsplash.com/photo-1611085583191-a3b13b24424a?w=400&q=80',
    'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?w=400&q=80',
  ];

  const handleDragEnd = () => {
    const currentX = x.get();
    if (currentX > 200) {
      setIsComplete(true);
      setTimeout(onFinish, 400);
    } else {
      // Smooth snap back with spring
      animate(x, 0, {
        type: "spring",
        stiffness: 400,
        damping: 30
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden select-none">
      {/* Background Grid - Top half */}
      <div className="absolute top-[-5%] left-0 right-0 h-[60%] grid grid-cols-3 gap-4 p-6 opacity-[0.12] pointer-events-none rotate-[-5deg] scale-110">
        {bgImages.map((img, i) => (
          <div key={i} className="rounded-[2.5rem] overflow-hidden aspect-square shadow-sm">
            <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10 pt-10">
        {/* Tilted Card - Logo Visual */}
        <motion.div
          initial={{ y: 60, opacity: 0, rotate: -5 }}
          animate={{ y: 0, opacity: 1, rotate: -5 }}
          transition={{ duration: 1.2, type: "spring", damping: 18 }}
          className="w-[85%] max-w-[320px] aspect-square bg-[#FDFBF7] rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden border-[8px] border-white mb-16 relative flex items-center justify-center p-8"
        >
          {/* Logo Visual - Recreating the provided image accurately */}
          <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
            {/* Top Trishul Symbol */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="w-16 h-16 mb-1"
            >
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M50 10V80M50 10L35 30M50 10L65 30M30 45C30 45 35 35 50 35C65 35 70 45 70 45" stroke="#B8860B" strokeWidth="4" strokeLinecap="round" />
                <path d="M40 35C40 35 42 25 50 25C58 25 60 35 60 35" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </motion.div>
            
            {/* Shree Symbol */}
            <div className="relative mb-1">
              <span className="text-[#B8860B] font-serif text-[32px] font-bold leading-none">
                श्री
              </span>
              {/* Decorative curves around Shree */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 border-t-2 border-l-2 border-[#B8860B] rounded-tl-full opacity-40" />
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-6 border-t-2 border-r-2 border-[#B8860B] rounded-tr-full opacity-40" />
            </div>
            
            {/* Main Brand Name */}
            <div className="space-y-[-4px] mb-2">
              <h2 className="text-[#B8860B] font-serif text-[42px] font-bold leading-none tracking-tight">
                शिवराम
              </h2>
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-[#B8860B] font-serif text-[34px] font-bold leading-none">
                  ज्वेलर्स
                </h3>
                {/* Diamond Icon on the right */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2" className="mt-1">
                  <path d="M6 3h12l4 6-10 12L2 9z" />
                  <path d="M11 3L8 9l3 12" />
                  <path d="M13 3l3 6-3 12" />
                  <path d="M2 9h20" />
                </svg>
              </div>
            </div>
            
            {/* Decorative Line with Diamond */}
            <div className="flex items-center gap-2 w-full justify-center my-2 px-4">
              <div className="h-[1.5px] flex-1 bg-[#B8860B] opacity-40" />
              <div className="w-2.5 h-2.5 rotate-45 bg-[#B8860B]" />
              <div className="h-[1.5px] flex-1 bg-[#B8860B] opacity-40" />
            </div>
            
            {/* Tagline in Hindi */}
            <p className="text-[#B8860B] text-[12px] font-bold mt-1 leading-tight">
              पारंपारिकता और विश्वास<br />का प्रतीक
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#B8860B]/5 to-transparent pointer-events-none" />
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center space-y-4"
        >
          <h1 className="text-[34px] font-bold text-[#1A1A1A] leading-[1.1] tracking-tight">
            Shree Shivram<br />Jewellers
          </h1>
          <p className="text-[#666666] text-[16px] leading-relaxed max-w-[300px] mx-auto font-medium px-4">
            पारंपारिकता और विश्वास का प्रतीक।<br />
            Explore our timeless collection of exquisite jewelry.
          </p>
        </motion.div>

        {/* Pagination Dots */}
        <div className="flex items-center gap-2.5 mt-12">
          <div className="w-12 h-1.5 bg-[#2D463E] rounded-full" />
          <div className="w-2 h-2 bg-[#E5E5E5] rounded-full" />
          <div className="w-2 h-2 bg-[#E5E5E5] rounded-full" />
        </div>
      </div>

      {/* Footer / Slider Button */}
      <div className="px-8 pb-14">
        <motion.div 
          ref={constraintsRef}
          animate={isComplete ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.4 }}
          className="relative w-full bg-[#2D463E] h-[72px] rounded-full flex items-center p-2 overflow-hidden shadow-[0_20px_40px_-10px_rgba(45,70,62,0.3)]"
        >
          {/* Track Fill Animation */}
          <motion.div 
            style={{ 
              width: useTransform(x, (val) => val + 64),
              opacity: useTransform(x, [0, 240], [0.1, 0.6])
            }}
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-white/10 via-white/40 to-white/60 z-0 blur-md"
          />
          
          <motion.div 
            style={{ width: useTransform(x, (val) => val + 64) }}
            className="absolute left-0 top-0 bottom-0 bg-white/10 z-0"
          />

          {/* Background Text with Shimmer */}
          <div className="absolute inset-0 flex items-center justify-center pl-12 pointer-events-none">
            <motion.span 
              style={{ 
                opacity: textOpacity,
                x: useTransform(x, [0, 240], [0, 20])
              }}
              className="relative font-bold text-[18px] text-white/40 overflow-hidden"
            >
              Slide to Start
              {/* Shimmer Overlay */}
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
              />
            </motion.span>
          </div>

          {/* Draggable Handle */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 240 }}
            dragElastic={0.02}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            style={{ x }}
            whileDrag={{ scale: 1.1 }}
            animate={isComplete ? { x: 300, opacity: 0, scale: 2 } : {}}
            className="z-20 w-[56px] h-[56px] bg-white rounded-full flex items-center justify-center text-[#2D463E] shadow-[0_0_30px_rgba(255,255,255,0.5)] cursor-grab active:cursor-grabbing relative group"
          >
            {/* Pulsing Outer Ring */}
            <motion.div 
              animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute inset-[-8px] border border-white/30 rounded-full -z-10"
            />
            
            {/* Inner Glow Effect */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-white rounded-full blur-md -z-10"
            />
            
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ChevronsRight size={28} strokeWidth={2.5} />
            </motion.div>
          </motion.div>

          {/* Success State Text */}
          {isComplete && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="font-bold text-[22px] text-white tracking-[0.3em] drop-shadow-lg">WELCOME</span>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Bottom Indicator */}
      <div className="w-36 h-1.5 bg-[#E5E5E5] rounded-full mx-auto mb-4" />
    </div>
  );
}
