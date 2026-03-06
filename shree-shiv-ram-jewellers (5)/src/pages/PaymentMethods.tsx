import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Plus, 
  CreditCard, 
  ChevronDown, 
  ChevronUp, 
  Wallet, 
  Smartphone, 
  Building2,
  Flower2,
  CheckCircle2,
  Trash2,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Card {
  id: string;
  number: string;
  holder: string;
  expiry: string;
  type: 'VISA' | 'MASTERCARD';
}

export default function PaymentMethods() {
  const navigate = useNavigate();
  
  // State with LocalStorage Persistence
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('wallet_balance');
    return saved ? parseFloat(saved) : 1250.50;
  });

  const [upiIds, setUpiIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('upi_ids');
    return saved ? JSON.parse(saved) : ['pranay@okaxis'];
  });

  const [cards, setCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem('payment_cards');
    return saved ? JSON.parse(saved) : [
      { id: '1', number: '•••• •••• •••• 4582', holder: 'Heri Maguire', expiry: '08/24', type: 'VISA' }
    ];
  });

  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedUpi, setSelectedUpi] = useState<string | null>(upiIds[0] || null);
  
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isAddUpiOpen, setIsAddUpiOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  
  const [amountToAdd, setAmountToAdd] = useState('');
  const [newUpiId, setNewUpiId] = useState('');
  const [newCard, setNewCard] = useState({ number: '', holder: '', expiry: '' });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('wallet_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('upi_ids', JSON.stringify(upiIds));
  }, [upiIds]);

  useEffect(() => {
    localStorage.setItem('payment_cards', JSON.stringify(cards));
  }, [cards]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleAddMoney = () => {
    const amount = parseFloat(amountToAdd);
    if (!isNaN(amount) && amount > 0) {
      setBalance(prev => prev + amount);
      setIsAddMoneyOpen(false);
      setAmountToAdd('');
    }
  };

  const handleAddUpi = () => {
    if (newUpiId && newUpiId.includes('@')) {
      setUpiIds(prev => [...prev, newUpiId]);
      setSelectedUpi(newUpiId);
      setNewUpiId('');
      setIsAddUpiOpen(false);
    }
  };

  const handleDeleteUpi = (id: string) => {
    setUpiIds(prev => prev.filter(upi => upi !== id));
    if (selectedUpi === id) setSelectedUpi(null);
  };

  const handleAddCard = () => {
    if (newCard.number && newCard.holder && newCard.expiry) {
      const card: Card = {
        id: Date.now().toString(),
        number: `•••• •••• •••• ${newCard.number.slice(-4)}`,
        holder: newCard.holder,
        expiry: newCard.expiry,
        type: 'VISA'
      };
      setCards(prev => [...prev, card]);
      setNewCard({ number: '', holder: '', expiry: '' });
      setIsAddCardOpen(false);
    }
  };

  const handleDeleteCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F0F1F5] pb-24">
      {/* Header */}
      <div className="px-6 pt-6 flex flex-col items-center relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute left-6 top-8 p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-brand-dark" />
        </button>
        
        <div className="flex flex-col items-center mt-2">
          <Flower2 size={40} className="text-[#064E3B]" strokeWidth={1.5} />
          <h1 className="text-xl font-bold text-[#064E3B] mt-1">LuxeLoom</h1>
        </div>
      </div>

      <div className="px-6 mt-8 space-y-6">
        {/* Wallet Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#064E3B] rounded-[32px] p-8 text-white shadow-xl shadow-brand-green/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 opacity-80 mb-1">
              <Wallet size={16} />
              <span className="text-sm font-medium uppercase tracking-wider">Wallet Balance</span>
            </div>
            <div className="text-4xl font-bold mb-6">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            
            <button 
              onClick={() => setIsAddMoneyOpen(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Add Money
            </button>
          </div>
        </motion.div>

        {/* Cards List */}
        <div className="space-y-4">
          {cards.map((card) => (
            <motion.div 
              key={card.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-56 rounded-[32px] overflow-hidden shadow-lg group"
            >
              <img 
                src="https://images.unsplash.com/photo-1550565118-3a14e8d0386f?auto=format&fit=crop&q=80&w=800" 
                alt="Card Background" 
                className="absolute inset-0 w-full h-full object-cover brightness-[0.4]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#064E3B]/80 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <div className="flex gap-1.5">
                    <span className="text-lg font-mono tracking-widest">{card.number}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-black italic tracking-tighter">{card.type}</div>
                    <button 
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <div className="text-lg font-medium tracking-widest mb-1">{card.holder}</div>
                  <div className="flex justify-between items-end">
                    <div className="text-xs opacity-60 font-mono">
                      VALID THRU {card.expiry}
                    </div>
                    <div className="w-8 h-6 bg-white/20 rounded-md backdrop-blur-sm" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Payment Options List */}
        <div className="bg-white rounded-[32px] overflow-hidden shadow-sm">
          {/* Net Banking */}
          <div className="border-b border-gray-100">
            <button 
              onClick={() => toggleSection('netbanking')}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-cream flex items-center justify-center text-[#064E3B]">
                  <Building2 size={20} />
                </div>
                <div>
                  <span className="font-bold text-brand-dark text-lg block">Net Banking</span>
                  {selectedBank && <span className="text-xs text-brand-green font-medium">Selected: {selectedBank}</span>}
                </div>
              </div>
              {expandedSection === 'netbanking' ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            <AnimatePresence>
              {expandedSection === 'netbanking' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-gray-50/50 px-6 pb-6"
                >
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak', 'PNB'].map((bank) => (
                      <button 
                        key={bank} 
                        onClick={() => setSelectedBank(bank)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          selectedBank === bank 
                            ? 'bg-brand-green/5 border-brand-green text-brand-green' 
                            : 'bg-white border-gray-100 text-brand-dark'
                        }`}
                      >
                        <span className="font-medium text-sm">{bank}</span>
                        {selectedBank === bank && <CheckCircle2 size={14} />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* UPI */}
          <div>
            <button 
              onClick={() => toggleSection('upi')}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-cream flex items-center justify-center text-[#064E3B]">
                  <Smartphone size={20} />
                </div>
                <div>
                  <span className="font-bold text-brand-dark text-lg block">UPI</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">India's Real-time Payments System</span>
                </div>
              </div>
              {expandedSection === 'upi' ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            <AnimatePresence>
              {expandedSection === 'upi' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-gray-50/50 px-6 pb-6"
                >
                  <div className="space-y-3 pt-2">
                    {upiIds.map((upiId) => (
                      <div 
                        key={upiId}
                        onClick={() => setSelectedUpi(upiId)}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          selectedUpi === upiId 
                            ? 'bg-white border-brand-green/20' 
                            : 'bg-white/50 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            selectedUpi === upiId ? 'bg-brand-cream text-brand-green' : 'bg-gray-100 text-gray-400'
                          }`}>
                            <Smartphone size={16} />
                          </div>
                          <span className={`font-bold ${selectedUpi === upiId ? 'text-brand-dark' : 'text-gray-400'}`}>
                            {upiId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedUpi === upiId && <CheckCircle2 size={20} className="text-brand-green" />}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUpi(upiId);
                            }}
                            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => setIsAddUpiOpen(true)}
                      className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold text-sm hover:border-brand-green/20 hover:text-brand-green transition-all"
                    >
                      + Add New UPI ID
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => setIsAddCardOpen(true)}
          className="w-full bg-[#064E3B] text-white py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-brand-green/20 flex items-center justify-center gap-2 hover:bg-[#053e2f] transition-all"
        >
          <Plus size={20} />
          Add New Card
        </button>
      </div>

      {/* Add Money Modal */}
      <AnimatePresence>
        {isAddMoneyOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddMoneyOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-dark">Add Money to Wallet</h2>
                <button onClick={() => setIsAddMoneyOpen(false)} className="p-2 bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-brand-dark/40">₹</span>
                  <input 
                    type="number" 
                    placeholder="Enter Amount"
                    value={amountToAdd}
                    onChange={(e) => setAmountToAdd(e.target.value)}
                    className="w-full bg-brand-cream rounded-2xl py-5 pl-12 pr-6 text-2xl font-bold border-none focus:ring-2 focus:ring-brand-green/20 outline-none"
                  />
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {[100, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmountToAdd(amt.toString())}
                      className="flex-shrink-0 px-6 py-3 rounded-xl bg-brand-cream text-brand-dark font-bold hover:bg-brand-green hover:text-white transition-all"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleAddMoney}
                  className="w-full bg-brand-green text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-green/20 hover:bg-brand-green/90 transition-all"
                >
                  Proceed to Add
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add UPI Modal */}
      <AnimatePresence>
        {isAddUpiOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddUpiOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-dark">Add New UPI ID</h2>
                <button onClick={() => setIsAddUpiOpen(false)} className="p-2 bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">UPI ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. user@okaxis"
                    value={newUpiId}
                    onChange={(e) => setNewUpiId(e.target.value)}
                    className="w-full bg-brand-cream rounded-2xl py-4 px-6 text-lg font-bold border-none focus:ring-2 focus:ring-brand-green/20 outline-none"
                  />
                </div>

                <button 
                  onClick={handleAddUpi}
                  className="w-full bg-brand-green text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-green/20 hover:bg-brand-green/90 transition-all"
                >
                  Save UPI ID
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Card Modal */}
      <AnimatePresence>
        {isAddCardOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddCardOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-brand-dark">Add New Card</h2>
                <button onClick={() => setIsAddCardOpen(false)} className="p-2 bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Card Number</label>
                  <input 
                    type="text" 
                    maxLength={16}
                    placeholder="1234 5678 9012 3456"
                    value={newCard.number}
                    onChange={(e) => setNewCard({...newCard, number: e.target.value})}
                    className="w-full bg-brand-cream rounded-2xl py-4 px-6 text-lg font-bold border-none focus:ring-2 focus:ring-brand-green/20 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Card Holder Name</label>
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    value={newCard.holder}
                    onChange={(e) => setNewCard({...newCard, holder: e.target.value})}
                    className="w-full bg-brand-cream rounded-2xl py-4 px-6 text-lg font-bold border-none focus:ring-2 focus:ring-brand-green/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      maxLength={5}
                      value={newCard.expiry}
                      onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                      className="w-full bg-brand-cream rounded-2xl py-4 px-6 text-lg font-bold border-none focus:ring-2 focus:ring-brand-green/20 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">CVV</label>
                    <input 
                      type="password" 
                      placeholder="•••"
                      maxLength={3}
                      className="w-full bg-brand-cream rounded-2xl py-4 px-6 text-lg font-bold border-none focus:ring-2 focus:ring-brand-green/20 outline-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAddCard}
                  className="w-full mt-4 bg-brand-green text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-green/20 hover:bg-brand-green/90 transition-all"
                >
                  Save Card
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
