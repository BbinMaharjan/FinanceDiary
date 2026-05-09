const Transaction = require('../models/Transaction');
const ExcelJS = require('xlsx');
const jsPDF = require('jspdf');

const exportExcel = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { user: req.user._id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('category', 'name')
      .sort({ date: -1 });

    const data = transactions.map(t => ({
      Date: t.date.toISOString().split('T')[0],
      Title: t.title,
      Amount: t.amount,
      Type: t.type,
      Category: t.category?.name || 'N/A',
      'Payment Type': t.paymentType,
      Notes: t.notes || '',
    }));

    const workbook = ExcelJS.utils.book_new();
    const worksheet = ExcelJS.utils.json_to_sheet(data);
    ExcelJS.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    const buffer = ExcelJS.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.xlsx');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

const exportPDF = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { user: req.user._id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('category', 'name')
      .sort({ date: -1 });

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Transaction Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    let y = 40;
    doc.setFontSize(9);
    doc.text('Date', 14, y);
    doc.text('Title', 50, y);
    doc.text('Amount', 100, y);
    doc.text('Type', 130, y);
    doc.text('Category', 155, y);
    y += 6;

    doc.setDrawColor(200);
    doc.line(14, y - 3, 196, y - 3);

    transactions.forEach(t => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(t.date.toISOString().split('T')[0], 14, y);
      doc.text(t.title.substring(0, 18), 50, y);
      doc.text(String(t.amount), 100, y);
      doc.text(t.type, 130, y);
      doc.text(t.category?.name?.substring(0, 12) || 'N/A', 155, y);
      y += 5;
    });

    const buffer = Buffer.from(doc.output('arraybuffer'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = { exportExcel, exportPDF };
