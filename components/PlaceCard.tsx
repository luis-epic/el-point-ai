import React from 'react';
import { MapPin, Star, Navigation, Heart } from 'lucide-react';
import { DirectoryItem } from '../types';
import { formatDistance } from '../utils/geo';

interface PlaceCardProps {
  item: DirectoryItem;
  isFavorite: boolean;
  onToggleFavorite: (item: DirectoryItem) => void;
  onClick?: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ item, isFavorite, onToggleFavorite, onClick }) => {
  return (
    <div 
        onClick={onClick}
        className="bg-white dark:bg-dark-800 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-none dark:border-dark-800 border border-gray-100 overflow-hidden active:scale-[0.98] transition-all duration-200 flex flex-col h-full cursor-pointer hover:shadow-md animate-fade-in group"
    >
      <div className="relative h-44 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
              // Fallback if AI image fails
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/400/300`;
          }}
        />
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/50 to-transparent"></div>
        
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item);
            }}
            className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-90 ${
              isFavorite 
                ? 'bg-white text-red-500 shadow-sm' 
                : 'bg-black/20 text-white hover:bg-black/40'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} strokeWidth={isFavorite ? 0 : 2} />
          </button>
        </div>

        {item.distance !== undefined && (
             <div className="absolute top-3 left-3 bg-brand-600/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white text-xs font-bold shadow-sm flex items-center">
                <Navigation className="w-3 h-3 mr-1 fill-current" />
                {formatDistance(item.distance)}
            </div>
        )}

        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
            <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-gray-900 text-xs font-bold flex items-center shadow-sm">
                <Star className="w-3 h-3 text-yellow-500 mr-1 fill-current" />
                {item.rating?.toFixed(1)}
            </div>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 leading-tight line-clamp-1">{item.name}</h3>
        </div>
        
        <div className="flex items-start text-gray-500 dark:text-gray-400 text-sm mb-3 min-h-[20px]">
          <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
          <p className="line-clamp-1 text-xs">{item.address}</p>
        </div>

        {item.description && (
            <div className="bg-gray-50 dark:bg-dark-900 rounded-lg p-2.5 mb-2 border border-gray-100 dark:border-dark-800">
                <p className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 leading-relaxed">
                    "{item.description}"
                </p>
            </div>
        )}
        
        <div className="mt-auto pt-2 flex items-center text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wide">
            View Details
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;