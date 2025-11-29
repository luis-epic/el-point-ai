import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppView, Coordinates, DirectoryItem, UserProfile, HistoryItem } from './types';
import { searchPlaces } from './services/geminiService';
import { backend } from './services/backend';
import { calculateDistance } from './utils/geo';
import BottomNav from './components/BottomNav';
import SearchBar from './components/SearchBar';
import PlaceCard from './components/PlaceCard';
import FilterChips from './components/FilterChips';
import MapView from './components/MapView';
import PlaceDetails from './components/PlaceDetails';
import SkeletonCard from './components/SkeletonCard';
import AuthForm from './components/AuthForm';
import ProfileView from './components/ProfileView';
import OnboardingOverlay from './components/OnboardingOverlay';
import { MapPin, Navigation, Database, Cloud, Zap, Layers, Globe, AlertCircle, Map as MapIcon, List, WifiOff, Heart, Search } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

const App: React.FC = () => {
  // --- Global State ---
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // --- Location State ---
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [error, setError] = useState<string | null>(null);
  
  // --- Data State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DirectoryItem[]>([]);
  const [favorites, setFavorites] = useState<DirectoryItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // --- UI State ---
  const [searchViewMode, setSearchViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<DirectoryItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { t, language, toggleLanguage } = useLanguage();

  const filters = ['All', 'Top Rated', 'Nearest', '< 2km', 'Open Now'];

  // --- Initialization ---

  useEffect(() => {
    // 1. Check for logged in user
    const currentUser = backend.getCurrentUser();
    if (currentUser) setUser(currentUser);

    // 2. Load Data
    const loadData = async () => {
      try {
        const favs = await backend.getFavorites();
        const hist = await backend.getHistory();
        setFavorites(favs);
        setHistory(hist);
      } catch (e) {
        console.warn("Failed to load initial data", e);
      }
    };
    loadData();

    // 3. Check Onboarding Status
    const hasSeenOnboarding = localStorage.getItem('geodir_onboarding_completed');
    if (!hasSeenOnboarding) {
        setShowOnboarding(true);
    }

    // 4. Offline Listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };

  }, [user]);

  // --- History Handling (Back Button) ---
  useEffect(() => {
    // Push state when details open
    if (isDetailsOpen) {
      window.history.pushState({ modal: 'details' }, '');
    }
  }, [isDetailsOpen]);

  useEffect(() => {
    // Push state when view changes from HOME
    if (currentView !== AppView.HOME && !isDetailsOpen) {
      // Only push if we aren't just closing a modal which might trigger a view update
      window.history.pushState({ view: currentView }, '');
    }
  }, [currentView]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Priority 1: Close Modal if Open
      if (isDetailsOpen) {
        setIsDetailsOpen(false);
        setSelectedItem(null);
        return; 
      }
      
      // Priority 2: Return to Home if on another view
      if (currentView !== AppView.HOME) {
        setCurrentView(AppView.HOME);
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDetailsOpen, currentView]);


  const handleOnboardingComplete = () => {
      localStorage.setItem('geodir_onboarding_completed', 'true');
      setShowOnboarding(false);
  };

  // --- Handlers ---

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await backend.signOut();
    setUser(null);
    setFavorites([]);
    setHistory([]);
    setCurrentView(AppView.HOME);
  };

  const toggleFavorite = useCallback(async (item: DirectoryItem) => {
    try {
      const isFav = favorites.some(f => f.id === item.id);
      let newFavs: DirectoryItem[];
      
      if (isFav) {
        await backend.removeFavorite(item.id);
        newFavs = favorites.filter(f => f.id !== item.id);
      } else {
        await backend.addFavorite(item);
        newFavs = [...favorites, item];
      }
      setFavorites(newFavs);
    } catch (e) {
      console.error("Error toggling favorite", e);
    }
  }, [favorites]);

  const handleUpdateNote = useCallback(async (itemId: string, note: string) => {
      // Persist to backend
      await backend.updateNote(itemId, note);
      
      // Update local state to reflect change immediately
      setFavorites(prev => prev.map(f => f.id === itemId ? { ...f, userNotes: note } : f));
      setSearchResults(prev => prev.map(r => r.id === itemId ? { ...r, userNotes: note } : r));
      if (selectedItem?.id === itemId) {
          setSelectedItem(prev => prev ? { ...prev, userNotes: note } : null);
      }
  }, [selectedItem]);

  const handleItemClick = async (item: DirectoryItem) => {
      setSelectedItem(item);
      setIsDetailsOpen(true);
      
      try {
          await backend.addToHistory(item);
          const newHistory = await backend.getHistory();
          setHistory(newHistory);
      } catch (e) {
          console.warn("Failed to add history");
      }
  };

  const handleLocationRequest = useCallback(() => {
    setError(null);
    if ('geolocation' in navigator) {
      console.log("Requesting location...");
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location granted:", position.coords);
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus('granted');
        },
        (err) => {
          let errorMessage = "Unknown error";
          switch(err.code) {
            case 1: errorMessage = "Permission denied. Enable location in settings."; break;
            case 2: errorMessage = "Position unavailable."; break;
            case 3: errorMessage = "Request timed out."; break;
            default: errorMessage = err.message || "Unknown error";
          }
          console.log(`Location error: ${errorMessage}`);
          setLocationStatus('denied');
          setUserLocation(null);
          setError(errorMessage); 
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      setLocationStatus('denied');
      setError("Geolocation is not supported.");
    }
  }, []);

  const handleSimulateLocation = () => {
      const mockLocation = { latitude: 10.4806, longitude: -66.9036 };
      setUserLocation(mockLocation);
      setLocationStatus('granted');
      setError(null);
      setCurrentView(AppView.SEARCH);
  };

  useEffect(() => {
    handleLocationRequest();
  }, [handleLocationRequest]);

  useEffect(() => {
    if (userLocation && searchResults.length > 0) {
      setSearchResults(prev => prev.map(item => {
        if (item.latitude && item.longitude) {
          return {
            ...item,
            distance: calculateDistance(userLocation, { latitude: item.latitude, longitude: item.longitude })
          };
        }
        return item;
      }));
    }
  }, [userLocation]);

  const handleSearch = async (query: string, overrideLocation?: Coordinates) => {
    setSearchQuery(query);
    setCurrentView(AppView.SEARCH);
    setIsSearching(true);
    setAiSummary(null);
    setError(null);
    setHasSearched(true);

    if (!overrideLocation) setActiveFilter('All'); // Reset filter only on new text search, not map drag
    
    // Don't clear results if searching area, allows smooth transition
    if(!overrideLocation) setSearchResults([]); 

    const locToUse = overrideLocation || userLocation;

    try {
      const { text, items } = await searchPlaces(query, locToUse);
      
      const processedItems = items.map(item => {
        if (userLocation && item.latitude && item.longitude) {
          return {
            ...item,
            distance: calculateDistance(userLocation, { latitude: item.latitude, longitude: item.longitude })
          };
        }
        return item;
      });

      setSearchResults(processedItems);
      setAiSummary(text);
    } catch (err: any) {
      console.error("Search failed:", err);
      setError("Failed to fetch places.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchArea = (center: Coordinates) => {
      // Trigger search with map center
      const q = searchQuery || "Places"; // Fallback if query empty
      handleSearch(q, center);
  };

  // Filter Logic
  const filteredResults = useMemo(() => {
    let res = [...searchResults];
    
    switch (activeFilter) {
      case 'Top Rated':
        res = res.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'Nearest':
        res = res.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
        break;
      case '< 2km':
        res = res.filter(i => (i.distance || 9999) < 2);
        break;
      default:
        break;
    }
    return res;
  }, [searchResults, activeFilter]);


  // --- Render Functions ---

  const renderHome = () => (
    <div className="p-4 space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-brand-600 to-brand-900 rounded-3xl p-6 text-white shadow-xl shadow-brand-900/20 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-500/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{t('home.title')}</h1>
            
            {/* Interactive Language Toggle */}
            <button 
                onClick={toggleLanguage}
                className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase flex items-center transition-all cursor-pointer backdrop-blur-sm active:scale-95 border border-white/10"
            >
                <Globe className="w-3 h-3 mr-1.5" />
                {language === 'en' ? 'EN' : 'ES'}
            </button>
          </div>
          <p className="text-brand-100 text-sm mb-6 leading-relaxed opacity-90 max-w-lg">
            {t('home.subtitle').replace('{loc}', userLocation ? t('home.subtitle.loc.nearby') : t('home.subtitle.loc.globally'))}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
                onClick={() => {
                    if (userLocation || locationStatus === 'denied') {
                        setCurrentView(AppView.SEARCH);
                    } else {
                        handleLocationRequest();
                        setCurrentView(AppView.SEARCH);
                    }
                }}
                className="w-full sm:w-auto px-6 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-brand-700 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center group"
            >
                {locationStatus === 'denied' && !userLocation ? (
                  <Globe className="w-4 h-4 mr-2" />
                ) : (
                  <Navigation className="w-4 h-4 mr-2 group-hover:rotate-45 transition-transform" />
                )}
                {locationStatus === 'denied' && !userLocation ? t('home.global') : t('home.explore')}
            </button>
            
            {!userLocation && (
                 <button 
                 onClick={handleSimulateLocation}
                 className="w-full sm:w-auto px-6 bg-transparent border border-white/10 text-brand-100 hover:text-white py-2 rounded-xl text-xs transition-all flex items-center justify-center"
             >
                 <MapPin className="w-3 h-3 mr-2" />
                 {t('home.demo')}
             </button>
            )}
          </div>
        </div>
      </div>

      {error && !userLocation && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-4 flex items-start space-x-3 transition-colors">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                  <h3 className="text-sm font-bold text-red-800 dark:text-red-400">{t('loc.failed')}</h3>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-1">{error}</p>
              </div>
          </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('home.categories')}</h2>
            <span className="text-xs text-brand-600 dark:text-brand-400 font-medium cursor-pointer hover:underline">{t('home.viewAll')}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Restaurants', key: 'cat.Restaurants', icon: '🍔' },
              { name: 'Coffee', key: 'cat.Coffee', icon: '☕' },
              { name: 'Parks', key: 'cat.Parks', icon: '🌳' },
              { name: 'Gyms', key: 'cat.Gyms', icon: '💪' }
            ].map((cat) => (
                <button
                    key={cat.name}
                    onClick={() => handleSearch(cat.name)}
                    className="bg-white dark:bg-dark-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-800 text-left hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-md transition-all active:scale-95 flex flex-col items-start h-full"
                >
                    <span className="text-2xl mb-2 block">{cat.icon}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{t(cat.key)}</span>
                </button>
            ))}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-dark-800 transition-colors">
        <div className="flex items-center space-x-3 mb-3">
            <div className="bg-brand-50 dark:bg-brand-900/20 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">{t('home.features')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-600" />
                <span>{t('feat.geo')}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Database className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-600" />
                <span>{t('feat.sync')}</span>
            </div>
             <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Cloud className="w-4 h-4 mr-3 text-gray-400 dark:text-gray-600" />
                <span>{t('feat.offline')}</span>
            </div>
        </div>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="flex flex-col h-full animate-fade-in">
      <FilterChips filters={filters} activeFilter={activeFilter} onSelect={setActiveFilter} />

      {aiSummary && searchViewMode === 'LIST' && !isSearching && (
        <div className="mx-4 mt-4 bg-gradient-to-r from-brand-50 to-white dark:from-brand-900/30 dark:to-dark-800 px-5 py-4 rounded-2xl border border-brand-100/50 dark:border-brand-800/30 shadow-sm flex-shrink-0 animate-slide-up transition-colors">
          <div className="flex items-start space-x-3">
            <Cloud className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed line-clamp-3">
              {aiSummary}
            </p>
          </div>
        </div>
      )}

      {/* Map/List Toggle */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40">
        <button 
          onClick={() => setSearchViewMode(prev => prev === 'LIST' ? 'MAP' : 'LIST')}
          className="bg-gray-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-gray-900 px-5 py-3 rounded-full shadow-xl flex items-center space-x-2 active:scale-95 transition-transform hover:scale-105 border border-white/10 dark:border-gray-900/10"
        >
          {searchViewMode === 'LIST' ? (
            <>
              <MapIcon className="w-4 h-4" />
              <span className="text-sm font-bold">{t('search.map')}</span>
            </>
          ) : (
             <>
              <List className="w-4 h-4" />
              <span className="text-sm font-bold">{t('search.list')}</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {searchViewMode === 'MAP' ? (
            <div className="h-full w-full">
                <MapView 
                    userLocation={userLocation} 
                    items={filteredResults} 
                    onSelectItem={handleItemClick}
                    onSearchArea={handleSearchArea}
                />
            </div>
        ) : (
            <div className="h-full overflow-y-auto px-4 pt-4 pb-24">
                 {!userLocation && !error && filteredResults.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl text-xs font-medium flex items-center border border-blue-100 dark:border-blue-900/30 mb-4 transition-colors">
                        <Globe className="w-3 h-3 mr-2" />
                        {t('search.globalResults')}
                    </div>
                )}

                {isSearching ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                   </div>
                ) : filteredResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredResults.map((item, index) => (
                          <div key={item.id} className={`stagger-${(index % 5) + 1} animate-slide-up h-full`}>
                              <PlaceCard 
                                  item={item} 
                                  isFavorite={favorites.some(f => f.id === item.id)}
                                  onToggleFavorite={toggleFavorite}
                                  onClick={() => handleItemClick(item)}
                              />
                          </div>
                      ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <div className="bg-gray-100 dark:bg-dark-800 p-6 rounded-full mb-4 transition-colors">
                            {hasSearched ? <Search className="w-8 h-8 text-gray-400" /> : <MapPin className="w-8 h-8 text-gray-400" />}
                        </div>
                        <p className="text-gray-500 font-medium">{hasSearched ? t('search.noResults') : t('search.empty')}</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('fav.title')}</h2>
        <div className={`flex items-center text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wide ${backend.isUsingSupabase() ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
            <Database className="w-3 h-3 mr-1" />
            <span>{backend.isUsingSupabase() ? t('fav.sync') : t('fav.local')}</span>
        </div>
      </div>
      
      {favorites.length === 0 ? (
        <div className="text-center py-24 px-6">
           <div className="bg-gray-100 dark:bg-dark-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
                <Heart className="w-8 h-8 text-gray-400" />
           </div>
          <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">{t('fav.empty.title')}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('fav.empty.desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((item, index) => (
                <div key={item.id} className={`stagger-${(index % 5) + 1} animate-slide-up h-full`}>
                    <PlaceCard 
                        item={item} 
                        isFavorite={true}
                        onToggleFavorite={toggleFavorite}
                        onClick={() => handleItemClick(item)}
                    />
                </div>
            ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => {
    if (!user) {
        return <AuthForm onLoginSuccess={handleLoginSuccess} />;
    }
    return (
        <ProfileView 
            user={user} 
            history={history} 
            favoritesCount={favorites.length} 
            onLogout={handleLogout}
            onItemClick={handleItemClick}
        />
    );
  };

  return (
    // Updated container to be responsive: w-full for mobile, max-w-3xl for tablets, max-w-5xl for desktops
    // ADDED dark mode classes
    <div className="h-full flex flex-col bg-gray-50 dark:bg-black w-full md:max-w-3xl lg:max-w-5xl mx-auto shadow-2xl relative border-x border-gray-200/50 dark:border-dark-800/50 transition-colors duration-300">
      
      {/* Offline Indicator */}
      {isOffline && (
        <div className="bg-gray-900 dark:bg-red-900 text-white text-[10px] font-bold text-center py-1 flex items-center justify-center">
            <WifiOff className="w-3 h-3 mr-1" />
            OFFLINE MODE
        </div>
      )}

      {showOnboarding && <OnboardingOverlay onComplete={handleOnboardingComplete} />}

      <SearchBar 
        onSearch={handleSearch} 
        isLoading={isSearching} 
        location={userLocation}
        locationStatus={locationStatus}
        onRequestLocation={handleLocationRequest}
      />

      <div className="flex-1 overflow-hidden">
        {currentView === AppView.HOME && <div className="h-full overflow-y-auto no-scrollbar pb-20">{renderHome()}</div>}
        {currentView === AppView.SEARCH && renderSearch()}
        {currentView === AppView.FAVORITES && <div className="h-full overflow-y-auto no-scrollbar pb-20">{renderFavorites()}</div>}
        {currentView === AppView.PROFILE && <div className="h-full overflow-y-auto no-scrollbar pb-20">{renderProfile()}</div>}
      </div>

      <BottomNav currentView={currentView} onChangeView={setCurrentView} />

      <PlaceDetails 
        item={selectedItem} 
        isOpen={isDetailsOpen} 
        onClose={() => {
            // Manually closing via UI should go back in history if we pushed state
            // But to avoid complexity, we just close state, and the popstate listener won't fire 
            // unless we do history.back(). 
            // For a smoother UX we typically just set state false.
            setIsDetailsOpen(false);
        }}
        isFavorite={selectedItem ? favorites.some(f => f.id === selectedItem.id) : false}
        onToggleFavorite={toggleFavorite}
        onUpdateNote={handleUpdateNote}
      />
    </div>
  );
};

export default App;