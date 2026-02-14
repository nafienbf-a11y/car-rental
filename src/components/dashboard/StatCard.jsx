import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'neutral' }) => {
    const colorClasses = {
        neutral: 'bg-zinc-900 border-zinc-800 text-white',
        blue: 'bg-zinc-900 border-zinc-800 text-brand-blue',
        red: 'bg-zinc-900 border-zinc-800 text-brand-red',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
            className="bg-zinc-950 rounded-2xl p-6 border border-zinc-800 shadow-2xl hover:border-zinc-700 transition-all duration-300"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-2">{title}</p>
                    <h3 className="text-3xl font-extrabold text-white tracking-tight mb-3">{value}</h3>

                    {trend && (
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${trend === 'up' ? 'text-brand-blue' : 'text-brand-red'
                                }`}>
                                {trend === 'up' ? '↑' : '↓'} {trendValue}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">vs last month</span>
                        </div>
                    )}
                </div>

                <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${colorClasses[color]}`}>
                    <Icon className="w-7 h-7" />
                </div>
            </div>
        </motion.div>
    );
};

export default StatCard;
