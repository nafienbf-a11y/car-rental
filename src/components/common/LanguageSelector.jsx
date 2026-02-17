import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LanguageSelector = () => {
    const { language, setLanguage, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const languages = [
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'ar', name: 'العربية', flag: '🇲🇦' },
    ];

    const currentLanguage = languages.find(l => l.code === language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (code) => {
        setLanguage(code);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700 w-full"
            >
                <Globe className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-300 flex-1 text-left">
                    {currentLanguage.name}
                </span>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-full min-w-[160px] bg-[#0a0e27] border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="p-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${language === lang.code
                                    ? 'bg-blue-600/10 text-blue-500'
                                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                                    }`}
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span className="flex-1 text-left">{lang.name}</span>
                                {language === lang.code && (
                                    <Check className="w-4 h-4" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
