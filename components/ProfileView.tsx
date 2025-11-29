import React from 'react';
import { UserProfile, HistoryItem, DirectoryItem } from '../types';
import { LogOut, MapPin, Clock, ChevronRight, Languages, Github, Linkedin, Code, Moon, Sun } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileViewProps {
  user: UserProfile;
  history: HistoryItem[];
  favoritesCount: number;
  onLogout: () => void;
  onItemClick: (item: DirectoryItem) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, history, favoritesCount, onLogout, onItemClick }) => {
  const { t, language, toggleLanguage, theme, toggleTheme } = useLanguage();

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-dark-800 flex flex-col items-center text-center relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-brand-50 to-transparent dark:from-brand-900/20 z-0"></div>
        
        <div className="relative z-10 w-24 h-24 rounded-full p-1 bg-white dark:bg-dark-800 shadow-md mb-4 mt-2">
            <img 
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=0ea5e9&color=fff`} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
            />
        </div>
        
        <h2 className="relative z-10 text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
        <p className="relative z-10 text-sm text-gray-500 dark:text-gray-400 mb-6">{user.email}</p>

        <div className="grid grid-cols-2 gap-4 w-full relative z-10">
            <div className="bg-gray-50 dark:bg-dark-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{favoritesCount}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{t('prof.saved')}</div>
            </div>
            <div className="bg-gray-50 dark:bg-dark-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{history.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{t('prof.visited')}</div>
            </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Language Toggle */}
        <div className="bg-white dark:bg-dark-900 rounded-2xl border border-gray-100 dark:border-dark-800 shadow-sm p-4 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg mr-3">
                        <Languages className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{t('prof.language')}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('prof.changeLang.current')}</p>
                    </div>
                </div>
                <button 
                    onClick={toggleLanguage}
                    className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-transform"
                >
                    {language === 'en' ? 'Español' : 'English'}
                </button>
            </div>
        </div>

        {/* Theme Toggle */}
        <div className="bg-white dark:bg-dark-900 rounded-2xl border border-gray-100 dark:border-dark-800 shadow-sm p-4 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg mr-3">
                        {theme === 'dark' ? (
                            <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        ) : (
                             <Sun className="w-5 h-5 text-amber-500" />
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{t('prof.theme')}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                    </div>
                </div>
                 <button 
                    onClick={toggleTheme}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${theme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'}`}
                >
                    <span 
                        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${theme === 'dark' ? 'transform translate-x-6' : ''}`}
                    />
                </button>
            </div>
        </div>
      </div>

      {/* History Section */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                <Clock className="w-4 h-4 mr-2 text-brand-500" />
                {t('prof.recent')}
            </h3>
        </div>

        {history.length === 0 ? (
            <div className="bg-white dark:bg-dark-900 rounded-2xl p-8 text-center border border-gray-100 dark:border-dark-800 border-dashed transition-colors">
                <p className="text-gray-400 dark:text-gray-600 text-sm">{t('prof.emptyHistory')}</p>
            </div>
        ) : (
            <div className="bg-white dark:bg-dark-900 rounded-2xl border border-gray-100 dark:border-dark-800 shadow-sm overflow-hidden transition-colors">
                {history.map((item, index) => (
                    <div 
                        key={`${item.id}-${index}`}
                        onClick={() => onItemClick(item)}
                        className="flex items-center p-4 border-b border-gray-50 dark:border-gray-800 last:border-none hover:bg-gray-50 dark:hover:bg-dark-800 active:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 mr-4">
                            <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{item.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center mt-0.5">
                                <MapPin className="w-3 h-3 mr-1" />
                                {item.address}
                            </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 text-gray-300 dark:text-gray-600">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Logout */}
      <button 
        onClick={onLogout}
        className="w-full flex items-center justify-center p-4 text-red-600 dark:text-red-400 font-medium text-sm bg-red-50 dark:bg-red-900/10 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
      >
        <LogOut className="w-4 h-4 mr-2" />
        {t('prof.signOut')}
      </button>

      {/* DEVELOPER SIGNATURE AREA */}
      <div className="pt-8 pb-4 flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
        <div className="flex items-center space-x-1 text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">
            <Code className="w-3 h-3" />
            <span>{t('prof.dev')}</span>
        </div>
        
   
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-purple-600">
            [Luis Martinez]
        </h3>

        <div className="flex space-x-4 mt-3">
            <a href="https://github.com/luis-epic" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 dark:bg-dark-800 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 hover:text-black transition-colors">
                <Github className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com/in/luisepico/" target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-100 hover:text-blue-800 transition-colors">
                <Linkedin className="w-4 h-4" />
            </a>
        </div>
        <p className="text-[10px] text-gray-400 mt-4">v1.1.0 • El Point AI</p>
      </div>

      <div className="h-20"></div>
    </div>
  );
};

export default ProfileView;