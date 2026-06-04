import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { DollarSign, Wrench, Globe, Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import Button from '../components/common/Button';
import { supabase } from '../lib/supabase';

const Reports = () => {
    const { bookings, expenses } = useApp();
    const { t } = useLanguage();
    const [visitorStats, setVisitorStats] = useState([]);
    const [loadingVisitors, setLoadingVisitors] = useState(true);

    useEffect(() => {
        const fetchVisitors = async () => {
            const { data, error } = await supabase
                .from('visitor_stats')
                .select('*')
                .order('visit_date', { ascending: false });

            if (data) setVisitorStats(data);
            setLoadingVisitors(false);
        };
        fetchVisitors();
    }, []);

    // Dynamically calculate monthly financials
    const monthlyFinancials = useMemo(() => {
        const monthsMap = new Map(); // key: "YYYY-MM"

        // Process Bookings (Revenue)
        bookings.forEach(b => {
            if (!b || b.status === 'Cancelled' || (!b.startDate && !b.createdAt)) return;
            const date = new Date(b.startDate || b.createdAt);
            if (isNaN(date.getTime())) return;
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthsMap.has(monthKey)) {
                monthsMap.set(monthKey, { month: monthKey, revenue: 0, expense: 0 });
            }
            monthsMap.get(monthKey).revenue += (b.totalCost || 0);
        });

        // Process Expenses
        expenses.forEach(e => {
            if (!e.date) return;
            const date = new Date(e.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthsMap.has(monthKey)) {
                monthsMap.set(monthKey, { month: monthKey, revenue: 0, expense: 0 });
            }
            monthsMap.get(monthKey).expense += (e.amount || 0);
        });

        // Convert to array and sort by month descending (newest first)
        const sorted = Array.from(monthsMap.values()).sort((a, b) => b.month.localeCompare(a.month));

        // Calculate Profit
        return sorted.map(data => ({
            ...data,
            profit: data.revenue - data.expense
        }));
    }, [bookings, expenses]);

    // Format Month String
    const formatMonth = (monthKey) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold text-theme-primary tracking-tight mb-1">{t('nav.reports')}</h1>
                <p className="text-theme-secondary font-medium tracking-tight">{t('reports.subtitle')}</p>
            </div>

            {/* Monthly Financials Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-xl font-extrabold text-white tracking-tight">{t('reports.monthlyLog')}</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-950">
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('reports.table.month')}</th>
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('reports.table.revenue')}</th>
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('reports.table.expenses')}</th>
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('reports.table.profit')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {monthlyFinancials.map((data) => (
                                <tr key={data.month} className="hover:bg-zinc-900/30 transition-colors">
                                    <td className="p-5 text-left rtl:text-right">
                                        <div className="flex items-center gap-2 text-white font-bold text-sm">
                                            <Calendar className="w-4 h-4 text-brand-blue" />
                                            {formatMonth(data.month)}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-emerald-400 font-black text-sm">{formatCurrency(data.revenue)}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-brand-red font-black text-sm">{formatCurrency(data.expense)}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className={`font-black text-sm ${data.profit >= 0 ? 'text-white' : 'text-orange-500'}`}>
                                            {formatCurrency(data.profit)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {monthlyFinancials.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-zinc-500 text-sm font-medium">
                                        No financial data available yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Daily Visitors Table */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
                    <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-brand-blue" />
                        <h3 className="text-xl font-extrabold text-white tracking-tight">{t('reports.dailyVisitors')}</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-950">
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('reports.table.date')}</th>
                                <th className="text-left p-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t('reports.table.uniqueVisitors')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {loadingVisitors ? (
                                <tr>
                                    <td colSpan="2" className="p-8 text-center text-zinc-500 text-sm font-medium animate-pulse">
                                        Loading visitors...
                                    </td>
                                </tr>
                            ) : visitorStats.length > 0 ? (
                                visitorStats.map((stat) => (
                                    <tr key={stat.id} className="hover:bg-zinc-900/30 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                                <Calendar className="w-4 h-4 text-zinc-500" />
                                                {stat.visit_date}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-brand-blue font-black text-sm">{stat.count} {t('reports.visitors')}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" className="p-8 text-center text-zinc-500 text-sm font-medium">
                                        No visitor tracking data available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
