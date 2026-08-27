import jsPDF from 'jspdf';

/**
 * Generate a PDF document for a car rental contract
 * @param {Object} contract - Contract details object
 * @param {Object} client - Client object
 * @param {Object} vehicle - Vehicle object
 * @param {Object} booking - Booking object
 * @param {boolean} download - Whether to trigger browser download
 * @returns {jsPDF} doc - The jsPDF instance
 */
export const generateContractPDF = ({ contract, client, vehicle, booking }, download = true) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 18;

    // Helper for adding horizontal lines
    const addDivider = (yPos) => {
        doc.setDrawColor(220, 220, 225);
        doc.setLineWidth(0.4);
        doc.line(margin, yPos, pageWidth - margin, yPos);
    };

    // --- HEADER ---
    doc.setFillColor(15, 23, 42); // Slate dark primary
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('CAR RENTAL AGREEMENT', margin, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contractNoStr = `Contract #: ${contract?.contractNumber || 'N/A'}`;
    const contractNoWidth = doc.getTextWidth(contractNoStr);
    doc.text(contractNoStr, pageWidth - margin - contractNoWidth, 14);

    const dateStr = `Date: ${new Date(contract?.createdAt || Date.now()).toLocaleDateString()}`;
    const dateWidth = doc.getTextWidth(dateStr);
    doc.text(dateStr, pageWidth - margin - dateWidth, 20);

    y = 36;

    // Status Banner
    const isSigned = contract?.status === 'Signed';
    doc.setFillColor(isSigned ? 220 : 254, isSigned ? 252 : 243, isSigned ? 231 : 199); // light green or light amber
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 10, 2, 2, 'F');

    doc.setTextColor(isSigned ? 22 : 180, isSigned ? 101 : 83, isSigned ? 52 : 9); // green or amber text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const statusText = `STATUS: ${isSigned ? 'SIGNED & EXECUTED' : 'PENDING CLIENT SIGNATURE'}`;
    doc.text(statusText, margin + 4, y + 6.5);

    if (isSigned && contract?.signedAt) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        const signedOnText = `Signed on: ${new Date(contract.signedAt).toLocaleString()}`;
        const sWidth = doc.getTextWidth(signedOnText);
        doc.text(signedOnText, pageWidth - margin - 4 - sWidth, y + 6.5);
    }

    y += 18;

    // --- SECTION 1: CLIENT & VEHICLE DETAILS (2 COLUMNS) ---
    const colWidth = (pageWidth - (margin * 2) - 8) / 2;

    // Left Column: Client Info
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, colWidth, 48, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, colWidth, 48, 2, 2, 'D');

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CLIENT DETAILS', margin + 4, y + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Full Name: ${client?.name || 'N/A'}`, margin + 4, y + 16);
    doc.text(`Phone: ${client?.phone || 'N/A'}`, margin + 4, y + 22);
    doc.text(`Email: ${client?.email || 'N/A'}`, margin + 4, y + 28);
    doc.text(`CIN / Passport: ${client?.cinPassport || client?.cin_passport || 'N/A'}`, margin + 4, y + 34);
    doc.text(`Driver License: ${client?.licenseNumber || client?.license_number || 'N/A'}`, margin + 4, y + 40);

    // Right Column: Vehicle Info
    const rightColX = margin + colWidth + 8;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(rightColX, y, colWidth, 48, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(rightColX, y, colWidth, 48, 2, 2, 'D');

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('VEHICLE DETAILS', rightColX + 4, y + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Vehicle: ${vehicle?.brand || ''} ${vehicle?.model || 'N/A'} (${vehicle?.year || ''})`, rightColX + 4, y + 16);
    doc.text(`License Plate: ${vehicle?.plate || 'N/A'}`, rightColX + 4, y + 22);
    doc.text(`Category: ${vehicle?.category || 'Standard'}`, rightColX + 4, y + 28);
    doc.text(`Transmission: ${vehicle?.transmission || 'Automatic'}`, rightColX + 4, y + 34);
    doc.text(`Fuel Type: ${vehicle?.fuel || 'Petrol'}`, rightColX + 4, y + 40);

    y += 56;

    // --- SECTION 2: RENTAL RESERVATION DETAILS ---
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 34, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 34, 2, 2, 'D');

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('RESERVATION & PRICING SUMMARY', margin + 4, y + 8);

    const startDateStr = booking?.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A';
    const endDateStr = booking?.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A';
    
    // Calculate total days
    let days = 1;
    if (booking?.startDate && booking?.endDate) {
        const diffMs = new Date(booking.endDate) - new Date(booking.startDate);
        days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Start Date: ${startDateStr}`, margin + 4, y + 16);
    doc.text(`End Date: ${endDateStr}`, margin + 4, y + 22);
    doc.text(`Duration: ${days} day(s)`, margin + 4, y + 28);

    doc.text(`Rate / Day: $${vehicle?.pricePerDay || vehicle?.price_per_day || 0}`, margin + 85, y + 16);
    doc.text(`Total Amount: $${booking?.totalCost || booking?.total_price || 0}`, margin + 85, y + 22);
    doc.text(`Security Deposit: $${booking?.securityDeposit || booking?.security_deposit || 0}`, margin + 85, y + 28);

    y += 42;

    // --- SECTION 3: TERMS & CONDITIONS ---
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TERMS & CONDITIONS', margin, y);

    y += 5;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);

    const termsLines = [
        "1. Vehicle Condition & Return: The client acknowledges receiving the vehicle in excellent operating condition and agrees to return it on the specified date with the same fuel level.",
        "2. Driving Restrictions: The vehicle must only be driven by the registered client with a valid driver's license. Illegal use, off-road driving, or racing is strictly prohibited.",
        "3. Security Deposit & Damage Policy: The security deposit will be refunded upon safe return of the vehicle. Any damage, traffic fines, or missing equipment will be deducted accordingly.",
        "4. Insurance & Liability: Third-party insurance coverage applies. Client is fully responsible for damages caused by negligence, unauthorized drivers, or violation of traffic laws."
    ];

    termsLines.forEach(line => {
        const splitText = doc.splitTextToSize(line, pageWidth - (margin * 2));
        doc.text(splitText, margin, y);
        y += (splitText.length * 3.5) + 1;
    });

    y += 8;
    addDivider(y);
    y += 10;

    // --- SECTION 4: SIGNATURES AREA ---
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('SIGNATURES & EXECUTION', margin, y);

    y += 8;

    const sigBoxWidth = colWidth;
    const sigBoxHeight = 32;

    // Helper to get image format (PNG/JPEG)
    const getImageFormat = (dataUrl) => {
        if (typeof dataUrl === 'string' && (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg'))) {
            return 'JPEG';
        }
        return 'PNG';
    };

    // Extract admin stamp & signature with fallback to snapshotData
    const adminStamp = contract?.adminStamp || contract?.snapshotData?.adminStamp || null;
    const adminSignature = contract?.adminSignature || contract?.snapshotData?.adminSignature || null;

    // Agency Signature Box
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, sigBoxWidth, sigBoxHeight, 2, 2, 'D');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Lessor / Rental Agency', margin + 4, y + 6);
    
    let hasAdminAuth = false;
    
    if (adminStamp) {
        try {
            hasAdminAuth = true;
            const props = doc.getImageProperties(adminStamp);
            const ratio = Math.min((sigBoxWidth / 2 - 8) / props.width, (sigBoxHeight - 14) / props.height);
            const w = props.width * ratio;
            const h = props.height * ratio;
            const x = margin + 4; 
            const yOffset = y + 8 + ((sigBoxHeight - 14) - h) / 2;
            doc.addImage(adminStamp, getImageFormat(adminStamp), x, yOffset, w, h);
        } catch (e) {
            console.error("Error embedding admin stamp image into PDF:", e);
        }
    }
    
    if (adminSignature) {
        try {
            hasAdminAuth = true;
            const props = doc.getImageProperties(adminSignature);
            const ratio = Math.min((sigBoxWidth / 2 - 8) / props.width, (sigBoxHeight - 14) / props.height);
            const w = props.width * ratio;
            const h = props.height * ratio;
            const x = margin + (sigBoxWidth / 2);
            const yOffset = y + 8 + ((sigBoxHeight - 14) - h) / 2;
            doc.addImage(adminSignature, getImageFormat(adminSignature), x, yOffset, w, h);
        } catch (e) {
            console.error("Error embedding admin signature image into PDF:", e);
        }
    }
    
    if (!hasAdminAuth) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text('(Authorized Stamp & Signature)', margin + 4, y + 24);
    }

    // Client Signature Box
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(rightColX, y, sigBoxWidth, sigBoxHeight, 2, 2, 'D');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Client Digital Signature', rightColX + 4, y + 6);

    const clientSig = contract?.signatureData || contract?.snapshotData?.signatureData;

    if (clientSig) {
        try {
            const props = doc.getImageProperties(clientSig);
            const ratio = Math.min((sigBoxWidth - 12) / props.width, (sigBoxHeight - 14) / props.height);
            const w = props.width * ratio;
            const h = props.height * ratio;
            const x = rightColX + 6 + ((sigBoxWidth - 12) - w) / 2;
            const yOffset = y + 8 + ((sigBoxHeight - 14) - h) / 2;
            doc.addImage(clientSig, getImageFormat(clientSig), x, yOffset, w, h);
        } catch (e) {
            console.error("Error embedding signature image into PDF:", e);
        }
    } else {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text('[ Signature Pending Client Link ]', rightColX + 4, y + 18);
    }

    // Download or output data URI
    if (download) {
        doc.save(`Contract_${contract?.contractNumber || 'rental'}.pdf`);
    }

    return doc;
};
