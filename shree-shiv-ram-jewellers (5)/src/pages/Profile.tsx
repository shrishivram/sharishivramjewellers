import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  LayoutGrid, 
  Heart, 
  Gift, 
  PlusCircle, 
  CreditCard, 
  Bell, 
  Headphones, 
  ChevronRight,
  Flower2,
  Camera,
  X,
  Check,
  Mail,
  Phone,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useState, useRef, ChangeEvent } from 'react';
import { AnimatePresence } from 'motion/react';

export default function Profile() {
  const { user, logout, updateUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDealsModalOpen, setIsDealsModalOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: '',
    description: '',
    discount: '',
    image: '',
    expiryDate: ''
  });
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedPhone, setEditedPhone] = useState(user?.phone || '');
  const [editedAadhar, setEditedAadhar] = useState(user?.aadharNumber || '');
  const [editedAvatar, setEditedAvatar] = useState(user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" />;

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim() || !editedPhone.trim() || !editedAadhar.trim()) {
      return;
    }
    setIsSaving(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateUser({ 
      name: editedName, 
      phone: editedPhone, 
      aadharNumber: editedAadhar, 
      avatar: editedAvatar 
    });
    setIsSaving(false);
    setIsEditModalOpen(false);
  };

  const menuItems: any[] = [
    { icon: LayoutGrid, label: 'Orders', path: '/orders' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: Gift, label: 'Gift Cards', path: '#' },
    { icon: PlusCircle, label: 'Saved Addresses', path: '/saved-addresses' },
    { icon: CreditCard, label: 'Payment Methods', path: '/payment-methods' },
    { icon: Bell, label: 'Notifications', isToggle: true },
    { icon: Headphones, label: 'Help & Support', path: '/help-support' },
  ];

  const handleAddDeal = async () => {
    if (!newDeal.title || !newDeal.discount || !newDeal.image) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeal)
      });
      if (res.ok) {
        setIsDealsModalOpen(false);
        setNewDeal({ title: '', description: '', discount: '', image: '', expiryDate: '' });
      }
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F1F5] pb-32">
      {/* Header */}
      <div className="px-6 pt-6 flex flex-col items-center relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute left-6 top-8 p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-brand-dark" />
        </button>
        
        <div className="flex flex-col items-center mt-2">
          <Flower2 size={48} className="text-[#064E3B]" strokeWidth={1.5} />
          <h1 className="text-2xl font-bold text-[#064E3B] mt-1">LuxeLoom</h1>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-6 mt-10 flex items-center gap-6">
        <div className="relative">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-sm">
            <img 
              src={user.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200"} 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-brand-dark">Hi, {user.name}</h2>
          <div className="flex flex-wrap gap-3 mt-3">
            <button 
              onClick={() => {
                setEditedName(user.name);
                setEditedPhone(user.phone || '');
                setEditedAadhar(user.aadharNumber || '');
                setEditedAvatar(user.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200");
                setIsEditModalOpen(true);
              }}
              className="px-8 py-2.5 bg-[#064E3B] text-white rounded-full font-bold text-sm shadow-md hover:bg-[#053e2f] transition-colors"
            >
              Edit Profile
            </button>
            {['admin', 'super_admin', 'moderator'].includes(user.role || '') && (
              <button 
                onClick={() => navigate('/admin')}
                className="px-8 py-2.5 bg-brand-cream text-brand-dark rounded-full font-bold text-sm shadow-md hover:bg-brand-cream/80 transition-colors flex items-center gap-2"
              >
                <Shield size={16} />
                Admin Panel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu Card */}
      <div className="px-6 mt-10">
        <div className="bg-white rounded-[32px] overflow-hidden shadow-sm">
          {menuItems.map((item, idx) => (
            <div key={idx}>
              <div 
                className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={() => {
                  if (item.onClick) item.onClick();
                  else if (!item.isToggle && item.path) navigate(item.path);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-[#064E3B]">
                    <item.icon size={24} strokeWidth={1.5} />
                  </div>
                  <span className="font-bold text-brand-dark text-[17px]">{item.label}</span>
                </div>
                
                {item.isToggle ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotificationsEnabled(!notificationsEnabled);
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-[#064E3B]' : 'bg-gray-300'}`}
                  >
                    <motion.div 
                      animate={{ x: notificationsEnabled ? 26 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                ) : (
                  <ChevronRight size={20} className="text-brand-dark/20 group-hover:text-brand-dark/40 transition-colors" />
                )}
              </div>
              {idx < menuItems.length - 1 && (
                <div className="mx-5 border-b border-gray-100" />
              )}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <button 
          onClick={logout}
          className="w-full mt-8 py-4 text-red-500 font-bold text-lg hover:bg-red-50 rounded-2xl transition-colors flex items-center justify-center gap-2"
        >
          Logout
        </button>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-8 relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>

              <div className="flex flex-col items-center">
                <h3 className="text-xl font-bold text-brand-dark mb-8">Edit Profile</h3>
                
                {/* Avatar Upload */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-brand-cream shadow-sm">
                    <img 
                      src={editedAvatar} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-brand-green text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-brand-dark transition-colors"
                  >
                    <Camera size={16} />
                  </button>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Form */}
                <div className="w-full space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-brand-green/20 outline-none"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Mobile Number</label>
                    <div className="relative">
                      <input 
                        type="tel"
                        value={editedPhone}
                        onChange={(e) => setEditedPhone(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-brand-green/20 outline-none"
                        placeholder="Enter mobile number"
                        required
                      />
                      <Phone size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Aadhar Number</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={editedAadhar}
                        onChange={(e) => setEditedAadhar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-brand-green/20 outline-none"
                        placeholder="12-digit Aadhar number"
                        required
                      />
                      <CreditCard size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-medium text-gray-400 cursor-not-allowed outline-none"
                      />
                      <Mail size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" />
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving || !editedName.trim() || !editedPhone.trim() || !editedAadhar.trim() || editedAadhar.length < 12}
                    className="w-full py-4 bg-brand-green text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-green/20 hover:bg-brand-dark transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check size={20} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Deals Modal */}
      <AnimatePresence>
        {isDealsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDealsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-8 relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setIsDealsModalOpen(false)}
                className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>

              <div className="flex flex-col items-center">
                <h3 className="text-xl font-bold text-brand-dark mb-8">Add New Deal</h3>
                
                <div className="w-full space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Deal Title</label>
                    <input 
                      type="text"
                      value={newDeal.title}
                      onChange={(e) => setNewDeal({...newDeal, title: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 font-medium outline-none"
                      placeholder="e.g. Summer Sale"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Discount</label>
                    <input 
                      type="text"
                      value={newDeal.discount}
                      onChange={(e) => setNewDeal({...newDeal, discount: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 font-medium outline-none"
                      placeholder="e.g. 20% OFF"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Image URL</label>
                    <input 
                      type="text"
                      value={newDeal.image}
                      onChange={(e) => setNewDeal({...newDeal, image: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 font-medium outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Expiry Date</label>
                    <input 
                      type="date"
                      value={newDeal.expiryDate}
                      onChange={(e) => setNewDeal({...newDeal, expiryDate: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 font-medium outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Description</label>
                    <textarea 
                      value={newDeal.description}
                      onChange={(e) => setNewDeal({...newDeal, description: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 font-medium outline-none h-20 resize-none"
                      placeholder="Deal details..."
                    />
                  </div>

                  <button 
                    onClick={handleAddDeal}
                    disabled={isSaving || !newDeal.title || !newDeal.discount}
                    className="w-full py-4 bg-brand-green text-white rounded-2xl font-bold flex items-center justify-center gap-2 mt-4 shadow-lg shadow-brand-green/20 hover:bg-brand-dark transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <PlusCircle size={20} />
                        Add Deal
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
