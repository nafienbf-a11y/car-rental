import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-2.5 bg-theme-input border border-theme rounded-xl text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-brand-blue transition-all font-medium"
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-theme-card rounded-lg transition-colors"
                >
                    <X className="w-3 h-3 text-theme-secondary hover:text-theme-primary" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
