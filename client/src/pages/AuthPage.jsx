import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/authSlice'; 
import useApi from '../hooks/useApi'; 

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Use the hook here
  const { execute, loading, error: apiError } = useApi();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Determine Endpoint and Method
    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    const method = 'POST';

    // 2. Execute the API call using the hook
    const { data, error } = await execute(endpoint, method, formData);

    if (error) {
      // Error is already captured by the hook's 'apiError' state
      return;
    }

    if (data) {
      if (isLogin) {
        // 3. If login successful, update Redux and navigate
        dispatch(loginUser(data.user)); // Assuming your API returns { user: {...} }
        navigate('/');
      } else {
        // 4. If signup successful, switch to login view
        alert("Account created! Please login.");
        setIsLogin(true);
        setFormData({ ...formData, password: '' }); // Clear password for security
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5FF] flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl shadow-blue-100/50 p-8 lg:p-12 border border-blue-50">
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-full border-[3px] border-blue-500 flex items-center justify-center mb-4">
            <div className="w-4 h-4 bg-blue-500 rounded-full" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Ventixe</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isLogin ? "Welcome back!" : "Create your account."}
          </p>
          
          {/* Display API Errors here */}
          {apiError && (
            <p className="text-red-500 text-xs mt-2 font-semibold bg-red-50 p-2 rounded-lg w-full text-center">
              {apiError}
            </p>
          )}
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-300" size={18} />
              <input 
                required
                name="fullName"
                type="text" 
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Full Name" 
                className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-12 text-sm focus:ring-2 focus:ring-pink-100 transition-all outline-none"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-slate-300" size={18} />
            <input 
              required
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email Address" 
              className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-12 text-sm focus:ring-2 focus:ring-pink-100 transition-all outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-slate-300" size={18} />
            <input 
              required
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password" 
              className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-12 text-sm focus:ring-2 focus:ring-pink-100 transition-all outline-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} // Disable button while loading
            className={`w-full ${loading ? 'bg-pink-300' : 'bg-[#F472B6] hover:bg-pink-500'} text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-100 transition-all flex items-center justify-center gap-2 group`}
          >
            <span>{loading ? "Processing..." : (isLogin ? "Login" : "Create Account")}</span>
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            type="button"
            disabled={loading}
            onClick={() => { setIsLogin(!isLogin); }}
            className="text-blue-500 font-bold hover:underline text-sm"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;