'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analytics } from '@/lib/analytics';

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Apply existing preferences
      const savedPrefs = JSON.parse(consent);
      setPreferences(savedPrefs);
      analytics.setTrackingConsent(savedPrefs.analytics);
    }
  }, []);

  const handleAcceptAll = () => {
    const allPrefs: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    
    savePreferences(allPrefs);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const minimalPrefs: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    
    savePreferences(minimalPrefs);
    setShowBanner(false);
  };

  const handleSaveCustom = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowDetails(false);
  };

  const savePreferences = (prefs: ConsentPreferences) => {
    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    localStorage.setItem('consent_timestamp', new Date().toISOString());
    
    // Apply analytics consent
    analytics.setTrackingConsent(prefs.analytics);
    
    // Track consent decision
    if (prefs.analytics) {
      analytics.trackEvent({
        name: 'cookie_consent',
        category: 'privacy',
        action: 'consent_given',
        properties: prefs
      });
    }
  };

  const togglePreference = (key: keyof ConsentPreferences) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !showDetails && setShowBanner(false)}
        />

        {/* Banner */}
        <motion.div
          className="glass max-w-lg w-full p-6 rounded-2xl border border-white/10 pointer-events-auto relative"
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {!showDetails ? (
            // Simple banner
            <>
              <div className="flex items-start gap-4">
                <div className="text-2xl">🍪</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    We value your privacy
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                    We use cookies to enhance your browsing experience, serve personalized content, 
                    and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <motion.button
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  onClick={handleAcceptAll}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Accept All
                </motion.button>
                
                <motion.button
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  onClick={handleRejectAll}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Reject All
                </motion.button>
                
                <motion.button
                  className="text-purple-400 hover:text-purple-300 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  onClick={() => setShowDetails(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Customize
                </motion.button>
              </div>
            </>
          ) : (
            // Detailed preferences
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Cookie Preferences
                </h3>
                <button
                  className="text-zinc-400 hover:text-white"
                  onClick={() => setShowDetails(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 max-h-60 overflow-y-auto">
                {/* Necessary cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-white mb-1">Necessary Cookies</h4>
                    <p className="text-xs text-zinc-400">
                      Essential for the website to function properly. Cannot be disabled.
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="sr-only"
                    />
                    <div className="w-10 h-6 bg-purple-600 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Analytics cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-white mb-1">Analytics Cookies</h4>
                    <p className="text-xs text-zinc-400">
                      Help us understand how visitors interact with our website.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('analytics')}
                    className="relative"
                  >
                    <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                      preferences.analytics ? 'bg-purple-600 justify-end' : 'bg-zinc-600 justify-start'
                    }`}>
                      <div className="w-4 h-4 bg-white rounded-full mx-1" />
                    </div>
                  </button>
                </div>

                {/* Marketing cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-white mb-1">Marketing Cookies</h4>
                    <p className="text-xs text-zinc-400">
                      Used to track visitors across websites for advertising purposes.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('marketing')}
                    className="relative"
                  >
                    <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                      preferences.marketing ? 'bg-purple-600 justify-end' : 'bg-zinc-600 justify-start'
                    }`}>
                      <div className="w-4 h-4 bg-white rounded-full mx-1" />
                    </div>
                  </button>
                </div>

                {/* Preference cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h4 className="font-medium text-white mb-1">Preference Cookies</h4>
                    <p className="text-xs text-zinc-400">
                      Remember your preferences and settings.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('preferences')}
                    className="relative"
                  >
                    <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${
                      preferences.preferences ? 'bg-purple-600 justify-end' : 'bg-zinc-600 justify-start'
                    }`}>
                      <div className="w-4 h-4 bg-white rounded-full mx-1" />
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-white/10">
                <motion.button
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  onClick={handleSaveCustom}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Preferences
                </motion.button>
                
                <motion.button
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  onClick={() => setShowDetails(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>

              <div className="mt-4 text-center">
                <a 
                  href="/privacy-policy" 
                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                >
                  Privacy Policy
                </a>
                {' • '}
                <a 
                  href="/cookie-policy" 
                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                >
                  Cookie Policy
                </a>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Settings component for privacy center
export const PrivacySettings: React.FC = () => {
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (consent) {
      setPreferences(JSON.parse(consent));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('cookie_consent', JSON.stringify(preferences));
    localStorage.setItem('consent_timestamp', new Date().toISOString());
    analytics.setTrackingConsent(preferences.analytics);
    
    // Show success message
    alert('Privacy preferences saved successfully');
  };

  const togglePreference = (key: keyof ConsentPreferences) => {
    if (key === 'necessary') return;
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Privacy Settings</h2>
      
      <div className="space-y-6">
        {Object.entries({
          necessary: {
            title: 'Necessary Cookies',
            description: 'Essential for the website to function properly. Cannot be disabled.',
            required: true
          },
          analytics: {
            title: 'Analytics Cookies',
            description: 'Help us understand how visitors interact with our website by collecting and reporting information anonymously.',
            required: false
          },
          marketing: {
            title: 'Marketing Cookies',
            description: 'Used to track visitors across websites with the intention of displaying ads that are relevant and engaging.',
            required: false
          },
          preferences: {
            title: 'Preference Cookies',
            description: 'Allow the website to remember choices you make and provide enhanced features.',
            required: false
          }
        }).map(([key, config]) => (
          <div key={key} className="glass p-6 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-semibold text-white mb-2">{config.title}</h3>
                <p className="text-sm text-zinc-400">{config.description}</p>
              </div>
              <button
                onClick={() => togglePreference(key as keyof ConsentPreferences)}
                disabled={config.required}
                className="relative"
              >
                <div className={`w-12 h-7 rounded-full flex items-center transition-colors ${
                  preferences[key as keyof ConsentPreferences] 
                    ? 'bg-purple-600 justify-end' 
                    : 'bg-zinc-600 justify-start'
                } ${config.required ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="w-5 h-5 bg-white rounded-full mx-1" />
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex gap-4">
        <button
          onClick={handleSave}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Save Preferences
        </button>
        
        <button
          onClick={() => {
            const consent = localStorage.getItem('cookie_consent');
            if (consent) {
              setPreferences(JSON.parse(consent));
            }
          }}
          className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};