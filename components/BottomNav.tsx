import React from 'react';
import { Home, Search, Heart, User } from 'lucide-react';
import { AppView } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface BottomNavProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  const { t } = useLanguage();

  const navItems = [
    { view: AppView.HOME, icon: Home, label: t('nav.home') },
    { view: AppView.SEARCH, icon: Search, label: t('nav.search') },
    { view: AppView.FAVORITES, icon: Heart, label: t('nav.saved') },
    { view: AppView.PROFILE, icon: User, label: t('nav.profile') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-800 px-6 py-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 transition-colors duration-300">
      <div className="flex justify-between items-center w-full md:max-w-3xl lg:max-w-5xl mx-auto h-14">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onChangeView(item.view)}
            className={`flex flex-col items-center justify-center w-16 transition-colors duration-200 ${
              currentView === item.view ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
            }`}
          >
            <item.icon className={`h-6 w-6 ${currentView === item.view ? 'fill-current' : ''}`} strokeWidth={2} />
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;