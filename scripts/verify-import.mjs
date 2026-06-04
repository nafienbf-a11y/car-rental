import { readFileSync, writeFileSync } from 'fs';
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

// Date formatter helper (exactly as used in import)
function formatLocalDate(d) {
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function verify() {
    console.log('Reading CSV...');
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

    console.log('Fetching database records...');
    const { data: dbBookings, error: bErr } = await supabase.from('bookings').select('*');
    const { data: dbClients, error: cErr } = await supabase.from('clients').select('*');
    const { data: dbVehicles, error: vErr } = await supabase.from('vehicles').select('*');

    if (bErr || cErr || vErr) {
        console.error('❌ Supabase fetch error:', bErr || cErr || vErr);
        process.exit(1);
    }

    const clientsMap = {};
    const clientsByNameMap = {};
    dbClients.forEach(c => {
        clientsMap[c.id] = c;
        clientsByNameMap[c.name.trim().toLowerCase()] = c;
    });

    const vehiclesMap = {};
    const vehiclesByPlateMap = {};
    dbVehicles.forEach(v => {
        vehiclesMap[v.id] = v;
        vehiclesByPlateMap[v.plate.trim().toLowerCase()] = v;
    });

    const matchedBookings = new Set();
    const discrepancies = [];
    const matchedList = [];

    csvRows.forEach((row, index) => {
        const rowNum = index + 2;
        const rawClientName = (row['Nom&Prenom'] || '').trim();
        const rawPlate = (row['Genre de voiture'] || '').trim();
        
        let sDateRaw = row['start_date'];
        let eDateRaw = row['end_date'];
        
        let sDateFormatted = null;
        let eDateFormatted = null;
        
        if (sDateRaw) {
            const d = new Date(sDateRaw);
            sDateFormatted = formatLocalDate(d);
        }
        if (eDateRaw) {
            const d = new Date(eDateRaw);
            eDateFormatted = formatLocalDate(d);
        }

        const csvDailyPrice = parseFloat(row['price'] || 0);
        const csvTotalPrice = parseFloat(row['Prix Total'] || csvDailyPrice);

        if (!rawClientName && !rawPlate) return;

        const client = clientsByNameMap[rawClientName.toLowerCase()];
        const vehicle = vehiclesByPlateMap[rawPlate.toLowerCase()];

        if (!client) {
            discrepancies.push({
                rowNum,
                client: rawClientName,
                plate: rawPlate,
                type: 'Missing Client in DB',
                details: `Client "${rawClientName}" not found in DB.`
            });
            return;
        }

        if (!vehicle) {
            discrepancies.push({
                rowNum,
                client: rawClientName,
                plate: rawPlate,
                type: 'Missing Vehicle in DB',
                details: `Vehicle plate "${rawPlate}" not found in DB.`
            });
            return;
        }

        // Find candidate bookings
        const candidateBookings = dbBookings.filter(b => 
            b.client_id === client.id && 
            b.vehicle_id === vehicle.id && 
            !matchedBookings.has(b.id)
        );

        if (candidateBookings.length === 0) {
            discrepancies.push({
                rowNum,
                client: rawClientName,
                plate: rawPlate,
                type: 'No matching Booking in DB',
                details: `No booking records exist for Client "${rawClientName}" and Plate "${rawPlate}".`
            });
            return;
        }

        // Score candidates based on closeness of dates and price
        let bestMatch = null;
        let bestScore = -1;

        candidateBookings.forEach(b => {
            let score = 0;
            if (b.start_date === sDateFormatted) score += 2;
            if (b.end_date === eDateFormatted) score += 2;
            // Compare price: check if it matches either daily rate or total price (since imported price might have been wrong)
            const dbVal = parseFloat(b.total_price);
            if (Math.abs(dbVal - csvTotalPrice) < 0.01) score += 1.5;
            else if (Math.abs(dbVal - csvDailyPrice) < 0.01) score += 1.0; // matched wrong column
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = b;
            }
        });

        if (!bestMatch || bestScore < 1) {
            discrepancies.push({
                rowNum,
                client: rawClientName,
                plate: rawPlate,
                type: 'Unmatched Dates/Prices',
                details: `Booking candidates exist, but none align with CSV dates (${sDateFormatted} to ${eDateFormatted}) and price (${csvTotalPrice}). DB candidates: ${candidateBookings.map(b => `${b.start_date} to ${b.end_date} (Price: ${b.total_price})`).join(', ')}`
            });
            return;
        }

        matchedBookings.add(bestMatch.id);

        const dbStart = bestMatch.start_date;
        const dbEnd = bestMatch.end_date;
        const dbPrice = parseFloat(bestMatch.total_price);

        const errors = [];
        if (dbStart !== sDateFormatted) {
            errors.push(`Start Date: DB has "${dbStart}", CSV has "${sDateFormatted}"`);
        }
        if (dbEnd !== eDateFormatted) {
            errors.push(`End Date: DB has "${dbEnd}", CSV has "${eDateFormatted}"`);
        }
        if (Math.abs(dbPrice - csvTotalPrice) > 0.01) {
            errors.push(`Total Price: DB has ${dbPrice}, CSV expected ${csvTotalPrice} (CSV Daily Rate was ${csvDailyPrice})`);
        }

        matchedList.push({
            rowNum,
            client: rawClientName,
            plate: rawPlate,
            csvStart: sDateFormatted,
            csvEnd: eDateFormatted,
            csvPrice: csvTotalPrice,
            dbStart,
            dbEnd,
            dbPrice,
            errors
        });
    });

    const unmatchedDbBookings = dbBookings.filter(b => !matchedBookings.has(b.id));

    // Construct markdown report
    let md = `# Database vs CSV Verification Report\n\n`;
    md += `Generated on: ${new Date().toLocaleString()}\n\n`;
    md += `## Summary\n\n`;
    md += `- **Total Rows in CSV**: ${csvRows.length}\n`;
    md += `- **Successfully Matched bookings**: ${matchedList.length}\n`;
    md += `- **Bookings with Discrepancies (matched but wrong values)**: ${matchedList.filter(m => m.errors.length > 0).length}\n`;
    md += `- **Rows with Critical Mismatch (no DB record found)**: ${discrepancies.length}\n`;
    md += `- **Orphan DB bookings (in DB but not in CSV)**: ${unmatchedDbBookings.length}\n\n`;

    md += `## Critical Issues (No matching Booking in Database)\n\n`;
    if (discrepancies.length === 0) {
        md += `*No critical matching errors found.*\n\n`;
    } else {
        md += `| CSV Row | Client | Plate | Mismatch Type | Details |\n`;
        md += `|---|---|---|---|---|\n`;
        discrepancies.forEach(d => {
            md += `| ${d.rowNum} | ${d.client} | ${d.plate} | **${d.type}** | ${d.details} |\n`;
        });
        md += `\n`;
    }

    md += `## Data Discrepancies (Matched Bookings with wrong details)\n\n`;
    const rowsWithErrors = matchedList.filter(m => m.errors.length > 0);
    if (rowsWithErrors.length === 0) {
        md += `*No discrepancies found for matched bookings.*\n\n`;
    } else {
        md += `| CSV Row | Client | Plate | CSV Dates | DB Dates | CSV Total Price | DB Total Price | Issues |\n`;
        md += `|---|---|---|---|---|---|---|---|\n`;
        rowsWithErrors.forEach(m => {
            md += `| ${m.rowNum} | ${m.client} | ${m.plate} | ${m.csvStart} to ${m.csvEnd} | ${m.dbStart} to ${m.dbEnd} | ${m.csvPrice} | ${m.dbPrice} | ${m.errors.join('; ')} |\n`;
        });
        md += `\n`;
    }

    md += `## Orphan Database Bookings (Exist in DB but not in CSV)\n\n`;
    if (unmatchedDbBookings.length === 0) {
        md += `*No orphan database bookings found.*\n\n`;
    } else {
        md += `| Booking ID | Client | Plate | Dates | Price |\n`;
        md += `|---|---|---|---|---|\n`;
        unmatchedDbBookings.forEach(b => {
            const client = clientsMap[b.client_id];
            const vehicle = vehiclesMap[b.vehicle_id];
            md += `| \`${b.id}\` | ${client ? client.name : 'Unknown'} | ${vehicle ? vehicle.plate : 'Unknown'} | ${b.start_date} to ${b.end_date} | ${b.total_price} |\n`;
        });
        md += `\n`;
    }

    writeFileSync(resolve(__dirname, '..', 'verification_report.md'), md);
    console.log('✅ Generated verification_report.md successfully.');
}

verify().catch(console.error);
