import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'; // Added for Redux
import { loginUser } from '../features/authSlice'; // Import your action
import useApi from '../hooks/useApi';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
  
  const dispatch = useDispatch(); // Initialize Redux dispatch
  const { loading, error, execute } = useApi();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    const { data } = await execute(endpoint, 'POST', formData);

    if (data) {
      if (isLogin) {
        /**
         * SUCCESSFUL LOGIN:
         * We dispatch the data to Redux. The slice handles saving to 
         * localStorage for us automatically based on your slice code.
         */
        dispatch(loginUser({
          user: data.user, 
          token: data.token
        }));
        
        navigate('/'); 
      } else {
        // SUCCESSFUL SIGNUP
        alert("Account created! Please sign in.");
        setIsLogin(true);
        setFormData({ email: '', password: '', fullName: '' });
      }
    }
  };

  return (
    <div className="min-h-dvh bg-[#0F0C21] flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-5%] right-[-10%] w-64 h-64 sm:w-96 sm:h-96 bg-purple-900/20 blur-[80px] sm:blur-[120px] rounded-full" />
      <div className="absolute bottom-[-5%] left-[-10%] w-64 h-64 sm:w-96 sm:h-96 bg-blue-900/20 blur-[80px] sm:blur-[120px] rounded-full" />

      <div className="bg-[#1C1A2E]/60 backdrop-blur-2xl w-full max-w-[400px] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl p-8 sm:p-12 border border-white/10 relative z-10 mx-auto">
        
        <div className="flex flex-col items-center mb-8 sm:mb-10">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-indigo-500/20">
            <Zap className="text-white fill-white" size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Ventixe</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 sm:mt-2 text-center">
            {isLogin ? "Welcome back" : "Create your account"}
          </p>
        </div>

        {/* Display Error Message if API fails */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input
                required
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Full name"
                className="w-full bg-slate-100/90 sm:bg-[#2A2743]/50 border border-white/5 rounded-2xl py-3.5 sm:py-4 px-12 text-slate-900 sm:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-sm"
              />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input
              required
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email address"
              className="w-full bg-slate-100/95 sm:bg-[#2A2743]/50 border border-white/5 rounded-2xl py-3.5 sm:py-4 px-12 text-slate-900 sm:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-sm"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input
              required
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="w-full bg-slate-100/95 sm:bg-[#2A2743]/50 border border-white/5 rounded-2xl py-3.5 sm:py-4 px-12 text-slate-900 sm:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-3.5 sm:py-4 rounded-2xl font-bold text-white transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-2 group
              ${isLogin 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-pink-500/20' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-indigo-500/20'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            <span>{loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}</span>
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-slate-500 text-xs sm:text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: '', password: '', fullName: '' });
              }}
              className="ml-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;