const NEPALI_MONTHS = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra',
  'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra',
];

const MONTH_START_DATES = [
  [0, 0], [31, 0], [62, 0], [93, 0],
  [123, 0], [154, 0], [185, 0], [215, 0],
  [246, 0], [276, 0], [307, 0], [338, 0],
];

function toNepaliMonth(date) {
  const gregYear = date.getFullYear();
  const gregMonth = date.getMonth();
  const gregDay = date.getDate();

  const nepaliYear = gregYear - 57;
  let dayOfYear = Math.floor((new Date(gregYear, gregMonth, gregDay) - new Date(gregYear, 0, 0)) / 86400000);

  for (let i = 0; i < 12; i++) {
    const monthDays = (i === 1 && ((nepaliYear % 4 === 0 && nepaliYear % 100 !== 0) || nepaliYear % 400 === 0)) ? 29 : 28;
    const adjustedDays = monthDays + MONTH_START_DATES[i][0];
    const adjustedDayOfYear = dayOfYear + MONTH_START_DATES[i][1];
    if (adjustedDayOfYear < adjustedDays + (i === 1 ? 0 : MONTH_START_DATES[i][0])) {
      return { month: NEPALI_MONTHS[i], year: nepaliYear };
    }
    dayOfYear -= monthDays;
  }

  return { month: NEPALI_MONTHS[11], year: nepaliYear };
}

module.exports = { NEPALI_MONTHS, toNepaliMonth };
