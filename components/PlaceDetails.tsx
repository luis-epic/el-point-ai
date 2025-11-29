import React, { useEffect, useState } from 'react';
import { X, MapPin, Star, Navigation, Heart, Share2, Clock, StickyNote, Save, MessageCircle } from 'lucide-react';
import { DirectoryItem } from '../types';
import { formatDistance } from '../utils/geo';
import { useLanguage } from '../contexts/LanguageContext';

interface PlaceDetailsProps {
  item: DirectoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (item: DirectoryItem) => void;
  onUpdateNote?: (itemId: string, note: string) => void;
}

const PlaceDetails: React.FC<PlaceDetailsProps> = ({ item, isOpen, onClose, isFavorite, onToggleFavorite, onUpdateNote }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [note, setNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (item) {
          setNote(item.userNotes || '');
      }
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300); // Wait for animation
      return () => clearTimeout(timer);
    }
  }, [isOpen, item]);

  const handleShare = async () => {
    if (!item) return;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: item.name,
                text: `Check out ${item.name} on El Point! ${item.address}`,
                url: window.location.href
            });
        } catch (error) {
            console.log("Error sharing:", error);
        }
    } else {
        // Fallback
        navigator.clipboard.writeText(`${item.name} - ${item.address}`);
        alert("Link copied to clipboard!");
    }
  };

  const handleNoteBlur = () => {
      if (item && onUpdateNote && note !== item.userNotes) {
          setIsSavingNote(true);
          onUpdateNote(item.id, note);
          setTimeout(() => setIsSavingNote(false), 1000);
      }
  };

  if (!isVisible && !isOpen) return null;
  if (!item) return null;

  return (
    <div className={`fixed inset-0 z-[60] flex items-end justify-center sm:items-center pointer-events-none`}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`} 
        onClick={onClose}
      />

      {/* Sheet */}
      <div 
        className={`bg-white dark:bg-dark-900 w-full sm:max-w-lg md:max-w-2xl mx-auto rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-transform duration-300 pointer-events-auto flex flex-col max-h-[95vh] ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle for dragging visual */}
        <div className="h-1.5 w-12 bg-gray-300 dark:bg-gray-700 rounded-full self-center mt-3 mb-1 sm:hidden"></div>

        {/* Header Image area */}
        <div className="relative h-56 w-full flex-shrink-0 bg-gray-200 dark:bg-gray-800">
            <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-full object-cover rounded-t-2xl"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/400/300`;
                }}
            />
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-2xl font-bold leading-tight drop-shadow-sm">{item.name}</h2>
                <div className="flex items-center space-x-2 mt-1 text-white/90">
                    <span className="flex items-center bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 px-2 py-0.5 rounded text-xs font-bold text-yellow-300">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {item.rating?.toFixed(1)}
                    </span>
                    {item.distance !== undefined && (
                         <span className="flex items-center bg-brand-500/20 backdrop-blur-md border border-brand-500/30 px-2 py-0.5 rounded text-xs font-bold text-brand-200">
                            <Navigation className="w-3 h-3 mr-1" />
                            {formatDistance(item.distance)}
                        </span>
                    )}
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto no-scrollbar bg-white dark:bg-dark-900 transition-colors duration-300">
            {/* Actions Bar */}
            <div className="flex space-x-3 mb-6">
                <button 
                    onClick={() => onToggleFavorite(item)}
                    className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border transition-all active:scale-95 ${
                        isFavorite 
                            ? 'bg-red-50 border-red-100 text-red-600 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400' 
                            : 'bg-gray-50 border-gray-100 text-gray-600 dark:bg-dark-800 dark:border-gray-700 dark:text-gray-300'
                    }`}
                >
                    <Heart className={`w-6 h-6 mb-1 ${isFavorite ? 'fill-current' : ''}`} />
                    <span className="text-xs font-medium">{isFavorite ? t('det.saved') : t('det.save')}</span>
                </button>
                <button 
                    onClick={handleShare}
                    className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 active:scale-95 hover:bg-gray-100 transition-colors dark:bg-dark-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    <Share2 className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">{t('det.share')}</span>
                </button>
                <a 
                    href={item.googleMapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-[2] flex flex-col items-center justify-center p-3 rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-200 dark:shadow-none active:scale-95 hover:bg-brand-700 transition-colors"
                >
                    <Navigation className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">{t('det.navigate')}</span>
                </a>
            </div>

            {/* Info */}
            <div className="space-y-4">
                <div className="flex items-start text-gray-700 dark:text-gray-300">
                    <MapPin className="w-5 h-5 mr-3 mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{item.address}</span>
                </div>
                
                {/* Mock Hours */}
                <div className="flex items-start text-gray-700 dark:text-gray-300">
                    <Clock className="w-5 h-5 mr-3 mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <div className="text-sm">
                        <span className="text-green-600 dark:text-green-400 font-medium">{t('det.openNow')}</span>
                        <span className="text-gray-400 dark:text-gray-600 mx-1">•</span>
                        <span>{t('det.closes')}</span>
                    </div>
                </div>

                {/* Personal Notes Section */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center">
                            <StickyNote className="w-4 h-4 mr-2 text-brand-500" />
                            {t('det.notes')}
                        </h3>
                        {isSavingNote && <span className="text-xs text-green-500 font-medium flex items-center"><Save className="w-3 h-3 mr-1"/> {t('det.savedNote')}</span>}
                    </div>
                    <textarea 
                        className="w-full bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30 dark:text-yellow-100 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-400 dark:placeholder-yellow-500/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 resize-none min-h-[80px]"
                        placeholder={t('det.notes.placeholder')}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        onBlur={handleNoteBlur}
                    />
                </div>

                {item.description && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t('det.summary')}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {item.description}
                        </p>
                    </div>
                )}
                
                {/* Generated Reviews */}
                {item.reviews && item.reviews.length > 0 && (
                     <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                            <MessageCircle className="w-4 h-4 mr-2 text-brand-500" />
                            {t('det.reviews')}
                        </h3>
                        <div className="space-y-3">
                            {item.reviews.map((rev, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-dark-800 p-3 rounded-2xl rounded-tl-sm text-sm border border-gray-100 dark:border-gray-700 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-gray-800 dark:text-gray-200 text-xs">{rev.author}</span>
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400">{rev.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 italic">"{rev.text}"</p>
                                    <div className="text-[10px] text-gray-400 text-right mt-1">{rev.relativeTime}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                 <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t('det.tags')}</h3>
                    <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, idx) => (
                            <span key={idx} className="bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-xs font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="h-safe pb-4"></div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetails;