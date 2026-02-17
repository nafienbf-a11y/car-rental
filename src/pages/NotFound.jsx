import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
    const { t, isRTL } = useLanguage();
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <div className={`${isAdmin ? '' : 'min-h-screen bg-[#0a0e27]'} flex items-center justify-center p-4 text-center`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-lg w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-white mb-2">404</h1>
                <h2 className="text-xl font-semibold text-zinc-300 mb-4">{t('notFound.title')}</h2>
                <p className="text-zinc-500 mb-8">
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
