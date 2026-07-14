import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/common/Button';
import LanguageSelector from '../components/common/LanguageSelector';
import { Lock, User, Loader, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/common/Logo';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    if (isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);
        if (result.success) {
            navigate('/admin');
        } else {
            setError(result.error || t('auth.invalidCredentials'));
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-theme-bg flex items-center justify-center p-4 relative transition-colors duration-300">
            {/* Language Selector */}
            <div className="absolute top-4 right-4 w-40 z-50">
                <LanguageSelector />
            </div>
            <div className="w-full max-w-md bg-theme-card border border-theme rounded-2xl p-8 shadow-2xl transition-colors duration-300">
                <div className="flex flex-col items-center mb-8">
                    <Logo className="w-24 h-24 mb-4" />
                    <h1 className="text-2xl font-bold text-theme-primary mb-2">{t('auth.pageTitle')}</h1>
                    <p className="text-theme-secondary text-sm text-center">{t('auth.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-theme-secondary ml-1">{t('auth.username')}</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-tertiary">
                                <User className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-theme-input border border-theme rounded-xl text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-transparent transition-all"
                                placeholder={t('auth.usernamePlaceholder')}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-theme-secondary ml-1">{t('auth.password')}</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-tertiary">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 bg-theme-input border border-theme rounded-xl text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-transparent transition-all"
                                placeholder={t('auth.passwordPlaceholder')}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-tertiary hover:text-theme-primary transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full justify-center py-3 text-base"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                {t('auth.loggingIn')}
                            </>
                        ) : (
                            t('auth.loginButton')
                        )}
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-theme text-center">
                    <p className="text-theme-tertiary text-xs text-center">
                        &copy; 2026 Gatibi Rental. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
