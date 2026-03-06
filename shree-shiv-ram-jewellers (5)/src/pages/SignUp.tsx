import { useState, FormEvent, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, User, Phone, Eye, EyeOff, Check, ArrowLeft, Chrome as Google } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SignUpProps {
  onBack?: () => void;
  onSuccess?: () => void;
  onLogin?: () => void;
}

export default function SignUp({ onBack, onSuccess, onLogin }: SignUpProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [countryFlag, setCountryFlag] = useState('in');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'verifying' | 'verified' | 'invalid'>('idle');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  const countryCodes: Record<string, string> = {
    '+1': 'us',
    '+91': 'in',
    '+44': 'gb',
    '+81': 'jp',
    '+86': 'cn',
    '+7': 'ru',
    '+49': 'de',
    '+33': 'fr',
    '+61': 'au',
    '+55': 'br',
    '+52': 'mx',
    '+971': 'ae',
    '+966': 'sa',
    '+65': 'sg',
    '+62': 'id',
    '+60': 'my',
    '+63': 'ph',
    '+66': 'th',
    '+84': 'vn',
    '+82': 'kr',
    '+34': 'es',
    '+39': 'it',
    '+90': 'tr',
    '+92': 'pk',
    '+880': 'bd',
    '+234': 'ng',
    '+27': 'za',
    '+20': 'eg',
  };

  useEffect(() => {
    const cleanValue = countryCode.replace(/\s/g, '');
    const codes = Object.keys(countryCodes).sort((a, b) => b.length - a.length);
    for (const code of codes) {
      if (cleanValue.startsWith(code)) {
        setCountryFlag(countryCodes[code]);
        break;
      }
    }
  }, [countryCode]);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const { signup, loginWithGoogle, isVerifyingGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      setEmailStatus('idle');
      return;
    }

    const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    if (!isValidFormat) {
      if (email.includes('@') && email.split('@')[1].includes('.')) {
        setEmailStatus('invalid');
      } else {
        setEmailStatus('idle');
      }
      setIsEmailVerified(false);
      return;
    }

    // Automatic verification simulation
    const timer = setTimeout(async () => {
      setEmailStatus('verifying');
      setIsVerifying(true);
      
      // Simulate backend/google check
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isGoogleDomain = email.toLowerCase().endsWith('@gmail.com');
      const isCommonDomain = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'].some(d => email.toLowerCase().endsWith(d));

      if (isCommonDomain) {
        setIsEmailVerified(true);
        setEmailStatus('verified');
        setNotificationMsg('Email verified successfully!');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      } else {
        setIsEmailVerified(false);
        setEmailStatus('invalid');
        setNotificationMsg('This email address does not exist or is invalid.');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
      setIsVerifying(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [email]);

  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[@$!%*?&#]/.test(pass)) strength++;
    if (pass.length >= 8) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength === 0) return 'bg-gray-200';
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified) {
      setError('Please verify your email address with Google first.');
      return;
    }
    if (getPasswordStrength(password) < 5) {
      setError('Password must meet all security requirements (Uppercase, Lowercase, Number, Special Char, and 8+ characters).');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }
    setError('');
    
    const fullPhone = `${countryCode} ${phone}`;
    const result = await signup(name, email, fullPhone, password);
    if (result.success) {
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } else {
      setError(result.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col relative overflow-x-hidden overflow-y-auto">
      {/* Google Verification Overlay */}
      {isVerifyingGoogle && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 border-4 border-[#5E7E7E] border-t-transparent rounded-full animate-spin mb-6"></div>
            <div className="flex items-center gap-2 mb-2">
              <Google size={24} className="text-[#4285F4]" />
              <h2 className="text-xl font-bold text-[#1A1A1A]">Google Verification</h2>
            </div>
            <p className="text-[#666666] text-center px-8">Connecting to Google securely. Please wait while we verify your account...</p>
          </motion.div>
        </div>
      )}

      {/* Hero Image Section */}
      <div className="relative h-[350px] w-full">
        <img 
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800"
          alt="Jewelry"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white"></div>
        
        {/* Back Button */}
        <button 
          onClick={onBack || (() => navigate(-1))}
          className="absolute top-12 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-colors z-20"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
      </div>

      {/* Form Content */}
      <div className="px-8 -mt-12 relative z-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-[28px] font-bold text-[#1A1A1A] mb-2">Create Account</h1>
          <p className="text-[#666666] text-[15px]">Fill out the form below to register a new account.</p>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[13px] font-medium text-[#999999] ml-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-[60px] px-5 bg-[#F8F8F8] border border-transparent rounded-[18px] focus:bg-white focus:border-[#E5E5E5] transition-all text-[16px] font-medium text-[#1A1A1A]"
              />
              {name.length >= 3 && (
                <div className="absolute inset-y-0 right-5 flex items-center text-[#2D5A5A]">
                  <Check size={20} />
                </div>
              )}
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[13px] font-medium text-[#999999] ml-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full h-[60px] px-5 bg-[#F8F8F8] border rounded-[18px] transition-all text-[16px] font-medium text-[#1A1A1A] ${
                  emailStatus === 'invalid' ? 'border-red-400 bg-red-50' : 
                  emailStatus === 'verified' ? 'border-green-400 bg-green-50' : 
                  'border-transparent focus:bg-white focus:border-[#E5E5E5]'
                }`}
              />
              <div className="absolute inset-y-0 right-5 flex items-center gap-2">
                {emailStatus === 'verifying' && (
                  <div className="w-5 h-5 border-2 border-[#5E7E7E] border-t-transparent rounded-full animate-spin"></div>
                )}
                {emailStatus === 'verified' && (
                  <div className="text-[#2D5A5A] flex items-center gap-1">
                    <Check size={20} />
                  </div>
                )}
                {emailStatus === 'invalid' && (
                  <div className="text-red-500 text-[12px] font-bold">
                    Wrong Email
                  </div>
                )}
              </div>
            </div>
            {emailStatus === 'invalid' && (
              <p className="text-red-500 text-[11px] ml-1 mt-1">Please enter a valid existing email address.</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[13px] font-medium text-[#999999] ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-[60px] px-5 bg-[#F8F8F8] border border-transparent rounded-[18px] focus:bg-white focus:border-[#E5E5E5] transition-all text-[16px] font-medium text-[#1A1A1A]"
              />
              <div className="absolute inset-y-0 right-5 flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#999999] hover:text-[#1A1A1A]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {getPasswordStrength(password) === 5 && (
                  <div className="text-[#2D5A5A]">
                    <Check size={20} />
                  </div>
                )}
              </div>
              
              {/* Password Strength Meter */}
              <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div 
                    key={step}
                    className={`h-full flex-1 transition-all duration-500 ${
                      getPasswordStrength(password) >= step 
                        ? getStrengthColor(getPasswordStrength(password)) 
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              {/* Password Requirements Checklist */}
              <div className="mt-3 px-1 space-y-2">
                <p className="text-[11px] font-bold text-[#999999] uppercase tracking-wider">Security Requirements</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className={`flex items-center gap-2 text-[11px] font-medium transition-colors ${/[A-Z]/.test(password) ? 'text-[#2D5A5A]' : 'text-[#999999]'}`}>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${/[A-Z]/.test(password) ? 'bg-[#2D5A5A] border-[#2D5A5A] text-white' : 'border-gray-300'}`}>
                      {/[A-Z]/.test(password) && <Check size={10} strokeWidth={4} />}
                    </div>
                    Uppercase Letter
                  </div>
                  <div className={`flex items-center gap-2 text-[11px] font-medium transition-colors ${/[a-z]/.test(password) ? 'text-[#2D5A5A]' : 'text-[#999999]'}`}>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${/[a-z]/.test(password) ? 'bg-[#2D5A5A] border-[#2D5A5A] text-white' : 'border-gray-300'}`}>
                      {/[a-z]/.test(password) && <Check size={10} strokeWidth={4} />}
                    </div>
                    Lowercase Letter
                  </div>
                  <div className={`flex items-center gap-2 text-[11px] font-medium transition-colors ${/\d/.test(password) ? 'text-[#2D5A5A]' : 'text-[#999999]'}`}>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${/\d/.test(password) ? 'bg-[#2D5A5A] border-[#2D5A5A] text-white' : 'border-gray-300'}`}>
                      {/\d/.test(password) && <Check size={10} strokeWidth={4} />}
                    </div>
                    One Number
                  </div>
                  <div className={`flex items-center gap-2 text-[11px] font-medium transition-colors ${/[@$!%*?&#]/.test(password) ? 'text-[#2D5A5A]' : 'text-[#999999]'}`}>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${/[@$!%*?&#]/.test(password) ? 'bg-[#2D5A5A] border-[#2D5A5A] text-white' : 'border-gray-300'}`}>
                      {/[@$!%*?&#]/.test(password) && <Check size={10} strokeWidth={4} />}
                    </div>
                    Special Character
                  </div>
                  <div className={`flex items-center gap-2 text-[11px] font-medium transition-colors ${password.length >= 8 ? 'text-[#2D5A5A]' : 'text-[#999999]'}`}>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${password.length >= 8 ? 'bg-[#2D5A5A] border-[#2D5A5A] text-white' : 'border-gray-300'}`}>
                      {password.length >= 8 && <Check size={10} strokeWidth={4} />}
                    </div>
                    8+ Characters
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-[13px] font-medium text-[#999999] ml-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-[60px] px-5 bg-[#F8F8F8] border border-transparent rounded-[18px] focus:bg-white focus:border-[#E5E5E5] transition-all text-[16px] font-medium text-[#1A1A1A]"
              />
              <div className="absolute inset-y-0 right-5 flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[#999999] hover:text-[#1A1A1A]"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {confirmPassword.length > 0 && (
                  <div className="flex items-center">
                    {confirmPassword === password && getPasswordStrength(password) === 5 ? (
                      <div className="text-[#2D5A5A] flex items-center gap-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Matched</span>
                        <Check size={20} />
                      </div>
                    ) : confirmPassword !== password ? (
                      <div className="text-red-500 text-[11px] font-bold uppercase tracking-wider">
                        Mismatch
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-[13px] font-medium text-[#999999] ml-1">Phone Number</label>
            <div className="flex gap-3">
              {/* Country Code Input */}
              <div className="relative w-[110px] flex-shrink-0">
                <div className="absolute inset-y-0 left-4 flex items-center">
                  <img src={`https://flagcdn.com/w40/${countryFlag}.png`} alt={countryFlag} className="w-5 h-auto rounded-sm" />
                </div>
                <input
                  type="text"
                  value={countryCode}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || val === '+' || /^\+\d*$/.test(val)) {
                      setCountryCode(val);
                    }
                  }}
                  className="w-full h-[60px] pl-11 pr-2 bg-[#F8F8F8] border border-transparent rounded-[18px] focus:bg-white focus:border-[#E5E5E5] transition-all text-[16px] font-medium text-[#1A1A1A]"
                  placeholder="+91"
                />
              </div>

              {/* Phone Input */}
              <div className="relative flex-grow">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                  className="w-full h-[60px] px-5 bg-[#F8F8F8] border border-transparent rounded-[18px] focus:bg-white focus:border-[#E5E5E5] transition-all text-[16px] font-medium text-[#1A1A1A]"
                  placeholder="Phone number"
                />
                {phone.length >= 10 && (
                  <div className="absolute inset-y-0 right-5 flex items-center text-[#2D5A5A]">
                    <Check size={20} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-center gap-3 mt-4">
            <button 
              type="button"
              onClick={() => setAgreeTerms(!agreeTerms)}
              className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${agreeTerms ? 'bg-[#5E7E7E] text-white' : 'border-2 border-[#E5E5E5]'}`}
            >
              {agreeTerms && <Check size={16} strokeWidth={3} />}
            </button>
            <p className="text-[14px] text-[#666666]">
              I agree to the <span className="text-[#1A1A1A] font-semibold">Terms of Service</span> and <span className="text-[#1A1A1A] font-semibold">Privacy Policy</span>
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full h-[60px] bg-[#5E7E7E] text-white rounded-full font-semibold text-[18px] flex items-center justify-center mt-6 shadow-lg shadow-[#5E7E7E]/20"
          >
            Sign Up
          </motion.button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E5E5]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#999999] font-medium">Or sign up with</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={loginWithGoogle}
            className="w-full h-[60px] border border-[#E5E5E5] rounded-full flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors font-semibold text-[16px]"
          >
            <Google size={20} /> Google
          </button>
        </form>

        <div className="mt-8 text-center text-[15px] text-[#666666]">
          Already have an account? <button onClick={onLogin || (() => navigate('/login'))} className="text-[#1A1A1A] font-bold hover:underline ml-1">Login</button>
        </div>

        {/* Notification Toast */}
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 ${
              emailStatus === 'verified' ? 'bg-[#2D5A5A] text-white' : 'bg-red-600 text-white'
            }`}
          >
            {emailStatus === 'verified' ? <Check size={18} /> : <div className="w-2 h-2 rounded-full bg-white" />}
            <span className="text-sm font-medium">{notificationMsg}</span>
          </motion.div>
        )}

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-10">
          <div className="w-2 h-2 rounded-full bg-[#E5E5E5]"></div>
          <div className="w-2 h-2 rounded-full bg-[#E5E5E5]"></div>
          <div className="w-2 h-2 rounded-full bg-[#E5E5E5]"></div>
        </div>
      </div>
    </div>
  );
}

