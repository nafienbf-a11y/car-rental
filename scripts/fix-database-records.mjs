import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read environment variables
const envFile = readFileSync(resolve(__dirname, '..', '.env'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.trim().split('=');
    if (key && valueParts.length) env[key] = valueParts.join('=');
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials missing in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Paths
const csvPath = 'C:\\Users\\NAFIE\\Desktop\\gatibi\\TEST-1-Sheet2.csv';

function formatLocalDate(d) {
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function fixDatabase() {
    console.log('📖 Reading CSV data...');
    let csvRows = [];
    try {
        const fileBuffer = readFileSync(csvPath);
        const workbook = XLSX.read(fileBuffer, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        csvRows = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: true });
    } catch (e) {
        console.error('❌ Failed to read CSV:', e.message);
        process.exit(1);
    }

    console.log('📡 Fetching database records...');
    const { data: dbBookings, error: bErr } = await supabase.from('bookings').select('*');
    const { data: dbClients, error: cErr } = await supabase.from('clients').select('*');
    const { data: dbVehicles, error: vErr } = await supabase.from('vehicles').select('*');

    if (bErr || cErr || vErr) {
        console.error('❌ Supabase fetch error:', bErr || cErr || vErr);
        process.exit(1);
    }

    // Step 1: Merge case-insensitive duplicate clients
    console.log('\n👥 Checking for duplicate client records...');
    const clientGroups = {}; // lowercase_name -> array of client records
    dbClients.forEach(c => {
        const key = c.name.trim().toLowerCase();
        if (!clientGroups[key]) clientGroups[key] = [];
        clientGroups[key].push(c);
    });

    const clientsToDelete = [];
    const clientRedirects = {}; // old_id -> new_id

    for (const [name, records] of Object.entries(clientGroups)) {
        if (records.length > 1) {
            console.log(`⚠️ Found ${records.length} records for client name: "${name}"`);
            // Choose the one with the earliest created_at or just the first one as primary
            const primary = records[0];
            console.log(`   Keeping primary ID: ${primary.id} ("${primary.name}")`);
            
            for (let i = 1; i < records.length; i++) {
                const duplicate = records[i];
                console.log(`   Marking duplicate for deletion: ${duplicate.id} ("${duplicate.name}")`);
                clientRedirects[duplicate.id] = primary.id;
                clientsToDelete.push(duplicate.id);
            }
        }
    }

    // Redirect bookings pointing to duplicate clients
    if (Object.keys(clientRedirects).length > 0) {
        console.log('\n🔄 Redirecting duplicate client bookings to primary accounts...');
        for (const [oldId, newId] of Object.entries(clientRedirects)) {
            const bookingsToUpdate = dbBookings.filter(b => b.client_id === oldId);
            console.log(`   Found ${bookingsToUpdate.length} bookings to transfer from ${oldId} to ${newId}`);
            for (const b of bookingsToUpdate) {
                const { error } = await supabase
                    .from('bookings')
                    .update({ client_id: newId })
                    .eq('id', b.id);
                if (error) {
                    console.error(`   ❌ Failed to update booking ${b.id}:`, error.message);
                } else {
                    console.log(`   ✅ Transferred booking ${b.id}`);
                    // Update local object so subsequent matching works
                    b.client_id = newId;
                }
            }
        }

        // Delete duplicate client records
        console.log('\n🗑️ Deleting duplicate client records from DB...');
        for (const id of clientsToDelete) {
            const { error } = await supabase.from('clients').delete().eq('id', id);
            if (error) {
                console.error(`   ❌ Failed to delete client ${id}:`, error.message);
            } else {
                console.log(`   ✅ Deleted client record ${id}`);
            }
        }
    } else {
        console.log('✅ No duplicate client records found or all merged.');
    }

    // Reload clients and rebuild map after merges
    const { data: updatedClients } = await supabase.from('clients').select('*');
    const clientsByNameMap = {};
    updatedClients.forEach(c => {
        clientsByNameMap[c.name.trim().toLowerCase()] = c;
    });

    const vehiclesByPlateMap = {};
    dbVehicles.forEach(v => {
        vehiclesByPlateMap[v.plate.trim().toLowerCase()] = v;
    });

    // Step 2: Correct booking prices
    console.log('\n💰 Correcting booking prices...');
    let fixCount = 0;
    const matchedBookings = new Set();

    for (let index = 0; index < csvRows.length; index++) {
        const row = csvRows[index];
        const rowNum = index + 2;
        const rawClientName = (row['Nom&Prenom'] || '').trim();
        const rawPlate = (row['Genre de voiture'] || '').trim();

        if (!rawClientName && !rawPlate) continue;

        let sDateRaw = row['start_date'];
        let eDateRaw = row['end_date'];
        let sDateFormatted = sDateRaw ? formatLocalDate(new Date(sDateRaw)) : null;
        let eDateFormatted = eDateRaw ? formatLocalDate(new Date(eDateRaw)) : null;

        const csvDailyPrice = parseFloat(row['price'] || 0);
        const csvTotalPrice = parseFloat(row['Prix Total'] || csvDailyPrice);

        const client = clientsByNameMap[rawClientName.toLowerCase()];
        const vehicle = vehiclesByPlateMap[rawPlate.toLowerCase()];

        if (!client || !vehicle) {
            console.log(`⚠️ Skipped Row ${rowNum}: client or vehicle not found in DB.`);
            continue;
        }

        // Match booking in DB
        const candidateBookings = dbBookings.filter(b => 
            b.client_id === client.id && 
            b.vehicle_id === vehicle.id && 
            !matchedBookings.has(b.id)
        );

        let bestMatch = null;
        let bestScore = -1;

        candidateBookings.forEach(b => {
            let score = 0;
            if (b.start_date === sDateFormatted) score += 2;
            if (b.end_date === eDateFormatted) score += 2;
            const dbVal = parseFloat(b.total_price);
            if (Math.abs(dbVal - csvTotalPrice) < 0.01) score += 1.5;
            else if (Math.abs(dbVal - csvDailyPrice) < 0.01) score += 1.0;
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = b;
            }
        });

        if (bestMatch && bestScore >= 1) {
            matchedBookings.add(bestMatch.id);
            const currentDbPrice = parseFloat(bestMatch.total_price);
            if (Math.abs(currentDbPrice - csvTotalPrice) > 0.01) {
                console.log(`🔧 Row ${rowNum} (${rawClientName}): Updating price from $${currentDbPrice} to $${csvTotalPrice}`);
                const { error } = await supabase
                    .from('bookings')
                    .update({ total_price: csvTotalPrice })
                    .eq('id', bestMatch.id);
                
                if (error) {
                    console.error(`   ❌ Failed to update price for booking ${bestMatch.id}:`, error.message);
                } else {
                    fixCount++;
                }
            }
        } else {
            console.log(`⚠️ Row ${rowNum} (${rawClientName} / ${rawPlate}): No matching database booking found to correct.`);
        }
    }

    console.log(`\n✨ Database fix complete! Updated ${fixCount} booking prices.`);
}

fixDatabase().catch(console.error);
