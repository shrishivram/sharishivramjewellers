import { useState, FormEvent, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, Eye, EyeOff, Check, ArrowLeft, Chrome as Google, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onBack?: () => void;
  onSuccess?: () => void;
  onRegister?: () => void;
}

export default function Login({ onBack, onSuccess, onRegister }: LoginProps) {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [value, setValue] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [countryFlag, setCountryFlag] = useState('in');
  const [password, setPassword] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showOtpNotification, setShowOtpNotification] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'verifying' | 'verified' | 'invalid'>('idle');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneError, setPhoneError] = useState('');

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
    if (method === 'phone') {
      const cleanValue = countryCode.replace(/\s/g, '');
      const codes = Object.keys(countryCodes).sort((a, b) => b.length - a.length);
      for (const code of codes) {
        if (cleanValue.startsWith(code)) {
          setCountryFlag(countryCodes[code]);
          break;
        }
      }
    }
  }, [countryCode, method]);

  // Phone verification simulation
  useEffect(() => {
    if (method !== 'phone' || !value || value.length < 10) {
      setPhoneStatus('idle');
      setIsPhoneVerified(false);
      setPhoneError('');
      return;
    }

    const timer = setTimeout(async () => {
      setPhoneStatus('verifying');
      setPhoneError('');
      
      // Simulate backend check for registered number
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // For demo: any 10 digit number starting with 9, 8, 7, 6 is "verified"
      if (/^[6-9]\d{9}$/.test(value)) {
        setPhoneStatus('verified');
        setIsPhoneVerified(true);
      } else {
        setPhoneStatus('invalid');
        setIsPhoneVerified(false);
        setPhoneError('This number is not registered with us.');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [value, method]);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState<'input' | 'success'>('input');
  const [resetMethod, setResetMethod] = useState<'email' | 'phone'>('email');
  const [resetValue, setResetValue] = useState('');
  const { login, loginWithGoogle, isVerifyingGoogle } = useAuth();
  const navigate = useNavigate();

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simulate sending reset link/OTP
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (resetMethod === 'email') {
      if (!resetValue.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
    } else {
      if (resetValue.length < 10) {
        setError('Please enter a valid phone number');
        return;
      }
    }
    
    setResetStep('success');
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (method === 'email') {
      const result = await login(value, undefined, password);
      if (result.success) {
        if (onSuccess) onSuccess();
        else navigate('/');
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } else {
      if (value.length < 10) {
        setError('Please enter a valid 10-digit phone number');
        return;
      }

      if (!isPhoneVerified) {
        setError('Please wait for number verification or enter a registered number.');
        return;
      }
      
      // Simulate sending OTP via WhatsApp with a realistic delay
      setOtpSent(true);
      
      setTimeout(() => {
        const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(newOtp);
        setShowOtpNotification(true);
        
        // Auto-hide notification after 8 seconds
        setTimeout(() => setShowOtpNotification(false), 8000);
        
        console.log(`OTP for ${countryCode}${value}: ${newOtp} (Sent from WhatsApp: 8435627938)`);
      }, 1500);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp !== generatedOtp) {
      setError('Invalid OTP. Please check your WhatsApp message.');
      return;
    }

    const fullPhone = `${countryCode} ${value}`;
    const result = await login(undefined, fullPhone);
    if (result.success) {
      if (onSuccess) onSuccess();
      else navigate('/');
    } else {
      setError(result.message || 'Invalid OTP');
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
      <div className="relative h-[300px] w-full">
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
          <h1 className="text-[28px] font-bold text-[#1A1A1A] mb-2">Welcome Back</h1>
          <p className="text-[#666666] text-[15px]">Sign in to continue your shopping journey.</p>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {showOtpNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 text-[#2D5A5A] rounded-2xl text-sm font-medium border border-green-100 flex items-start gap-3"
          >
            <div className="bg-[#25D366] p-1.5 rounded-lg text-white mt-0.5">
              <MessageCircle size={16} fill="currentColor" />
            </div>
            <div>
              <p className="font-bold mb-0.5">WhatsApp OTP Sent!</p>
              <p className="text-[13px] opacity-90">A 4-digit code has been sent from <span className="font-bold">+91 8435627938</span> to your WhatsApp. Your code is: <span className="font-bold text-[15px]">{generatedOtp}</span></p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedOtp);
                  // Optional: show a small "Copied" feedback
                }}
                className="mt-2 text-[11px] font-bold uppercase tracking-wider bg-[#25D366]/10 px-3 py-1 rounded-full hover:bg-[#25D366]/20 transition-colors"
              >
                Copy Code
              </button>
            </div>
          </motion.div>
        )}

        {isForgotPassword ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Reset Password</h2>
              <p className="text-[#666666]">Choose how you want to reset your password.</p>
            </div>

            {resetStep === 'input' ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="flex justify-center gap-6 mb-4">
                  <button 
                    type="button" 
                    onClick={() => setResetMethod('email')}
                    className={`text-[14px] font-semibold transition-colors ${resetMethod === 'email' ? 'text-[#1A1A1A] border-b-2 border-[#5E7E7E]' : 'text-[#999999]'}`}
                  >
                    Email
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setResetMethod('phone')}
                    className={`text-[14px] font-semibold transition-colors ${resetMethod === 'phone' ? 'text-[#1A1A1A] border-b-2 border-[#5E7E7E]' : 'text-[#999999]'}`}
                  >
                    Phone
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[13px] font-medium text-[#999999] ml-1">
                    {resetMethod === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <input
                    type={resetMethod === 'email' ? 'email' : 'tel'}
                    value={resetValue}
                    onChange={(e) => setResetValue(e.target.value)}
                    required
                    placeholder={resetMethod === 'email' ? 'your@email.com' : 'Enter phone number'}
                    className="w-full h-[60px] px-5 bg-[#F8F8F8] border border-transparent rounded-[18px] focus:bg-white focus:border-[#E5E5E5] transition-all text-[16px] font-medium text-[#1A1A1A]"
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full h-[60px] bg-[#5E7E7E] text-white rounded-full font-semibold text-[18px] flex items-center justify-center mt-6 shadow-lg shadow-[#5E7E7E]/20"
                >
                  Send Reset Link
                </motion.button>

                <button 
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full text-center text-[#666666] font-medium hover:text-[#1A1A1A] transition-colors"
                >
                  Back to Login
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                  <Check size={40} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Check your {resetMethod}</h3>
                  <p className="text-[#666666]">We've sent a password reset link to {resetValue}. Please check and follow the instructions.</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetStep('input');
                    setResetValue('');
                  }}
                  className="w-full h-[60px] bg-[#5E7E7E] text-white rounded-full font-semibold text-[18px] flex items-center justify-center shadow-lg shadow-[#5E7E7E]/20"
                >
                  Back to Login
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : !otpSent ? (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Method Toggle */}
            <div className="flex justify-center gap-6 mb-2">
              <button 
                type="button" 
                onClick={() => setMethod('email')}
                className={`text-[14px] font-semibold transition-colors ${method === 'email' ? 'text-[#1A1A1A] border-b-2 border-[#5E7E7E]' : 'text-[#999999]'}`}
              >
                Email
              </button>
              <button 
                type="button" 
                onClick={() => setMethod('phone')}
                className={`text-[14px] font-semibold transition-colors ${method === 'phone' ? 'text-[#1A1A1A] border-b-2 border-[#5E7E7E]' : 'text-[#999999]'}`}
              >
                Phone
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[13px] font-medium text-[#999999] ml-1">
                {method === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              
              {method === 'email' ? (
                <div className="relative">
                  <input
                    type="email"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    className="w-full h-[60px] px-5 bg-[#F8F8F8] border border-transparent rounded-[18px] focus:bg-white focus:border-[#E5E5E5] transition-all text-[16px] font-medium text-[#1A1A1A]"
                  />
                  {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && (
                    <div className="absolute inset-y-0 right-5 flex items-center text-[#2D5A5A]">
                      <Check size={20} />
                    </div>
                  )}
                </div>
              ) : (
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
                      value={value}
                      onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
                      required
                      className={`w-full h-[60px] px-5 bg-[#F8F8F8] border rounded-[18px] transition-all text-[16px] font-medium text-[#1A1A1A] ${
                        phoneStatus === 'invalid' ? 'border-red-400 bg-red-50' : 
                        phoneStatus === 'verified' ? 'border-green-400 bg-green-50' : 
                        'border-transparent focus:bg-white focus:border-[#E5E5E5]'
                      }`}
                      placeholder="Phone number"
                    />
                    <div className="absolute inset-y-0 right-5 flex items-center gap-2">
                      {phoneStatus === 'verifying' && (
                        <div className="w-5 h-5 border-2 border-[#5E7E7E] border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {phoneStatus === 'verified' && (
                        <div className="text-[#2D5A5A] flex items-center gap-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider">Verified</span>
                          <Check size={20} />
                        </div>
                      )}
                      {phoneStatus === 'invalid' && (
                        <div className="text-red-500 text-[11px] font-bold uppercase tracking-wider">
                          Not Found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {phoneStatus === 'invalid' && (
              <p className="text-red-500 text-[11px] ml-1 mt-1">{phoneError}</p>
            )}
            {phoneStatus === 'verified' && (
              <p className="text-[#2D5A5A] text-[11px] ml-1 mt-1">Number {countryCode} {value} is verified and ready.</p>
            )}

            {method === 'email' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[13px] font-medium text-[#999999]">Password</label>
                  <button 
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[12px] font-bold text-[#5E7E7E] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
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
                    {password.length >= 6 && (
                      <div className="text-[#2D5A5A]">
                        <Check size={20} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full h-[60px] bg-[#5E7E7E] text-white rounded-full font-semibold text-[18px] flex items-center justify-center mt-6 shadow-lg shadow-[#5E7E7E]/20"
            >
              {method === 'email' ? 'Login' : 'Continue'}
            </motion.button>

            <div className="mt-4 text-center">
              <span className="text-[14px] text-[#666666]">New to LuxeLoom? </span>
              <button 
                type="button"
                onClick={onRegister || (() => navigate('/signup'))}
                className="text-[14px] font-bold text-[#5E7E7E] hover:underline"
              >
                Register Now
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-8">
            <div className="text-center">
              <p className="text-[#666666] mb-2">Verification Code</p>
              <p className="text-sm">Sent to <span className="font-bold text-[#1A1A1A]">{value}</span></p>
            </div>
            
            <div className="flex justify-center gap-4">
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={otp[i] || ''}
                  className="w-14 h-14 text-center text-xl font-bold bg-[#F8F8F8] border border-transparent rounded-xl focus:bg-white focus:border-[#E5E5E5] transition-all"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && /^\d$/.test(val)) {
                      const newOtp = otp.split('');
                      newOtp[i] = val;
                      setOtp(newOtp.join(''));
                      // Auto focus next input
                      if (i < 3) {
                        const nextInput = e.target.nextElementSibling as HTMLInputElement;
                        if (nextInput) nextInput.focus();
                      }
                    } else if (!val) {
                      const newOtp = otp.split('');
                      newOtp[i] = '';
                      setOtp(newOtp.join(''));
                      // Auto focus previous input
                      if (i > 0) {
                        const prevInput = e.target.previousElementSibling as HTMLInputElement;
                        if (prevInput) prevInput.focus();
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[i] && i > 0) {
                      const prevInput = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
                      if (prevInput) prevInput.focus();
                    }
                  }}
                />
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full h-[60px] bg-[#5E7E7E] text-white rounded-full font-semibold text-[18px] flex items-center justify-center mt-6 shadow-lg shadow-[#5E7E7E]/20"
            >
              Verify & Login
            </motion.button>

            <div className="mt-4 text-center">
              <span className="text-[14px] text-[#666666]">Don't have an account? </span>
              <button 
                type="button"
                onClick={onRegister || (() => navigate('/signup'))}
                className="text-[14px] font-bold text-[#5E7E7E] hover:underline"
              >
                Register Here
              </button>
            </div>
            
            <button 
              type="button"
              onClick={() => {
                setOtp('');
                setShowOtpNotification(false);
                const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
                setTimeout(() => {
                  setGeneratedOtp(newOtp);
                  setShowOtpNotification(true);
                  setTimeout(() => setShowOtpNotification(false), 8000);
                }, 1000);
              }}
              className="w-full text-[#1A1A1A] text-[14px] font-bold hover:underline"
            >
              Resend Code
            </button>
          </form>
        )}

        <div className="mt-8">
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E5E5]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#999999] font-medium">Or login with</span>
            </div>
          </div>

          <button 
            onClick={loginWithGoogle}
            className="w-full h-[60px] border border-[#E5E5E5] rounded-full flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors font-semibold text-[16px]"
          >
            <Google size={20} /> Google
          </button>

          <div className="mt-8 text-center text-[15px] text-[#666666]">
            Don't have an account? <button onClick={onRegister || (() => navigate('/signup'))} className="text-[#1A1A1A] font-bold hover:underline ml-1">Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );
}


