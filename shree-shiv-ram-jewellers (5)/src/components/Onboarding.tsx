import { motion, useMotionValue, useTransform } from 'motion/react';
import { ChevronsRight } from 'lucide-react';
import { useState } from 'react';

interface OnboardingProps {
  onFinish: () => void;
}

export default function Onboarding({ onFinish }: OnboardingProps) {
  const [isSwiped, setIsSwiped] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 200], [1, 0]);
  const dragLimit = 220; // How far the arrow needs to be dragged

  const handleDragEnd = () => {
    if (x.get() > dragLimit) {
      setIsSwiped(true);
      setTimeout(onFinish, 300);
    } else {
      x.set(0);
    }
  };

  const backgroundImages = [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80",
    "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=400&q=80",
    "https://images.unsplash.com/photo-1573408302185-9127fe589100?w=400&q=80",
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80",
    "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&q=80",
    "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80",
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80",
    "https://images.unsplash.com/photo-1598560912005-5976593c3075?w=400&q=80",
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8F9FB] flex flex-col items-center overflow-hidden">
      {/* Background Grid - More structured like the image */}
      <div className="absolute top-0 left-0 right-0 h-[40%] grid grid-cols-3 gap-3 p-4 opacity-40 pointer-events-none">
        {backgroundImages.map((src, i) => (
          <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-sm">
            <img src={src} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-32 px-8 text-center w-full max-w-lg mx-auto">
        {/* Featured Image Card - Centered and tilted like the image */}
        <motion.div
          initial={{ y: 60, opacity: 0, rotate: -5 }}
          animate={{ y: 0, opacity: 1, rotate: -3 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[320px] aspect-[1/1] bg-white rounded-[48px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden mb-12 border-[10px] border-white relative"
        >
          <img 
            src="https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?w=800&q=80" 
            alt="Featured Jewelry" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-10"
        >
          <h1 className="text-[34px] font-bold text-[#1A1A1A] leading-[1.2] mb-4">
            Begin Your Jewel<br />Journey
          </h1>
          <p className="text-[#666666] text-[16px] leading-relaxed max-w-[280px] mx-auto">
            Explore luxury at your fingertips. offers curated collections of exquisite jewelry.
          </p>
        </motion.div>

        {/* Pagination Dots - Pill style for active */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-1.5 bg-[#2D4A4A] rounded-full" />
          <div className="w-2 h-2 bg-[#E5E5E5] rounded-full" />
          <div className="w-2 h-2 bg-[#E5E5E5] rounded-full" />
        </div>

        {/* Swipe to Start Button - Deep Forest Green */}
        <div className="w-full max-w-[340px] h-[76px] bg-[#2D4A4A] rounded-full relative p-2 flex items-center shadow-lg">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: dragLimit }}
            dragElastic={0.05}
            onDragEnd={handleDragEnd}
            style={{ x }}
            className="w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing z-20"
          >
            <ChevronsRight className="text-[#2D4A4A]" size={28} />
          </motion.div>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.span 
              style={{ opacity }}
              className="text-white font-medium text-[18px] ml-12"
            >
              Get Started
            </motion.span>
          </div>

          {/* Success State Overlay */}
          {isSwiped && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white rounded-full z-30 flex items-center justify-center"
            >
              <div className="w-6 h-6 border-2 border-[#2D4A4A] border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Home Indicator */}
      <div className="h-1.5 w-32 bg-[#1A1A1A] rounded-full mb-4 opacity-20" />
    </div>
  );
}
