import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../locales/en';
import { ar } from '../locales/ar';
import { fr } from '../locales/fr';
import { es } from '../locales/es';

const LanguageContext = createContext();

const translations = {
    en,
    ar,
    fr,
    es,
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
        return savedLanguage || 'en'; // Default to English
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
    // Also supports parameter substitution: t('key', { name: 'John' })
    const t = (key, params = {}) => {
        if (!key || typeof key !== 'string') return '';
        const keys = key.split('.');
        
        const getValue = (lang) => {
            let val = translations[lang];
            for (const k of keys) {
                if (val && val[k] !== undefined) {
                    val = val[k];
                } else {
                    return undefined;
                }
            }
            return val;
        };

        let value = getValue(language);
        if (value !== undefined) {
            if (typeof value === 'string' && params && Object.keys(params).length > 0) {
                return Object.entries(params).reduce((str, [k, v]) => {
                    return str.replaceAll(`{${k}}`, String(v !== undefined && v !== null ? v : ''));
                }, value);
            }
            return value;
        }

        // Fallback to English
        if (language !== 'en') {
            value = getValue('en');
            if (value !== undefined) {
                console.warn(`Translation missing for key: ${key} in language: ${language}, falling back to English`);
                if (typeof value === 'string' && params && Object.keys(params).length > 0) {
                    return Object.entries(params).reduce((str, [k, v]) => {
                        return str.replaceAll(`{${k}}`, String(v !== undefined && v !== null ? v : ''));
                    }, value);
                }
                return value;
            }
        }

        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        return key;
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
