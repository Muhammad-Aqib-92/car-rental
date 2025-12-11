import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { UserRole } from '../types';
import { Car, ShieldCheck, User, ChevronRight, ArrowRight } from 'lucide-react';

export const AuthPage = () => {
  const { login } = useApp();
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) login(email, role);
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center p-4 overflow-hidden bg-slate-50">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-indigo-600 w-16 h-16 rounded-2xl shadow-xl shadow-indigo-500/30 mb-6 transform -rotate-6">
            <Car className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">DriveEasy</h1>
          <p className="text-slate-500 font-medium">Premium rentals, zero hassle.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-200/50 p-8 border border-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.CLIENT)}
                  className={`relative overflow-hidden group p-4 rounded-2xl border-2 transition-all duration-300 ${
                    role === UserRole.CLIENT
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-slate-100 bg-white hover:border-indigo-200'
                  }`}
                >
                  <div className={`mb-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${role === UserRole.CLIENT ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <User className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <span className={`block font-bold ${role === UserRole.CLIENT ? 'text-indigo-900' : 'text-slate-700'}`}>Client</span>
                    <span className="text-[10px] text-slate-400 font-medium">I want to rent</span>
                  </div>
                  {role === UserRole.CLIENT && <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-indigo-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => setRole(UserRole.OWNER)}
                  className={`relative overflow-hidden group p-4 rounded-2xl border-2 transition-all duration-300 ${
                    role === UserRole.OWNER
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-slate-100 bg-white hover:border-indigo-200'
                  }`}
                >
                  <div className={`mb-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${role === UserRole.OWNER ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <span className={`block font-bold ${role === UserRole.OWNER ? 'text-indigo-900' : 'text-slate-700'}`}>Owner</span>
                    <span className="text-[10px] text-slate-400 font-medium">I have cars</span>
                  </div>
                  {role === UserRole.OWNER && <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-indigo-600" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="group w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Continue
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-slate-400 text-xs font-medium">
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
};