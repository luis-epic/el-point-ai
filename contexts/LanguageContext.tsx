import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es';
type Theme = 'light' | 'dark';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
  theme: Theme;
  toggleTheme: () => void;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.saved': 'Saved',
    'nav.profile': 'Profile',
    
    // Home
    'home.title': 'El Point',
    'home.subtitle': 'Intelligent directory. Find anything, {loc}, with real-time AI grounding.',
    'home.subtitle.loc.nearby': 'nearby',
    'home.subtitle.loc.globally': 'globally',
    'home.explore': 'Explore Nearby',
    'home.global': 'Start Global Search',
    'home.demo': 'Use Demo (Caracas)',
    'home.categories': 'Categories',
    'home.viewAll': 'View All',
    'home.features': 'Features',
    'feat.geo': 'Georeferencing & Map Clustering',
    'feat.sync': 'Supabase Sync',
    'feat.offline': 'Offline Support (PWA)',

    // Categories
    'cat.Restaurants': 'Restaurants',
    'cat.Coffee': 'Coffee',
    'cat.Parks': 'Parks',
    'cat.Gyms': 'Gyms',

    // Search
    'search.placeholder.nearby': 'Search nearby...',
    'search.placeholder.global': 'Search globally...',
    'search.placeholder.listening': 'Listening...',
    'search.globalResults': 'Global Results',
    'search.empty': 'Search to find places',
    'search.map': 'Map',
    'search.list': 'List',
    'search.thisArea': 'Search this area',
    'search.noResults': 'No results found',

    // Favorites
    'fav.title': 'Saved Places',
    'fav.empty.title': 'No favorites yet',
    'fav.empty.desc': 'Start exploring and save the places you want to visit later.',
    'fav.sync': 'Sync',
    'fav.local': 'Local',

    // Profile
    'prof.saved': 'Saved Places',
    'prof.visited': 'Visited',
    'prof.recent': 'Recent History',
    'prof.emptyHistory': "You haven't viewed any places yet.",
    'prof.signOut': 'Sign Out',
    'prof.language': 'Language',
    'prof.changeLang': 'Switch to Spanish', 
    'prof.changeLang.current': 'English',
    'prof.theme': 'Appearance',
    'prof.theme.dark': 'Dark Mode',
    'prof.dev': 'Designed & Developed by',
    'prof.portfolio': 'View Portfolio',

    // Details
    'det.save': 'Save',
    'det.saved': 'Saved',
    'det.share': 'Share',
    'det.navigate': 'Navigate',
    'det.openNow': 'Open Now',
    'det.closes': 'Closes 10 PM',
    'det.notes': 'My Notes',
    'det.notes.placeholder': "Add a personal note (e.g. 'Best cheesecake here')...",
    'det.savedNote': 'Saved',
    'det.summary': 'AI Summary',
    'det.tags': 'Tags',
    'det.reviews': 'What people say',

    // Location
    'loc.global': 'Global Search',
    'loc.tap': 'Tap to set location',
    'loc.caracas': 'Caracas, VE',
    'loc.failed': 'Location Failed',

    // Auth
    'auth.welcome': 'Welcome Back',
    'auth.create': 'Create Account',
    'auth.signin.desc': 'Sign in to access your saved places.',
    'auth.signup.desc': 'Join El Point to sync your history.',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.submit.signin': 'Sign In',
    'auth.submit.signup': 'Create Account',
    'auth.switch.signup': "Don't have an account? Sign up",
    'auth.switch.signin': "Already have an account? Sign in",

    // Onboarding
    'onb.step1.title': 'Find Nearby Places',
    'onb.step1.desc': 'Allow location access to find hidden gems, restaurants, and parks around you instantly.',
    'onb.step2.title': 'Ask the AI',
    'onb.step2.desc': "Use natural language or voice. Ask 'Where is the best pizza nearby?' and get real results.",
    'onb.step3.title': 'Save Your Favorites',
    'onb.step3.desc': 'Build your personal directory. Save places you love and access them anytime, offline.',
    'onb.next': 'Next',
    'onb.start': 'Get Started',
  },
  es: {
    // Nav
    'nav.home': 'Inicio',
    'nav.search': 'Buscar',
    'nav.saved': 'Mis Points',
    'nav.profile': 'Perfil',

    // Home
    'home.title': 'El Point',
    'home.subtitle': 'El directorio que no juega. Encuentra lo que sea, {loc}, con IA de pana.',
    'home.subtitle.loc.nearby': 'por aquí mismo',
    'home.subtitle.loc.globally': 'donde sea',
    'home.explore': 'Ver qué hay cerca',
    'home.global': 'Buscar por ahí',
    'home.demo': 'Pruébalo en Caracas',
    'home.categories': 'Categorías',
    'home.viewAll': 'Ver Todo',
    'home.features': '¿Qué trae esto?',
    'feat.geo': 'Mapa Inteligente',
    'feat.sync': 'Sincronización Supabase',
    'feat.offline': 'Funciona sin señal (PWA)',

    // Categories
    'cat.Restaurants': 'Para comer',
    'cat.Coffee': 'Un cafecito',
    'cat.Parks': 'Parques',
    'cat.Gyms': 'Gimnasios',

    // Search
    'search.placeholder.nearby': '¿Qué provoca hoy?',
    'search.placeholder.global': 'Busca un point en otro lado...',
    'search.placeholder.listening': 'Te escucho...',
    'search.globalResults': 'Resultados Mundiales',
    'search.empty': 'Busca para encontrar el point',
    'search.map': 'Mapa',
    'search.list': 'Lista',
    'search.thisArea': 'Buscar en esta zona',
    'search.noResults': 'No conseguí nada',

    // Favorites
    'fav.title': 'Mis Points Guardados',
    'fav.empty.title': 'Todavía no tienes points',
    'fav.empty.desc': 'Explora y guarda los sitios finos pa\' ir luego.',
    'fav.sync': 'Sinc',
    'fav.local': 'Local',

    // Profile
    'prof.saved': 'Points Guardados',
    'prof.visited': 'Visitados',
    'prof.recent': 'Historial',
    'prof.emptyHistory': "No has visto nada todavía.",
    'prof.signOut': 'Cerrar Sesión',
    'prof.language': 'Idioma / Language',
    'prof.changeLang': 'Switch to English',
    'prof.changeLang.current': 'Español (VE)',
    'prof.theme': 'Apariencia',
    'prof.theme.dark': 'Modo Noche',
    'prof.dev': 'Diseñado y Desarrollado por',
    'prof.portfolio': 'Ver Portafolio',

    // Details
    'det.save': 'Guardar Point',
    'det.saved': 'Guardado',
    'det.share': 'Pasar dato',
    'det.navigate': 'Llégate',
    'det.openNow': 'Abierto',
    'det.closes': 'Cierra 10 PM',
    'det.notes': 'Mis Notas',
    'det.notes.placeholder': "Escribe un dato (ej: 'Pide la hamburguesa doble')...",
    'det.savedNote': '¡Listo!',
    'det.summary': 'Resumen de la IA',
    'det.tags': 'Etiquetas',
    'det.reviews': 'Qué dice la gente',

    // Location
    'loc.global': 'Búsqueda Global',
    'loc.tap': 'Activar ubicación',
    'loc.caracas': 'Caracas, VE',
    'loc.failed': 'Fallo de GPS',

    // Auth
    'auth.welcome': '¡Epa! Bienvenido',
    'auth.create': 'Crear Cuenta',
    'auth.signin.desc': 'Inicia sesión para ver tus points.',
    'auth.signup.desc': 'Únete a El Point para no perder tu historial.',
    'auth.email': 'Correo',
    'auth.password': 'Contraseña',
    'auth.submit.signin': 'Entrar',
    'auth.submit.signup': 'Registrarse',
    'auth.switch.signup': "¿Nuevo aquí? Regístrate",
    'auth.switch.signin': "¿Ya tienes cuenta? Entra",

    // Onboarding
    'onb.step1.title': 'Encuentra el Point',
    'onb.step1.desc': 'Activa el GPS para descubrir los mejores sitios, comida y parches cerca de ti.',
    'onb.step2.title': 'Pregúntale a la IA',
    'onb.step2.desc': "Habla claro. Pregunta '¿Dónde venden las mejores empanadas?' y la IA te dice.",
    'onb.step3.title': 'Arma tu Ruta',
    'onb.step3.desc': 'Guarda tus sitios favoritos para que no se te pierdan y revísalos cuando quieras.',
    'onb.next': 'Dale pues',
    'onb.start': 'Arrancar',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('geodir_lang');
    return (saved === 'en' || saved === 'es') ? saved : 'en';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('geodir_theme');
    // Check system preference if no saved theme
    if (!saved) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return (saved === 'dark') ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('geodir_lang', language);
  }, [language]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('geodir_theme', theme);
  }, [theme]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, theme, toggleTheme }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};