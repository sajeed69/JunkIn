const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a professional digital receipt for a scrap transaction.
 */
exports.generateReceipt = (transaction, user, kabadiwala) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const filename = `receipt_${transaction._id}.pdf`;
            const filePath = path.join(__dirname, '../../temp', filename);

            // Ensure temp dir exists
            if (!fs.existsSync(path.join(__dirname, '../../temp'))) {
                fs.mkdirSync(path.join(__dirname, '../../temp'));
            }

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Header
            doc.fillColor('#059669').fontSize(24).text('JunkIn Digital Receipt', { align: 'center' });
            doc.fillColor('#64748b').fontSize(10).text('Hybrid Circular Economy Platform', { align: 'center' });
            doc.moveDown();

            // Horizontal line
            doc.moveTo(50, 100).lineTo(550, 100).strokeColor('#e2e8f0').stroke();
            doc.moveDown(2);

            // Transaction Info
            doc.fillColor('#1e293b').fontSize(12);
            doc.text(`Receipt ID: ${transaction._id}`, { bold: true });
            doc.text(`Date: ${new Date(transaction.completedAt).toLocaleDateString()}`);
            doc.text(`Status: ${transaction.status.toUpperCase()}`);
            doc.moveDown();

            // Columns
            const startY = doc.y;
            doc.text('Customer Details', 50, startY, { underline: true });
            doc.text(user.name, 50, startY + 20);
            doc.text(user.email, 50, startY + 35);
            doc.text(transaction.pickupAddress, 50, startY + 50, { width: 200 });

            doc.text('Kabadiwala Details', 350, startY, { underline: true });
            doc.text(kabadiwala.name, 350, startY + 20);
            doc.text(kabadiwala.phone, 350, startY + 35);
            doc.moveDown(6);

            // Item Table
            const tableTop = 280;
            doc.fillColor('#f8fafc').rect(50, tableTop, 500, 25).fill();
            doc.fillColor('#475569').fontSize(10);
            doc.text('ITEM DESCRIPTION', 60, tableTop + 8);
            doc.text('WEIGHT', 250, tableTop + 8);
            doc.text('RATE', 350, tableTop + 8);
            doc.text('TOTAL', 450, tableTop + 8);

            doc.fillColor('#1e293b').fontSize(12);
            doc.text(transaction.material, 60, tableTop + 40);
            doc.text(`${transaction.weight} kg`, 250, tableTop + 40);
            doc.text(`₹${transaction.rate}/kg`, 350, tableTop + 40);
            doc.text(`₹${transaction.grossAmount}`, 450, tableTop + 40);

            // Footer line
            doc.moveTo(50, 350).lineTo(550, 350).strokeColor('#e2e8f0').stroke();

            // Calculation
            const calcY = 370;
            doc.text('Gross Amount:', 350, calcY);
            doc.text(`₹${transaction.grossAmount}`, 450, calcY);

            doc.text('Platform Commission (5%):', 350, calcY + 20);
            doc.text(`- ₹${transaction.commissionAmount}`, 450, calcY + 20);

            doc.fontSize(14).fillColor('#059669');
            doc.text('Net Earned:', 350, calcY + 50);
            doc.text(`₹${transaction.netAmount}`, 450, calcY + 50, { bold: true });

            // End
            doc.fillColor('#94a3b8').fontSize(8);
            doc.text('This is a computer-generated receipt. No signature required.', 50, 700, { align: 'center' });
            doc.text('Thank you for contributing to a cleaner planet!', 50, 715, { align: 'center' });

            doc.end();

            stream.on('finish', () => resolve(filePath));
            stream.on('error', (err) => reject(err));
        } catch (err) {
            reject(err);
        }
    });
};
