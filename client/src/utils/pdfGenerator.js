import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateReportPDF = (reportData, period) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Mess Report - ${period}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Prepare Data for Table
    // Columns: Member, Regular (Spent/Share/Bal), Guest (Spent/Share/Bal), Shared (Spent/Share/Bal), Final Balance

    const tableColumn = [
        "Member",
        "Regular (Bal)",
        "Guest (Bal)",
        "Shared (Bal)",
        "Final Balance"
    ];

    const tableRows = [];

    reportData.forEach(member => {
        const rowData = [
            member.name,
            `${member.regular.balance > 0 ? '+' : ''}${member.regular.balance}`,
            `${member.guest.balance > 0 ? '+' : ''}${member.guest.balance}`,
            `${member.shared.balance > 0 ? '+' : ''}${member.shared.balance}`,
            `${member.totalBalance > 0 ? '+' : ''}${member.totalBalance} SAR`
        ];
        tableRows.push(rowData);
    });

    // Generate Table
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [0, 128, 128] }, // Teal color
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold' },
            4: { fontStyle: 'bold', halign: 'right' }
        }
    });

    // Summary Section (Optional, if needed)
    // const finalY = doc.lastAutoTable.finalY || 40;
    // doc.text("Summary...", 14, finalY + 10);

    // Save
    doc.save(`Mess_Report_${period.replace(/\s/g, '_')}.pdf`);
};
