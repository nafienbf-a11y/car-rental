import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

const FleetStatusChart = () => {
    const { vehicles, bookings, theme } = useApp();
    const { t } = useLanguage();

    const activeVehicleIds = new Set(bookings.filter(b => b.status === 'Active').map(b => b.vehicleId));
    
    const maintenanceCount = vehicles.filter(v => v.status === 'Maintenance').length;
    const rentedCount = vehicles.filter(v => v.status !== 'Maintenance' && activeVehicleIds.has(v.id)).length;
    const availableCount = vehicles.filter(v => v.status !== 'Maintenance' && v.status !== 'Deleted' && !activeVehicleIds.has(v.id)).length;

    const isDark = theme === 'dark';
    const neutralColor = isDark ? '#27272a' : '#cbd5e1';

    const data = [
        {
            name: t('dashboard.active'),
            value: availableCount,
            color: neutralColor
        },
        {
            name: t('fleet.rented'),
            value: rentedCount,
            color: '#2563eb'
        },
        {
            name: t('dashboard.maintenance'),
            value: maintenanceCount,
            color: '#dc2626'
        },
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-theme-popover p-4 rounded-xl border border-theme shadow-2xl transition-colors duration-300">
                    <p className="text-theme-secondary text-[10px] uppercase tracking-widest font-bold mb-1">{payload[0].name}</p>
                    <p className="font-bold text-theme-primary">
                        {payload[0].value} {t('dashboard.tooltips.vehicles')}
                    </p>
                    <p className="text-theme-tertiary text-[10px] font-bold mt-1 uppercase tracking-tight">
                        {((payload[0].value / vehicles.length) * 100).toFixed(1)}% {t('dashboard.tooltips.ofFleet')}
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }) => {
        return (
            <div className="flex justify-center gap-6 mt-6">
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-2.5 h-2.5 rounded-sm"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-theme-card border border-theme rounded-2xl p-6 shadow-2xl transition-colors duration-300">
            <h3 className="text-xl font-bold text-theme-primary mb-6">{t('dashboard.fleetStatus')}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default FleetStatusChart;
