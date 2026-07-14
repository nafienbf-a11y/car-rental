import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
    const { t, isRTL } = useLanguage();
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <div className={`${isAdmin ? '' : 'min-h-screen bg-theme-bg'} flex items-center justify-center p-4 text-center transition-colors duration-300`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-lg w-full bg-theme-card border border-theme rounded-2xl p-8 shadow-2xl transition-colors duration-300">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-theme-primary mb-2">404</h1>
                <h2 className="text-xl font-semibold text-theme-secondary mb-4">{t('notFound.title')}</h2>
                <p className="text-theme-tertiary mb-8">
                    {t('notFound.message')}
                </p>

                <Link
                    to={isAdmin ? '/admin' : '/'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue hover:bg-blue-700 text-white rounded-xl transition-all duration-300 font-medium"
                >
                    <Home className="w-5 h-5" />
                    {t('notFound.backHome')}
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
