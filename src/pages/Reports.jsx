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
    const [visitorPage, setVisitorPage] = useState(1);
    const [visitorItemsPerPage, setVisitorItemsPerPage] = useState(10);

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

    const visitorTotalPages = Math.ceil(visitorStats.length / visitorItemsPerPage) || 1;

    const paginatedVisitorStats = useMemo(() => {
        const start = (visitorPage - 1) * visitorItemsPerPage;
        return visitorStats.slice(start, start + visitorItemsPerPage);
    }, [visitorStats, visitorPage, visitorItemsPerPage]);

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
            <div className="bg-theme-card border border-theme rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-theme flex items-center justify-between bg-theme-card">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-xl font-extrabold text-theme-primary tracking-tight">{t('reports.monthlyLog')}</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-theme bg-theme-subcard">
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-theme-secondary uppercase tracking-widest">{t('reports.table.month')}</th>
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-theme-secondary uppercase tracking-widest">{t('reports.table.revenue')}</th>
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-theme-secondary uppercase tracking-widest">{t('reports.table.expenses')}</th>
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-theme-secondary uppercase tracking-widest">{t('reports.table.profit')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme">
                            {monthlyFinancials.map((data) => (
                                <tr key={data.month} className="hover:bg-theme-input/40 transition-colors">
                                    <td className="p-5 text-left rtl:text-right">
                                        <div className="flex items-center gap-2 text-theme-primary font-bold text-sm">
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
                                        <span className={`font-black text-sm ${data.profit >= 0 ? 'text-theme-primary' : 'text-orange-500'}`}>
                                            {formatCurrency(data.profit)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {monthlyFinancials.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-theme-secondary text-sm font-medium">
                                        No financial data available yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Daily Visitors Table */}
            <div className="bg-theme-card border border-theme rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-theme flex flex-col sm:flex-row items-center justify-between gap-4 bg-theme-card">
                    <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-brand-blue" />
                        <h3 className="text-xl font-extrabold text-theme-primary tracking-tight">{t('reports.dailyVisitors')}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-theme-secondary text-[10px] font-bold uppercase tracking-widest">{t('common.showLabel') || 'Show'}:</span>
                        <select
                            value={visitorItemsPerPage}
                            onChange={(e) => {
                                setVisitorItemsPerPage(Number(e.target.value));
                                setVisitorPage(1);
                            }}
                            className="bg-theme-input border border-theme text-theme-primary rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-brand-blue cursor-pointer"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={999999}>{t('common.allRows') || 'All'}</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-theme bg-theme-subcard">
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-theme-secondary uppercase tracking-widest">{t('reports.table.date')}</th>
                                <th className="text-left rtl:text-right p-5 text-[10px] font-black text-theme-secondary uppercase tracking-widest">{t('reports.table.uniqueVisitors')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme">
                            {loadingVisitors ? (
                                <tr>
                                    <td colSpan="2" className="p-8 text-center text-theme-secondary text-sm font-medium animate-pulse">
                                        Loading visitors...
                                    </td>
                                </tr>
                            ) : paginatedVisitorStats.length > 0 ? (
                                paginatedVisitorStats.map((stat) => (
                                    <tr key={stat.id} className="hover:bg-theme-input/40 transition-colors">
                                        <td className="p-5 text-left rtl:text-right">
                                            <div className="flex items-center gap-2 text-theme-primary font-bold text-sm">
                                                <Calendar className="w-4 h-4 text-theme-secondary" />
                                                {stat.visit_date}
                                            </div>
                                        </td>
                                        <td className="p-5 text-left rtl:text-right">
                                            <span className="text-brand-blue font-black text-sm">{stat.count} {t('reports.visitors')}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="2" className="p-8 text-center text-theme-secondary text-sm font-medium">
                                        No visitor tracking data available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loadingVisitors && visitorStats.length > 0 && (
                    <div className="p-4 border-t border-theme flex flex-col sm:flex-row items-center justify-between gap-4 bg-theme-subcard">
                        <p className="text-xs text-theme-secondary">
                            {t('common.showing') || 'Showing'} <span className="font-bold text-theme-primary">{((visitorPage - 1) * visitorItemsPerPage) + 1}</span> {t('common.to') || 'to'} <span className="font-bold text-theme-primary">{Math.min(visitorPage * visitorItemsPerPage, visitorStats.length)}</span> {t('common.of') || 'of'} <span className="font-bold text-theme-primary">{visitorStats.length}</span> {t('common.entries') || 'entries'}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setVisitorPage(p => Math.max(1, p - 1))}
                                disabled={visitorPage === 1}
                                className="text-xs"
                            >
                                {t('common.prev') || 'Previous'}
                            </Button>
                            <span className="text-xs font-bold text-theme-primary px-2">
                                {visitorPage} / {visitorTotalPages}
                            </span>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setVisitorPage(p => Math.min(visitorTotalPages, p + 1))}
                                disabled={visitorPage === visitorTotalPages}
                                className="text-xs"
                            >
                                {t('common.next') || 'Next'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
