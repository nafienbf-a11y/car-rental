import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon: Icon,
    onClick,
    className = '',
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-brand-blue hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10',
        secondary: 'bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800',
        success: 'bg-brand-blue hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10',
        danger: 'bg-brand-red hover:bg-red-700 text-white shadow-lg shadow-red-500/10',
        warning: 'bg-brand-red hover:bg-red-700 text-white shadow-lg shadow-red-500/10',
        ghost: 'hover:bg-zinc-900 text-zinc-400 hover:text-white',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-4 py-2 text-base gap-2',
        lg: 'px-6 py-3 text-lg gap-2.5',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
            onClick={onClick}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <>
                    {Icon && <Icon className="w-5 h-5" />}
                    {children}
                </>
            )}
        </motion.button>
    );
};

export default Button;
