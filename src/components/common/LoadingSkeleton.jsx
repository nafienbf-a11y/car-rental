import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = ({ variant = 'card', count = 1 }) => {
    const skeletons = Array.from({ length: count });

    const CardSkeleton = () => (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="h-48 bg-zinc-800/50 rounded-xl animate-pulse" />
            <div className="space-y-3">
                <div className="h-4 bg-zinc-800/50 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-zinc-800/50 rounded animate-pulse w-1/2" />
            </div>
        </div>
    );

    const TableSkeleton = () => (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-zinc-800">
                <div className="h-6 bg-zinc-800/50 rounded animate-pulse w-1/4" />
            </div>
            {skeletons.map((_, i) => (
                <div key={i} className="p-4 border-b border-zinc-800 flex gap-4">
                    <div className="h-4 bg-zinc-800/50 rounded animate-pulse flex-1" />
                    <div className="h-4 bg-zinc-800/50 rounded animate-pulse flex-1" />
                    <div className="h-4 bg-zinc-800/50 rounded animate-pulse flex-1" />
                </div>
            ))}
        </div>
    );

    const StatSkeleton = () => (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-zinc-800/50 rounded animate-pulse w-1/2" />
                    <div className="h-8 bg-zinc-800/50 rounded animate-pulse w-3/4" />
                </div>
                <div className="w-12 h-12 bg-zinc-800/50 rounded-xl animate-pulse" />
            </div>
        </div>
    );

    const renderSkeleton = () => {
        switch (variant) {
            case 'card':
                return <CardSkeleton />;
            case 'table':
                return <TableSkeleton />;
            case 'stat':
                return <StatSkeleton />;
            default:
                return <CardSkeleton />;
        }
    };

    if (variant === 'table') {
        return renderSkeleton();
    }

    return (
        <>
            {skeletons.map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                >
                    {renderSkeleton()}
                </motion.div>
            ))}
        </>
    );
};

export default LoadingSkeleton;
