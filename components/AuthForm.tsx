import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { backend } from '../services/backend';
import { UserProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthFormProps {
  onLoginSuccess: (user: UserProfile) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { user, error: authError } = isLogin 
        ? await backend.signIn(email, password)
        : await backend.signUp(email, password);

      if (authError) {
        setError(authError);
      } else if (user) {
        onLoginSuccess(user);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{isLogin ? t('auth.welcome') : t('auth.create')}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 transition-colors">
                {isLogin ? t('auth.signin.desc') : t('auth.signup.desc')}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide transition-colors">{t('auth.email')}</label>
            <div className="relative">
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="name@example.com"
                    required
                />
                <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-3.5 transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide transition-colors">{t('auth.password')}</label>
            <div className="relative">
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                />
                <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-3.5 transition-colors" />
            </div>
          </div>

          {error && (
            <div className="flex items-center text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 transition-colors">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-600 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-brand-200 dark:shadow-none flex items-center justify-center transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
          >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    {isLogin ? t('auth.submit.signin') : t('auth.submit.signup')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
            <button 
                onClick={() => { setError(null); setIsLogin(!isLogin); }}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
            >
                {isLogin ? t('auth.switch.signup') : t('auth.switch.signin')}
            </button>
        </div>
        
        {/* Mock Mode hint */}
        <div className="mt-12 text-center text-[10px] text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-dark-800/50 p-2 rounded-lg transition-colors">
            Developer Note: If no Supabase keys are present, this runs in Mock Mode. You can use any email/password.
        </div>
      </div>
    </div>
  );
};

export default AuthForm;