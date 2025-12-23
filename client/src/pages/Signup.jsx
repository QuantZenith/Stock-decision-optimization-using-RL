import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerStart, registerSuccess, registerFail } from '../redux/authSlice';
import Navbar from '../components/Navbar';

const Signup = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const password = watch("password");

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      dispatch(registerFail("Passwords do not match"));
      return;
    }

    dispatch(registerStart());
    try {
      // Dynamically import authApi to ensure axios is initialized
      const { authApi } = await import('../api/authApi.js');
      const response = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (response.data.success) {
        // Don't auto-login on signup, redirect to login with message
        dispatch(registerFail(null)); // Clear any errors
        navigate('/login', { 
          state: { 
            message: response.data.message || 'Account created successfully! Please login.',
            type: 'success' 
          } 
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Check if it's an axios initialization error
      if (err.message.includes('Axios not properly initialized')) {
        dispatch(registerFail('⚠️ Please run: npm install in the client directory'));
        return;
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      dispatch(registerFail(errorMessage));
    }
  };

  return (
    <div className="bg-[#FDF9F9] dark:bg-[#161212] text-[#453030] dark:text-[#E8E0E0] font-body antialiased transition-colors duration-300 min-h-screen flex flex-col relative overflow-hidden">
      
      <Navbar />

      {/* Main Content Wrapper - Responsive padding */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        
        {/* Background decorations */}
        <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-landing-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-landing-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-landing-surface dark:bg-[#211A1A] border border-landing-primary/20 shadow-sm shadow-landing-primary/5 mb-6 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-landing-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-landing-primary"></span>
              </span>
              <span className="text-xs font-bold tracking-wide uppercase text-landing-primary">Get Started</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-landing-text dark:text-white mb-3 tracking-tight">Create Your Account</h2>
            <p className="text-landing-muted dark:text-gray-400 text-base">Join thousands of traders using AI-powered insights</p>
          </div>

          {/* Form Card */}
          <div className="bg-landing-surface dark:bg-[#211A1A] rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-landing-primary/10 relative overflow-hidden">
             {/* Soft Glow effect inside card */}
             <div className="absolute top-0 left-0 -ml-16 -mt-16 w-32 h-32 rounded-full bg-landing-primary/10 blur-3xl pointer-events-none"></div>

            <form className="flex flex-col gap-5 relative z-10" onSubmit={handleSubmit(onSubmit)}>
              
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-landing-text dark:text-white ml-1">Full Name</label>
                <div className="relative group">
                  <input 
                    {...register("name", { 
                      required: "Name is required",
                      minLength: { value: 4, message: "Name must be at least 4 characters" },
                      maxLength: { value: 30, message: "Name must not exceed 30 characters" }
                    })} 
                    className="w-full h-12 pl-11 pr-4 bg-[#FDF9F9] dark:bg-[#161212] border-2 border-landing-primary/20 rounded-xl text-landing-text dark:text-white placeholder:text-landing-muted focus:outline-none focus:border-landing-primary focus:ring-2 focus:ring-landing-primary/20 transition-all" 
                    placeholder="John Doe" 
                    type="text" 
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-landing-muted group-focus-within:text-landing-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1 ml-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-landing-text dark:text-white ml-1">Email Address</label>
                <div className="relative group">
                  <input 
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })} 
                    className="w-full h-12 pl-11 pr-4 bg-[#FDF9F9] dark:bg-[#161212] border-2 border-landing-primary/20 rounded-xl text-landing-text dark:text-white placeholder:text-landing-muted focus:outline-none focus:border-landing-primary focus:ring-2 focus:ring-landing-primary/20 transition-all" 
                    placeholder="you@example.com" 
                    type="email" 
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-landing-muted group-focus-within:text-landing-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </div>
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1 ml-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-landing-text dark:text-white ml-1">Password</label>
                <div className="relative group">
                  <input 
                    {...register("password", { 
                      required: "Password is required",
                      minLength: { value: 8, message: "Password must be at least 8 characters" }
                    })} 
                    className="w-full h-12 pl-11 pr-12 bg-[#FDF9F9] dark:bg-[#161212] border-2 border-landing-primary/20 rounded-xl text-landing-text dark:text-white placeholder:text-landing-muted focus:outline-none focus:border-landing-primary focus:ring-2 focus:ring-landing-primary/20 transition-all" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-landing-muted group-focus-within:text-landing-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-landing-muted hover:text-landing-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1 ml-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-landing-text dark:text-white ml-1">Confirm Password</label>
                <div className="relative group">
                  <input 
                    {...register("confirmPassword", { 
                      required: "Please confirm your password",
                      validate: (value) => value === password || "Passwords do not match"
                    })} 
                    className="w-full h-12 pl-11 pr-12 bg-[#FDF9F9] dark:bg-[#161212] border-2 border-landing-primary/20 rounded-xl text-landing-text dark:text-white placeholder:text-landing-muted focus:outline-none focus:border-landing-primary focus:ring-2 focus:ring-landing-primary/20 transition-all" 
                    placeholder="••••••••" 
                    type={showConfirmPassword ? "text" : "password"}
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-landing-muted group-focus-within:text-landing-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-landing-muted hover:text-landing-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 ml-1">{errors.confirmPassword.message}</p>}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500/30 rounded-xl animate-shake">
                  <div className="flex items-center gap-2 justify-center">
                    <span className="material-symbols-outlined text-red-600 text-sm">error</span>
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 mt-2 bg-gradient-to-r from-landing-primary to-landing-primary-dark hover:from-landing-primary-dark hover:to-landing-primary text-white font-bold text-base rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center relative z-10">
              <p className="text-sm text-landing-muted">
                Already have an account?{' '}
                <Link to="/login" data-discover="true" className="font-semibold text-landing-primary hover:text-landing-primary-dark transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;