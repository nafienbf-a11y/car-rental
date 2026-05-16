import React, { useState } from 'react';
import { Car } from 'lucide-react';

const Logo = ({ className = "w-24 h-24", showText = true }) => {
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl ${className}`}>
                <Car className="w-1/3 h-1/3 text-brand-blue mb-1" />
                {showText && (
                    <span className="text-[10px] font-bold text-white tracking-widest text-center leading-tight">
                        GATIBI<br />RENTAL
                    </span>
                )}
            </div>
        );
    }

    return (
        <img
            src="/gatibi_rental_logo_1.png"
            alt="Gatibi Rental"
            className={`${className} rounded-xl object-contain`}
            onError={() => setError(true)}
        />
    );
};

export default Logo;
