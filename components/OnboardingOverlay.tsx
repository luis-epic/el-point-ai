import React, { useState, useEffect } from 'react';
import { MapPin, Search, Heart, Check, X, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface OnboardingOverlayProps {
  onComplete: () => void;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { t, toggleLanguage, language } = useLanguage();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }
  };

  const steps = [
    {
      title: t('onb.step1.title'),
      desc: t('onb.step1.desc'),
      icon: MapPin,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: t('onb.step2.title'),
      desc: t('onb.step2.desc'),
      icon: Search,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: t('onb.step3.title'),
      desc: t('onb.step3.desc'),
      icon: Heart,
      color: "bg-red-100 text-red-600"
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 z-0"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-50 rounded-full -ml-12 -mb-12 z-0"></div>

        {/* Language Toggle in Onboarding */}
        <button 
            onClick={toggleLanguage}
            className="absolute top-4 left-4 z-20 flex items-center space-x-1 bg-white/50 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-gray-600 hover:bg-white transition-colors"
        >
            <Globe className="w-3 h-3" />
            <span>{language === 'en' ? 'English' : 'Español'}</span>
        </button>

        <button 
            onClick={() => { setIsVisible(false); setTimeout(onComplete, 300); }} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-20"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center mt-6">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${steps[step].color} transition-colors duration-500`}>
                {React.createElement(steps[step].icon, { className: "w-10 h-10", strokeWidth: 1.5 })}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3 transition-all duration-300 min-h-[32px]">
                {steps[step].title}
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 min-h-[64px] transition-all duration-300">
                {steps[step].desc}
            </p>

            <div className="flex space-x-2 mb-8">
                {steps.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-brand-600' : 'w-2 bg-gray-200'}`} 
                    />
                ))}
            </div>

            <button 
                onClick={handleNext}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-200 active:scale-95 transition-all flex items-center justify-center"
            >
                {step === steps.length - 1 ? (
                    <>
                        <Check className="w-5 h-5 mr-2" />
                        {t('onb.start')}
                    </>
                ) : (
                    t('onb.next')
                )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverlay;
