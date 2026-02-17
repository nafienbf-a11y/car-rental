import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en';
import { fr } from '../locales/fr';
import { ar } from '../locales/ar';

const LanguageContext = createContext();

const translations = {
    en,
    fr,
    ar,
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        const savedLanguage = localStorage.getItem('app-language');
        return savedLanguage || 'fr'; // Default to French
    });

    useEffect(() => {
        localStorage.setItem('app-language', language);

        // Update document direction for Arabic
        const dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = language;

        // Optional: Add a class to body for specific styling requirements if needed
        if (language === 'ar') {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
    }, [language]);

    // Translation function
    // Supports nested keys like 'nav.dashboard'
    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                // Fallback to English if key missing in current language
                // Or return key itself if completely missing
                console.warn(`Translation missing for key: ${key} in language: ${language}`);
                return key;
            }
        }

        return value;
    };

    const value = {
        language,
        setLanguage,
        t,
        isRTL: language === 'ar',
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
