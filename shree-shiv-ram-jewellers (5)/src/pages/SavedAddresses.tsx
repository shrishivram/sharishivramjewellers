import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Plus, MapPin, Trash2, Home, Briefcase, User, Phone, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

export default function SavedAddresses() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'Home',
      name: 'Pranay Soni',
      phone: '+91 9876543210',
      street: '123, Luxury Lane, Diamond District',
      city: 'Mumbai',
      state: 'Maharashtra',
      zip: '400001',
      isDefault: true
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    type: 'Home',
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    isDefault: false
  });

  const handleAddAddress = () => {
    if (newAddress.name && newAddress.street) {
      const address: Address = {
        ...(newAddress as Address),
        id: Math.random().toString(36).substr(2, 9)
      };
      setAddresses([...addresses, address]);
      setIsModalOpen(false);
      setNewAddress({
        type: 'Home',
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        isDefault: false
      });
    }
  };

  const deleteAddress = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F0F1F5] pb-20">
      {/* Header */}
      <div className="px-6 py-6 flex items-center gap-4 sticky top-0 bg-[#F0F1F5]/80 backdrop-blur-md z-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-brand-dark" />
        </button>
        <h1 className="text-2xl font-bold text-brand-dark">Saved Addresses</h1>
      </div>

      <div className="px-6 space-y-4">
        {/* Add New Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-white rounded-[24px] p-6 flex items-center justify-center gap-3 border-2 border-dashed border-brand-green/20 hover:border-brand-green/40 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green group-hover:scale-110 transition-transform">
            <Plus size={24} />
          </div>
          <span className="font-bold text-brand-dark">Add New Address</span>
        </button>

        {/* Address List */}
        <div className="space-y-4">
          {addresses.map((address) => (
            <motion.div 
              key={address.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[32px] p-6 shadow-sm relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-cream flex items-center justify-center text-brand-green">
                    {address.type === 'Home' && <Home size={20} />}
                    {address.type === 'Work' && <Briefcase size={20} />}
                    {address.type === 'Other' && <MapPin size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-dark flex items-center gap-2">
                      {address.type}
                      {address.isDefault && (
                        <span className="text-[10px] bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>
                      )}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => deleteAddress(address.id)}
                  className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand-dark font-bold">
                  <User size={14} className="opacity-40" />
                  <span>{address.name}</span>
                </div>
                <div className="flex items-center gap-2 text-brand-dark/60 text-sm font-medium">
                  <Phone size={14} className="opacity-40" />
                  <span>{address.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-brand-dark/60 text-sm font-medium leading-relaxed">
                  <MapPin size={14} className="opacity-40 mt-1 flex-shrink-0" />
                  <span>{address.street}, {address.city}, {address.state} - {address.zip}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Address Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-brand-dark">New Address</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-brand-dark" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Type Selection */}
                <div className="flex gap-3">
                  {(['Home', 'Work', 'Other'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewAddress({ ...newAddress, type })}
                      className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
                        newAddress.type === type 
                        ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' 
                        : 'bg-brand-cream text-brand-dark/60 hover:bg-brand-cream/80'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    className="w-full bg-brand-cream rounded-2xl py-4 px-6 text-sm font-bold border-none focus:ring-2 focus:ring-brand-green/20 outline-none"
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone Number"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full bg-brand-cream rounded-2xl py-4 px-6 text-sm font-bold border-none focus:ring-2 focus:ring-brand-green/20 outline-none"
                  />
                  <textarea 
                    placeholder="Street Address"
                    rows={3}
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full bg-brand-cream rounded-2xl py-4 px-6 text-sm font-bold border-none focus:ring-2 focus:ring-brand-green/20 outline-none resize-none"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full bg-brand-cream rounded-2xl py-4 px-6 text-sm font-bold border-none focus:ring-2 focus:ring-brand-green/20 outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="Zip Code"
                      value={newAddress.zip}
                      onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                      className="w-full bg-brand-cream rounded-2xl py-4 px-6 text-sm font-bold border-none focus:ring-2 focus:ring-brand-green/20 outline-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAddAddress}
                  className="w-full bg-brand-green text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-green/20 hover:bg-brand-green/90 transition-all mt-4"
                >
                  Save Address
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
