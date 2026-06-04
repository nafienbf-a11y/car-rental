import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Upload, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

const LegacyImportModal = ({ isOpen, onClose }) => {
    const { setVehicles, setClients, setBookings, vehicles } = useApp();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [stats, setStats] = useState(null);

    const addLog = (msg) => {
        setLogs(prev => [...prev, msg]);
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setError('');
            setSuccess(false);
            setLogs([]);
            setStats(null);
        }
    };

    const getColumnName = (row, possibleNames) => {
        const keys = Object.keys(row);
        for (const name of possibleNames) {
            for (const key of keys) {
                const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (cleanKey.includes(name)) return key;
            }
        }
        return null;
    };

    const generateId = () => {
        // Fallback random uuid just for linking logic if needed, though supabase returns true uuids
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const processFile = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);
        setLogs(['Starting import process...']);

        try {
            const data = await file.arrayBuffer();
            const XLSX = await import('xlsx');
            const workbook = XLSX.read(data, { cellDates: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: true });

            if (json.length === 0) {
                throw new Error("The file is empty or could not be read.");
            }

            addLog(`Found ${json.length} rows to process.`);

            // Caches for uniqueness
            const clientCache = {}; // name -> id
            const vehicleCache = {}; // brand -> id

            let clientsImported = 0;
            let vehiclesImported = 0;
            let bookingsImported = 0;

            // Step 1: Extract unique clients and vehicles
            const uniqueClients = new Set();
            const uniqueVehicles = new Set();

            const rowsToImport = [];

            json.forEach((row, index) => {
                // Ignore empty rows
                if (Object.values(row).every(v => !v)) return;

                const clientCol = getColumnName(row, ['nom', 'client', 'name', 'prenom']);
                const carCol = getColumnName(row, ['plate', 'matricule', 'license', 'plaque', 'car', 'voiture']);
                const startCol = getColumnName(row, ['start', 'debut', 'pickup', 'du']);
                const endCol = getColumnName(row, ['end', 'fin', 'dropoff', 'au']);
                const priceCol = getColumnName(row, ['prixtotal', 'totalprice', 'total', 'price', 'prix', 'amount']);

                // Extract client name
                let rawClientName = clientCol ? String(row[clientCol]).trim() : `Legacy Client ${index}`;
                if (!rawClientName) rawClientName = `Legacy Client ${index}`;
                
                // Format: First word is Name, rest is Surname
                let finalClientName = rawClientName;
                if (clientCol) {
                    const nameParts = rawClientName.split(' ').filter(Boolean);
                    if (nameParts.length > 1) {
                        const firstName = nameParts[0];
                        const lastName = nameParts.slice(1).join(' ');
                        finalClientName = `${firstName} ${lastName}`;
                    }
                }

                // Extract car plate
                let rawCarPlate = carCol ? String(row[carCol]).trim() : '';
                if (!rawCarPlate) return; // Skip row if no plate is provided since we can't link it

                uniqueClients.add(finalClientName);
                uniqueVehicles.add(rawCarPlate);

                rowsToImport.push({
                    rawClientName: finalClientName,
                    rawCarPlate,
                    startDate: startCol ? row[startCol] : new Date().toISOString(),
                    endDate: endCol ? row[endCol] : new Date().toISOString(),
                    price: priceCol ? parseFloat(row[priceCol]) || 0 : 0
                });
            });

            addLog(`Identified ${uniqueClients.size} unique clients and ${uniqueVehicles.size} unique vehicles.`);

            // Step 2: Insert Clients (checking for duplicates in DB first)
            addLog('Importing clients...');
            const { data: existingClients, error: clientsFetchError } = await supabase
                .from('clients')
                .select('id, name');
            if (clientsFetchError) throw clientsFetchError;

            const existingClientsMap = {};
            existingClients.forEach(c => {
                existingClientsMap[c.name.trim().toLowerCase()] = c.id;
            });

            for (const clientName of uniqueClients) {
                const lowerName = clientName.trim().toLowerCase();
                
                // Reuse existing client record if name matches case-insensitively
                if (existingClientsMap[lowerName]) {
                    clientCache[clientName] = existingClientsMap[lowerName];
                    continue;
                }

                // Reuse client ID from this same import batch if already processed under different casing
                const matchedCacheKey = Object.keys(clientCache).find(k => k.trim().toLowerCase() === lowerName);
                if (matchedCacheKey) {
                    clientCache[clientName] = clientCache[matchedCacheKey];
                    continue;
                }

                const { data, error } = await supabase.from('clients').insert([{
                    name: clientName,
                    email: 'legacy@import.com',
                    phone: '000000000',
                    notes: 'Imported from legacy data'
                }]).select('id').single();

                if (error) throw error;
                clientCache[clientName] = data.id;
                existingClientsMap[lowerName] = data.id;
                clientsImported++;
            }
            addLog(`Successfully imported ${clientsImported} new clients.`);

            // Step 3: Link Vehicles
            addLog('Linking vehicles by license plate...');
            uniqueVehicles.forEach(plate => {
                const existingVehicle = vehicles.find(v => v.plate.toLowerCase() === plate.toLowerCase());
                if (existingVehicle) {
                    vehicleCache[plate] = existingVehicle.id;
                    vehiclesImported++;
                } else {
                    addLog(`WARNING: No vehicle found with plate ${plate}`);
                }
            });
            addLog(`Successfully linked ${vehiclesImported} vehicles.`);

            // Step 4: Insert Bookings
            addLog('Importing bookings...');
            const bookingsToInsert = rowsToImport.map(row => {
                // Format dates safely
                let sDate = new Date();
                let eDate = new Date();
                try { if (row.startDate) sDate = new Date(row.startDate); } catch(e){}
                try { if (row.endDate) eDate = new Date(row.endDate); } catch(e){}

                if (isNaN(sDate.getTime())) sDate = new Date();
                if (isNaN(eDate.getTime())) eDate = new Date();

                // Safely format date using local time to avoid timezone shift
                const formatLocalDate = (d) => {
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                };

                return {
                    client_id: clientCache[row.rawClientName],
                    vehicle_id: vehicleCache[row.rawCarPlate],
                    start_date: formatLocalDate(sDate),
                    end_date: formatLocalDate(eDate),
                    total_price: row.price,
                    status: 'Completed', // Legacy bookings are usually completed
                    start_km: 0,
                    end_km: 0
                };
            });

            // Batch insert bookings
            const validBookingsToInsert = bookingsToInsert.filter(b => b.vehicle_id && b.client_id);
            if (validBookingsToInsert.length > 0) {
                const { error } = await supabase.from('bookings').insert(validBookingsToInsert);
                if (error) throw error;
                bookingsImported = validBookingsToInsert.length;
            }
            addLog(`Successfully imported ${bookingsImported} bookings.`);

            setStats({
                clients: clientsImported,
                vehicles: vehiclesImported,
                bookings: bookingsImported
            });

            addLog('Import process finished successfully!');
            setSuccess(true);

        } catch (err) {
            console.error(err);
            setError(`Error during import: ${err.message}`);
            addLog(`FAILED: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import Legacy Data">
            <div className="space-y-6">
                {!success ? (
                    <>
                        <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 space-y-4">
                            <p className="text-zinc-400 text-sm">
                                Upload your legacy Excel or CSV file. We will extract unique Clients and Vehicles, 
                                and recreate all past bookings. The ignored columns (payee, duration) will be skipped.
                            </p>
                            
                            <div className="flex flex-col gap-2">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    Select File (.csv, .xlsx)
                                </label>
                                <input
                                    type="file"
                                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20 transition-all cursor-pointer"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-xl flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-red-400 text-sm font-medium leading-relaxed">{error}</p>
                            </div>
                        )}

                        {logs.length > 0 && (
                            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 h-48 overflow-y-auto font-mono text-xs text-zinc-400 space-y-1">
                                {logs.map((log, i) => (
                                    <div key={i}>{'>'} {log}</div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={processFile} 
                                disabled={!file || loading}
                                icon={loading ? Loader2 : Upload}
                                className={loading ? 'animate-pulse' : ''}
                            >
                                {loading ? 'Processing...' : 'Start Import'}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col space-y-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                            <CheckCircle className="w-16 h-16 text-emerald-500" />
                            <div>
                                <h3 className="text-emerald-500 text-xl font-bold">Import Successful!</h3>
                                <p className="text-emerald-400/80 mt-2">All data has been properly mapped and imported.</p>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 w-full mt-6 bg-zinc-950 p-4 rounded-xl">
                                <div>
                                    <p className="text-3xl font-black text-white">{stats?.clients}</p>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Clients</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-white">{stats?.vehicles}</p>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Cars</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-white">{stats?.bookings}</p>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Bookings</p>
                                </div>
                            </div>
                        </div>

                        {logs.length > 0 && (
                            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 h-48 overflow-y-auto font-mono text-xs text-zinc-400 space-y-1">
                                {logs.map((log, i) => (
                                    <div key={i}>{'>'} {log}</div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button variant="primary" onClick={() => window.location.reload()}>
                                Close & Reload Data
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default LegacyImportModal;
