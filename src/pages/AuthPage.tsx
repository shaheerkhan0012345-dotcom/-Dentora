import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  UserCheck,
  ShieldCheck,
  Key
} from 'lucide-react';
import { UserProfile } from '../types';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/user';
import { loginSchema, signUpSchema, forgotPasswordSchema } from '../schemas/authSchemas';
import { DentoraLogo } from '../components/common/DentoraLogo';

interface AuthPageProps {
  onNavigateHome: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onNavigateHome,
  onLoginSuccess,
  initialMode = 'signin'
}) => {
  const { login, signUp, forgotPassword, loginWithGoogle, currentUser } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states with default demo credentials
  const [email, setEmail] = useState('admin@teethlyclinic.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Admin');
  const [rememberMe, setRememberMe] = useState(true);

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    const demoEmail = 'admin.demo@teethlyclinic.com';
    const demoPass = 'TeethlyDemo2026!';
    
    try {
      // Try logging in with demo account
      try {
        await login(demoEmail, demoPass);
      } catch {
        // If demo account doesn't exist yet, auto create it
        await signUp(demoEmail, demoPass, 'Dr. Alexander Wright (Admin)', '+1 (555) 234-5678', 'Admin');
      }

      const mockUserProfile: UserProfile = {
        id: currentUser?.uid || 'usr_demo_admin',
        name: currentUser?.displayName || 'Dr. Alexander Wright (Admin)',
        email: currentUser?.email || demoEmail,
        phone: currentUser?.phone || '+1 (555) 234-5678',
        avatar: currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        memberSince: currentUser?.memberSince || 'January 2025',
        plan: 'Clinic Super Admin Portal',
        assignedOrthodontist: 'Chief Dental Director',
        nextAppointment: {
          date: 'Thursday, Aug 14',
          time: '10:30 AM',
          type: 'Aligner Tray #12 Refinement & 3D Scan',
          doctor: 'Dr. Elena Rostova',
          location: 'Beverly Hills Suite 402'
        }
      };
      
      onLoginSuccess(mockUserProfile);
    } catch (err: any) {
      setError(err?.message || 'Demo sign-in failed. Please try standard sign-up.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      if (currentUser) {
        onLoginSuccess({
          id: currentUser.uid,
          name: currentUser.displayName,
          email: currentUser.email,
          phone: currentUser.phone || '',
          avatar: currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          memberSince: currentUser.memberSince || 'August 2026',
          plan: 'Teethly Dental Member',
          assignedOrthodontist: 'Dr. Elena Rostova, MD',
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (mode === 'forgot') {
      const validation = forgotPasswordSchema.safeParse({ email });
      if (!validation.success) {
        setError(validation.error.issues[0]?.message || 'Please enter a valid email address.');
        return;
      }

      setLoading(true);
      try {
        await forgotPassword(email);
        setSuccessMessage('Password reset instructions sent! Check your inbox.');
      } catch (err: any) {
        setError(err?.message || 'Failed to send password reset email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'signin') {
      const validation = loginSchema.safeParse({ email, password, rememberMe });
      if (!validation.success) {
        setError(validation.error.issues[0]?.message || 'Please fill in all required fields.');
        return;
      }

      setLoading(true);
      try {
        await login(email, password);
        const isAdmin = email.toLowerCase().includes('admin');
        const mappedUser: UserProfile = {
          id: `usr_${Date.now()}`,
          name: isAdmin ? 'Dr. Alexander Wright (Admin)' : email.split('@')[0],
          email: email,
          phone: '+1 (555) 987-6543',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          memberSince: 'August 2026',
          plan: 'Teethly Access Portal',
          assignedOrthodontist: 'Dr. Elena Rostova, MD',
        };
        onLoginSuccess(mappedUser);
      } catch (err: any) {
        setError(err?.message || 'Invalid credentials.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'signup') {
      const validation = signUpSchema.safeParse({
        displayName: name,
        email,
        phone,
        password,
        role: selectedRole,
      });

      if (!validation.success) {
        setError(validation.error.issues[0]?.message || 'Please fill in all required fields.');
        return;
      }

      setLoading(true);
      try {
        await signUp(email, password, name, phone, selectedRole);
        const mappedUser: UserProfile = {
          id: currentUser?.uid || `usr_${Date.now()}`,
          name: name,
          email: email,
          phone: phone || '',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          memberSince: 'August 2026',
          plan: `${selectedRole} Access Portal`,
          assignedOrthodontist: 'Dr. Elena Rostova, MD',
        };
        onLoginSuccess(mappedUser);
      } catch (err: any) {
        setError(err?.message || 'Account registration failed.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-800 flex flex-col lg:flex-row font-sans">
      
      {/* LEFT COLUMN: HERO SHOWCASE (Matching reference image) */}
      <div className="lg:w-1/2 bg-[#f8fafc] p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden border-r border-slate-100 min-h-[640px]">
        
        {/* Decorative graphic shapes at bottom left (exact matching ref layout) */}
        <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full bg-[#10b981] pointer-events-none opacity-90" />
        <div className="absolute bottom-0 left-32 w-14 h-14 bg-[#38bdf8] rounded-t-full pointer-events-none" />
        <div className="absolute bottom-0 right-32 w-16 h-16 rounded-t-full bg-[#f59e0b] pointer-events-none" />
        <div className="absolute -bottom-8 right-8 w-36 h-36 rounded-full bg-[#8b5cf6] pointer-events-none opacity-80" />
        
        {/* Top Header & Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="flex items-center text-slate-900 hover:opacity-80 transition-opacity cursor-pointer group"
          >
            <DentoraLogo size="lg" />
          </button>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Main Website</span>
          </button>
        </div>

        {/* Center Hero Title & Subtext (Colors matching reference image) */}
        <div className="relative z-10 max-w-lg my-auto pt-8 pb-4 text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-[#1d5bd8] leading-[1.08] tracking-tight mb-4">
            The Next <br />
            Generation <br />
            <span className="text-[#38bdf8] font-bold text-3xl sm:text-4xl lg:text-[42px]">
              Of Clinic & Smile Care
            </span>
          </h1>

          <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-md font-normal">
            Our clinic lets you visit exceptional medical providers, receive clinically-backed orthodontic & wellness services, and discover your dream smile, all in one place.
          </p>
        </div>

        {/* Doctor Image Showcase (Natural standing figure directly on canvas, touching bottom edge) */}
        <div className="relative z-10 w-full flex justify-center items-end mt-auto pt-6 -mb-8 sm:-mb-12 lg:-mb-14">
          <img 
            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1000&q=80"
            alt="Doctor Specialist"
            className="w-auto h-72 sm:h-80 lg:h-[420px] max-w-full object-cover object-top filter drop-shadow-2xl mix-blend-multiply"
            style={{
              maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
            }}
          />
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORM (Exact reference match) */}
      <div className="lg:w-1/2 bg-white p-6 sm:p-12 lg:p-16 flex flex-col justify-center items-center relative">
        
        <div className="w-full max-w-md space-y-6">
          
          {/* Form Header */}
          <div className="text-center space-y-1.5">
            <h2 className="text-3xl font-extrabold text-[#0B2E78] tracking-tight">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Your Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {mode === 'signin' && 'Select your role and enter credentials to continue'}
              {mode === 'signup' && 'Register for VIP Teethly Patient or Staff Portal access'}
              {mode === 'forgot' && 'Enter your account email to receive reset link'}
            </p>
          </div>

          {/* MODE SWITCHER TABS (Login vs Create Account) */}
          {mode !== 'forgot' && (
            <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); setSuccessMessage(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'signin'
                    ? 'bg-[#1d5bd8] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); setSuccessMessage(null); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'signup'
                    ? 'bg-[#1d5bd8] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            
            {/* ROLE SELECTOR FOR ACCOUNT CREATION */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Account Role to Register
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1d5bd8] pointer-events-none" />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2073e5]/20 focus:border-[#2073e5] transition-all cursor-pointer shadow-xs"
                  >
                    <option value="Admin">👑 Admin (Clinic Operations & Management)</option>
                    <option value="Doctor">🩺 Doctor (Dentist / Clinical Station)</option>
                    <option value="Receptionist">📋 Receptionist (Front Desk & Queue)</option>
                    <option value="Assistant">🧰 Assistant (Chairside & Sterilization)</option>
                    <option value="Accountant">💳 Accountant (Financial Ledger & Invoices)</option>
                    <option value="Patient">👤 Patient (VIP Member Portal)</option>
                  </select>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2073e5]/20 focus:border-[#2073e5] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2073e5]/20 focus:border-[#2073e5] transition-all"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2073e5]/20 focus:border-[#2073e5] transition-all"
                  />
                </div>
              </div>
            )}

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2073e5]/20 focus:border-[#2073e5] transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember me & Forgot password row (matching reference image) */}
            {mode === 'signin' && (
              <>
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0B2E78] border-slate-300 focus:ring-[#2073e5]"
                    />
                    <span className="text-slate-600 font-medium">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); setSuccessMessage(null); }}
                    className="font-semibold text-[#2073e5] hover:underline cursor-pointer"
                  >
                    Forgot your password
                  </button>
                </div>

                {/* Default Demo Credentials Notice Box */}
                <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-[#1d5bd8]" />
                      <span>Demo Access Credentials:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('admin@Teethlyclinic.com');
                        setPassword('admin123');
                      }}
                      className="text-[11px] font-extrabold text-[#1d5bd8] hover:underline cursor-pointer"
                    >
                      Autofill Credentials
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-600 font-mono bg-white p-2 rounded-lg border border-slate-200/80 gap-1">
                    <span>Email: <strong className="text-slate-900 font-bold">admin@Teethlyclinic.com</strong></span>
                    <span>Pass: <strong className="text-slate-900 font-bold">admin123</strong></span>
                  </div>
                </div>
              </>
            )}

            {/* Main Primary Button (Matching reference image solid blue) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#1d5bd8] hover:bg-[#154dbf] text-white font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer disabled:opacity-70 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>
                  {mode === 'signin' && 'Login'}
                  {mode === 'signup' && 'Sign Up'}
                  {mode === 'forgot' && 'Send Reset Code'}
                </span>
              )}
            </button>
          </form>

          {mode === 'forgot' && (
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); setSuccessMessage(null); }}
                className="text-xs font-bold text-[#1d5bd8] hover:underline cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>
          )}

          {/* Divider: Or (Matching reference image) */}
          {mode !== 'forgot' && (
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400 font-medium">
                  Or
                </span>
              </div>
            </div>
          )}

          {/* Social Buttons (Matching reference image) */}
          {mode !== 'forgot' && (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Sign in with Facebook</span>
              </button>
            </div>
          )}

          {/* Bottom Switch Link */}
          <div className="pt-4 text-center text-xs text-slate-500 font-medium">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="font-bold text-[#1d5bd8] hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className="font-bold text-[#1d5bd8] hover:underline cursor-pointer"
                >
                  Login
                </button>
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
