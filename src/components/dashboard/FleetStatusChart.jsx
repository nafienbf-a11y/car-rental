import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useApp } from '../../context/AppContext';

const FleetStatusChart = () => {
    const { vehicles } = useApp();

    const data = [
        {
            name: 'Available',
            value: vehicles.filter(v => v.status === 'Available').length,
            color: '#27272a'
        },
        {
            name: 'Rented',
            value: vehicles.filter(v => v.status === 'Rented').length,
            color: '#2563eb'
        },
        {
            name: 'Maintenance',
            value: vehicles.filter(v => v.status === 'Maintenance').length,
            color: '#dc2626'
        },
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 shadow-2xl">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold mb-1">{payload[0].name}</p>
                    <p className="font-bold text-white">
                        {payload[0].value} vehicles
                    </p>
                    <p className="text-zinc-500 text-[10px] font-bold mt-1 uppercase tracking-tight">
                        {((payload[0].value / vehicles.length) * 100).toFixed(1)}% of fleet
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
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Fleet Status</h3>
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
