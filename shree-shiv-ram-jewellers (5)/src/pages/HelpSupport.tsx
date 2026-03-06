import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Search, 
  MessageSquare, 
  Phone, 
  Mail, 
  ChevronRight,
  Send,
  CheckCircle2,
  Flower2,
  HelpCircle,
  X,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    category: "Orders",
    question: "How do I track my order?",
    answer: "You can track your order in the 'My Orders' section of your profile. Once an order is shipped, you'll receive a tracking number."
  },
  {
    category: "Returns",
    question: "What is the return policy?",
    answer: "We offer a 30-day return policy for all unworn and unwashed items with original tags attached."
  },
  {
    category: "Shipping",
    question: "How can I change my shipping address?",
    answer: "You can update your address in the 'Saved Addresses' section before the order is processed for shipping."
  },
  {
    category: "Shipping",
    question: "Do you offer international shipping?",
    answer: "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location."
  },
  {
    category: "Payments",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, UPI, Net Banking, and popular digital wallets."
  }
];

export default function HelpSupport() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [problem, setProblem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactType, setContactType] = useState<'call' | 'email' | null>(null);
  const [contactInput, setContactInput] = useState('');
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [isContactSubmitted, setIsContactSubmitted] = useState(false);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) return;

    setIsContactSubmitting(true);
    setTimeout(() => {
      setIsContactSubmitting(false);
      setIsContactSubmitted(true);
      setTimeout(() => {
        setShowContactModal(false);
        setIsContactSubmitted(false);
        setContactInput('');
      }, 2000);
    }, 1500);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setProblem('');
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F0F1F5] pb-20">
      {/* Header */}
      <div className="px-6 pt-6 flex flex-col items-center relative bg-white pb-8 rounded-b-[40px] shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="absolute left-6 top-8 p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-brand-dark" />
        </button>
        
        <div className="flex flex-col items-center mt-2">
          <Flower2 size={40} className="text-[#064E3B]" strokeWidth={1.5} />
          <h1 className="text-xl font-bold text-[#064E3B] mt-1">Help & Support</h1>
        </div>

        <div className="w-full mt-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F0F1F5] rounded-2xl py-4 pl-12 pr-12 font-medium border-none focus:ring-2 focus:ring-brand-green/20 outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded-full text-gray-400"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 mt-8 space-y-8">
        {/* Contact Options */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => {
              setContactType('call');
              setShowContactModal(true);
            }}
            className="bg-white p-6 rounded-[32px] flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-cream flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all">
              <Phone size={24} />
            </div>
            <span className="font-bold text-brand-dark">Call Us</span>
          </button>
          <button 
            onClick={() => {
              setContactType('email');
              setShowContactModal(true);
            }}
            className="bg-white p-6 rounded-[32px] flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-cream flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all">
              <Mail size={24} />
            </div>
            <span className="font-bold text-brand-dark">Email Us</span>
          </button>
        </div>

        {/* Support Request Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#064E3B] rounded-[40px] p-8 text-white shadow-xl shadow-brand-green/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <MessageSquare size={20} />
              </div>
              <h2 className="text-xl font-bold">Customer Support Request</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest">Describe your problem</label>
                <textarea 
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="How can we help you today?"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 min-h-[120px] text-white placeholder:text-white/40 focus:ring-2 focus:ring-white/30 outline-none resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !problem.trim()}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isSubmitted 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white text-brand-green hover:bg-brand-cream'
                } disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
                ) : isSubmitted ? (
                  <>
                    <CheckCircle2 size={20} />
                    Request Sent!
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Request
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* FAQs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <HelpCircle size={20} className="text-brand-green" />
            <h2 className="text-lg font-bold text-brand-dark">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-[24px] overflow-hidden shadow-sm"
                >
                  <button 
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex flex-col gap-1 pr-4">
                      <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider">{faq.category}</span>
                      <span className="font-bold text-brand-dark">{faq.question}</span>
                    </div>
                    <ChevronRight 
                      size={20} 
                      className={`text-gray-400 transition-transform shrink-0 ${expandedFaq === index ? 'rotate-90' : ''}`} 
                    />
                  </button>
                  <AnimatePresence>
                    {expandedFaq === index && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-5"
                      >
                        <p className="text-gray-500 text-sm leading-relaxed mb-4">
                          {faq.answer}
                        </p>
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[11px] text-gray-400 font-medium">Was this helpful?</span>
                          <div className="flex items-center gap-3">
                            <button className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-brand-green transition-colors">
                              <ThumbsUp size={14} />
                              Yes
                            </button>
                            <button className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors">
                              <ThumbsDown size={14} />
                              No
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 font-medium">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-8 relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setShowContactModal(false)}
                className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-brand-cream flex items-center justify-center text-brand-green mb-4">
                  {contactType === 'call' ? <Phone size={32} /> : <Mail size={32} />}
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">
                  {contactType === 'call' ? 'Request a Callback' : 'Email Support'}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  {contactType === 'call' 
                    ? 'Enter your phone number and we will call you back shortly.' 
                    : 'Enter your email address and we will get back to you.'}
                </p>

                <form onSubmit={handleContactSubmit} className="w-full space-y-4">
                  <input 
                    type={contactType === 'call' ? 'tel' : 'email'}
                    placeholder={contactType === 'call' ? 'Your Phone Number' : 'Your Email Address'}
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    required
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-medium focus:ring-2 focus:ring-brand-green/20 outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={isContactSubmitting || !contactInput.trim()}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                      isContactSubmitted 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-brand-green text-white hover:bg-brand-dark shadow-lg shadow-brand-green/20'
                    } disabled:opacity-50`}
                  >
                    {isContactSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isContactSubmitted ? (
                      <>
                        <CheckCircle2 size={20} />
                        Request Sent!
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send Request
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
