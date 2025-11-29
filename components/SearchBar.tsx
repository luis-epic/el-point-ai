import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, Globe, Mic, MicOff, Moon, Sun } from 'lucide-react';
import { Coordinates } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  location: Coordinates | null;
  locationStatus?: 'prompt' | 'granted' | 'denied';
  onRequestLocation: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, location, locationStatus, onRequestLocation }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const { t, theme, toggleTheme } = useLanguage();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const speech = new (window as any).webkitSpeechRecognition();
      speech.continuous = false;
      speech.interimResults = false;
      speech.lang = 'es-VE'; // Default to Venezuela dialect for better recognition

      speech.onstart = () => setIsListening(true);
      speech.onend = () => setIsListening(false);
      speech.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        onSearch(transcript);
      };

      setRecognition(speech);
    }
  }, [onSearch]);

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const getLocationText = () => {
    if (location) {
        const isCaracas = Math.abs(location.latitude - 10.4806) < 0.01 && Math.abs(location.longitude - (-66.9036)) < 0.01;
        if (isCaracas) return t('loc.caracas');
        return `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`;
    }
    if (locationStatus === 'denied') return t('loc.global');
    return t('loc.tap');
  };

  const getPlaceholder = () => {
    if (isListening) return t('search.placeholder.listening');
    if (locationStatus === 'denied' && !location) return t('search.placeholder.global');
    return t('search.placeholder.nearby');
  };

  return (
    <div className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50 pt-safe w-full transition-colors duration-300">
      <div className="px-4 py-3">
        {/* Location Header Row */}
        <div className="flex items-center justify-between mb-3">
            <button 
                onClick={onRequestLocation}
                className="flex items-center space-x-1.5 px-2 py-1 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-dark-800 transition-colors"
            >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${location ? 'bg-green-500 animate-pulse' : locationStatus === 'denied' ? 'bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <span className={`text-xs font-semibold ${location ? 'text-gray-900 dark:text-white font-mono' : locationStatus === 'denied' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {getLocationText()}
                </span>
            </button>

            <div className="flex items-center space-x-2">
                <div className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded">El Point</div>
                
                {/* Theme Toggle Button */}
                <button 
                    onClick={toggleTheme}
                    className="p-1.5 rounded-full bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors active:scale-95"
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? (
                        <Moon className="w-3.5 h-3.5 fill-current" />
                    ) : (
                        <Sun className="w-3.5 h-3.5 fill-current text-amber-500" />
                    )}
                </button>
            </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="relative group flex items-center">
          <div className="relative flex-1">
             <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={getPlaceholder()}
                className={`w-full pl-11 pr-4 py-3.5 bg-gray-100/80 dark:bg-dark-800/80 border-none rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white dark:focus:bg-dark-800 transition-all text-sm font-medium shadow-inner dark:shadow-none ${isListening ? 'ring-2 ring-red-400/50 bg-red-50 dark:bg-red-900/10' : ''}`}
            />
            <div className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-brand-500 dark:group-focus-within:text-brand-400 transition-colors">
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : locationStatus === 'denied' && !location ? (
                    <Globe className="w-5 h-5" />
                ) : (
                    <Search className="w-5 h-5" />
                )}
            </div>
          </div>
          
          {/* Voice Button */}
          {recognition && (
             <button
                type="button"
                onClick={toggleListening}
                className={`ml-2 p-3.5 rounded-2xl transition-all active:scale-95 ${isListening ? 'bg-red-500 text-white animate-pulse-fast shadow-red-200 shadow-lg' : 'bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-700'}`}
             >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
             </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default SearchBar;