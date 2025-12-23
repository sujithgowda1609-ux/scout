
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: any) => void;
  onToggle: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit, onToggle }) => {
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-md p-8 glass rounded-3xl space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold tracking-tighter font-serif text-white">
          {type === 'login' ? 'Welcome Back' : 'Join the Elite'}
        </h2>
        <p className="text-white/40 text-sm">
          {type === 'login' 
            ? 'Access your cinematic scouting history' 
            : 'Start your smart shopping journey today'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'register' && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input
            type="password"
            placeholder="Secure Password"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all group shadow-lg shadow-red-900/20 active:scale-95">
          {type === 'login' ? 'Enter Dashboard' : 'Create Account'}
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <div className="text-center">
        <button 
          onClick={onToggle}
          className="text-white/40 text-sm hover:text-white transition-colors"
        >
          {type === 'login' ? "Don't have an account? Register" : "Already a member? Sign in"}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
